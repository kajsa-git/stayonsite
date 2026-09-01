import { Resend } from "resend";
import { and, eq, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import {
  buildCorporateQualificationEmail,
  corporateQualificationRecipient,
  type CorporateQualificationSubmissionLike,
} from "./corporate-qualification-email";
import { addDaysYmd, todayStockholm } from "./date";
import { db } from "./db";
import {
  gmailAutomationUserId,
  gmailGetThread,
  gmailSearchThreadIds,
  gmailSend,
  type GmailMessage,
} from "./gmail";
import { companies, contacts, emails, notes, requestQualifications, requests } from "./schema";

const MODEL = "claude-sonnet-4-6";
const CRM_MAILBOX = process.env.CRM_FROM ?? "kajsa@stayonsite.se";

type CorporateCrmResult = {
  company: { id: string; name: string };
  contact: { id: string; email?: string | null } | null;
  request: { id: string; requestNumber?: number | null; city?: string | null; persons?: number | null };
};

export const qualificationExtractionSchema = z.object({
  startDate: z.string().nullable(),
  startDateText: z.string().nullable(),
  endDate: z.string().nullable(),
  durationMonths: z.number().int().positive().nullable(),
  durationText: z.string().nullable(),
  location: z.string().nullable(),
  accommodationType: z.string().nullable(),
  persons: z.number().int().positive().nullable(),
  bedrooms: z.number().int().nonnegative().nullable(),
  beds: z.number().int().positive().nullable(),
  parkingRequired: z.boolean().nullable(),
  kitchenRequired: z.boolean().nullable(),
  laundryRequired: z.boolean().nullable(),
  budgetMonthly: z.number().nonnegative().nullable(),
  budgetText: z.string().nullable(),
  startAnswered: z.boolean(),
  durationAnswered: z.boolean(),
  locationAnswered: z.boolean(),
  accommodationTypeAnswered: z.boolean(),
  capacityAnswered: z.boolean(),
  requirementsAnswered: z.boolean(),
  budgetAnswered: z.boolean(),
  declined: z.boolean(),
  summary: z.string().min(1),
  relevantQuote: z.string().nullable(),
  confidence: z.number().min(0).max(1),
});

export type QualificationExtraction = z.infer<typeof qualificationExtractionSchema>;

const FLEXIBLE_ACCOMMODATION_PATTERNS = [
  /\b(?:öppen (?:för|till)|vilket som|valfri(?:t)?|ingen preferens|spelar ingen roll)\b/i,
  /\b(?:open to any|any(?:thing| type)? (?:works|is fine)|no preference|either works)\b/i,
  /\b(?:dowoln(?:y|a|e)|bez preferencji|każd(?:y|a|e) rodzaj)\b/i,
];

// Flexibilitet är ett användbart svar, inte ett saknat svar. Reservregeln gör
// vardagliga formuleringar begripliga även om AI-modellen är onödigt bokstavlig.
export function applyQualificationSemanticFallbacks(
  parsed: QualificationExtraction,
  reply: string,
): QualificationExtraction {
  const flexibleAccommodation = FLEXIBLE_ACCOMMODATION_PATTERNS.some((pattern) => pattern.test(reply));
  if (!flexibleAccommodation) return parsed;
  return {
    ...parsed,
    accommodationType: parsed.accommodationType ?? "Flexibel – valfri boendetyp",
    accommodationTypeAnswered: true,
  };
}

function emailAddress(value: string): string {
  return value.match(/<([^>]+)>/)?.[1]?.trim().toLowerCase() ?? value.trim().toLowerCase();
}

function normalizeSubject(value: string): string {
  return value.replace(/^\s*((re|sv|fw|fwd):\s*)+/gi, "").trim().toLowerCase();
}

export function stripQuotedReply(text: string): string {
  const markers = [
    /^On .+wrote:\s*$/im,
    /^Den .+skrev .+:\s*$/im,
    /^Dnia .+napisał(?:a)?:\s*$/im,
    /^From:\s.+$/im,
    /^Från:\s.+$/im,
    /^Od:\s.+$/im,
    /^-{2,}\s*Original Message\s*-{2,}$/im,
  ];
  let end = text.length;
  for (const marker of markers) {
    const index = text.search(marker);
    if (index >= 0) end = Math.min(end, index);
  }
  return text
    .slice(0, end)
    .split("\n")
    .filter((line) => !line.trimStart().startsWith(">"))
    .join("\n")
    .trim();
}

export function qualificationIsComplete(parsed: QualificationExtraction, existingPersons?: number | null): boolean {
  return !parsed.declined
    && parsed.confidence >= 0.8
    && parsed.startAnswered
    && parsed.durationAnswered
    && parsed.locationAnswered
    && parsed.accommodationTypeAnswered
    && parsed.capacityAnswered
    && parsed.requirementsAnswered
    && parsed.budgetAnswered
    && Boolean(parsed.persons ?? existingPersons);
}

function nextBusinessDay(from: string): string {
  let date = addDaysYmd(from, 1);
  while ([0, 6].includes(new Date(`${date}T12:00:00Z`).getUTCDay())) date = addDaysYmd(date, 1);
  return date;
}

function followUpSlot(now = new Date()): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Stockholm",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const weekday = parts.find((part) => part.type === "weekday")?.value;
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 17);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  const today = todayStockholm();
  if (!new Set(["Sat", "Sun"]).has(weekday ?? "") && (hour < 16 || (hour === 16 && minute <= 15))) {
    const rounded = Math.min(16 * 60 + 30, Math.ceil((hour * 60 + minute + 30) / 15) * 15);
    return { date: today, time: `${String(Math.floor(rounded / 60)).padStart(2, "0")}:${String(rounded % 60).padStart(2, "0")}` };
  }
  return { date: nextBusinessDay(today), time: "09:00" };
}

function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("Claude returnerade inte JSON.");
  return JSON.parse(text.slice(start, end + 1));
}

async function extractQualificationReply(args: {
  reply: string;
  locale: string;
  city: string | null;
  persons: number | null;
}): Promise<QualificationExtraction> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY saknas i Vercel.");

  const prompt = `Du extraherar ett kundsvar till StayOnSite, ett seriöst svenskt företag för projektboenden. Kunden kan svara på svenska, engelska eller polska.

Kända uppgifter från ursprungsförfrågan:
- Ort: ${args.city ?? "okänd"}
- Antal personer: ${args.persons ?? "okänt"}
- Formulärets språk: ${args.locale}
- Dagens svenska datum: ${todayStockholm()}

Regler:
- Tolka bara kundens nya svar, aldrig citerad tidigare mejltext.
- Hitta inte på. Saknas ett värde ska det vara null och motsvarande *Answered vara false.
- Om kunden uttryckligen säger att budget saknas/är öppen är budgetAnswered true, budgetMonthly null och budgetText återger innebörden.
- Om kunden säger att valfri ort/hela staden fungerar är locationAnswered true.
- Om kunden är öppen för vilken boendetyp som helst (t.ex. "vilket som", "open to any" eller "dowolny") är accommodationTypeAnswered true och accommodationType beskriver att boendetypen är flexibel.
- Om kunden säger att inga särskilda krav finns är requirementsAnswered true och kravfälten false.
- Om budgeten anges som ett intervall ska budgetMonthly vara intervallets övre gräns och budgetText återge hela intervallet.
- Datum ska vara YYYY-MM-DD när de går att fastställa säkert. Annars null och originalet i *Text.
- confidence gäller hur säkert svaret hör till och beskriver denna boendeförfrågan.
- declined är true bara när kunden tackar nej, avbryter eller säger att behovet inte längre finns.

Returnera ENDAST giltig JSON med exakt dessa fält:
{"startDate":null,"startDateText":null,"endDate":null,"durationMonths":null,"durationText":null,"location":null,"accommodationType":null,"persons":null,"bedrooms":null,"beds":null,"parkingRequired":null,"kitchenRequired":null,"laundryRequired":null,"budgetMonthly":null,"budgetText":null,"startAnswered":false,"durationAnswered":false,"locationAnswered":false,"accommodationTypeAnswered":false,"capacityAnswered":false,"requirementsAnswered":false,"budgetAnswered":false,"declined":false,"summary":"","relevantQuote":null,"confidence":0}

Kundens nya svar:
"""${args.reply.slice(0, 12000)}"""`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1800,
      thinking: { type: "disabled" },
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!response.ok) throw new Error(`Claude API ${response.status}: ${(await response.text()).slice(0, 250)}`);
  const data = await response.json() as { content?: Array<{ type: string; text?: string }> };
  const text = (data.content ?? []).filter((block) => block.type === "text").map((block) => block.text ?? "").join("");
  const parsed = qualificationExtractionSchema.parse(extractJson(text));
  return applyQualificationSemanticFallbacks(parsed, args.reply);
}

function compactSummary(parsed: QualificationExtraction): string {
  const rows = [
    parsed.startDate || parsed.startDateText ? `Start: ${parsed.startDate ?? parsed.startDateText}` : "Start: saknas",
    parsed.endDate || parsed.durationText || parsed.durationMonths ? `Längd/slut: ${parsed.endDate ?? parsed.durationText ?? `${parsed.durationMonths} månader`}` : "Längd/slut: saknas",
    parsed.location ? `Område/arbetsplats: ${parsed.location}` : "Område/arbetsplats: saknas",
    parsed.accommodationType ? `Boendetyp: ${parsed.accommodationType}` : "Boendetyp: saknas",
    parsed.persons ? `Personer: ${parsed.persons}` : null,
    parsed.bedrooms != null ? `Sovrum: ${parsed.bedrooms}` : null,
    parsed.beds != null ? `Bäddar: ${parsed.beds}` : null,
    parsed.requirementsAnswered
      ? `Krav: parkering ${parsed.parkingRequired ? "ja" : "nej"}, kök ${parsed.kitchenRequired ? "ja" : "nej"}, tvätt ${parsed.laundryRequired ? "ja" : "nej"}`
      : "Krav: saknas",
    parsed.budgetAnswered ? `Budget: ${parsed.budgetMonthly != null ? `${parsed.budgetMonthly} kr/mån` : parsed.budgetText ?? "öppen/ej angiven"}` : "Budget: saknas",
  ].filter(Boolean);
  return rows.join("\n");
}

export async function sendCorporateQualificationEmail(args: {
  submission: CorporateQualificationSubmissionLike;
  crmResult: CorporateCrmResult | null;
}): Promise<{ sent: boolean; provider?: "gmail" | "resend"; error?: string }> {
  const recipient = corporateQualificationRecipient(args.submission);
  if (!recipient || !args.crmResult) return { sent: false, error: "not_eligible" };
  const { company, contact, request } = args.crmResult;
  const built = buildCorporateQualificationEmail(args.submission);
  const existing = await db.query.requestQualifications.findFirst({
    where: (row, { eq }) => eq(row.requestId, request.id),
  });
  if (existing?.sentAt) return { sent: true, provider: existing.provider === "gmail" ? "gmail" : "resend" };

  const now = new Date().toISOString();
  await db.insert(requestQualifications).values({
    requestId: request.id,
    companyId: company.id,
    contactId: contact?.id ?? null,
    locale: args.submission.locale ?? "sv",
    subject: built.subject,
    status: "sending",
    updatedAt: now,
  }).onConflictDoUpdate({
    target: requestQualifications.requestId,
    set: { status: "sending", subject: built.subject, lastError: null, updatedAt: now },
  });

  let provider: "gmail" | "resend";
  let providerMessageId: string;
  let gmailMessageId: string | null = null;
  let gmailThreadId: string | null = null;
  let authorId: string | null = null;
  try {
    try {
      authorId = await gmailAutomationUserId(CRM_MAILBOX);
      const result = await gmailSend(authorId, {
        from: `Kajsa Sihlén <${emailAddress(CRM_MAILBOX)}>`,
        to: recipient,
        subject: built.subject,
        text: built.text,
        html: built.html,
      });
      provider = "gmail";
      providerMessageId = result.messageId;
      gmailMessageId = result.messageId;
      gmailThreadId = result.threadId;
    } catch (gmailError) {
      console.error("Automatic qualification Gmail send failed; trying Resend fallback", gmailError);
      const resend = new Resend(process.env.RESEND_API_KEY);
      const result = await resend.emails.send({
        from: process.env.RESEND_FROM || "StayOnSite <onboarding@resend.dev>",
        to: recipient,
        replyTo: emailAddress(CRM_MAILBOX),
        subject: built.subject,
        text: built.text,
        html: built.html,
      });
      if (result.error || !result.data?.id) throw new Error(result.error?.message ?? "Resend returnerade inget meddelande-id.");
      provider = "resend";
      providerMessageId = result.data.id;
    }

    const stateStatus = args.submission.formType === "project-brief" ? "complete" : "pending";
    const followUpDate = nextBusinessDay(todayStockholm());
    await db.transaction(async (tx) => {
      await tx.insert(emails).values({
        id: nanoid(),
        companyId: company.id,
        requestId: request.id,
        contactId: contact?.id ?? null,
        direction: "out",
        subject: built.subject,
        body: built.text,
        html: built.html,
        fromEmail: emailAddress(CRM_MAILBOX),
        toEmail: recipient,
        authorId,
        resendId: provider === "resend" ? providerMessageId : null,
        gmailMessageId,
        gmailThreadId,
        isRead: true,
        sentAt: now,
      }).onConflictDoNothing();
      await tx.update(requestQualifications).set({
        status: stateStatus,
        provider,
        providerMessageId,
        gmailMessageId,
        gmailThreadId,
        sentAt: now,
        attemptCount: 0,
        lastError: null,
        updatedAt: now,
      }).where(eq(requestQualifications.requestId, request.id));
      await tx.insert(notes).values({
        id: nanoid(),
        companyId: company.id,
        channel: "mejl",
        content: [
          `Kvalificeringsmejl skickat automatiskt ${todayStockholm()} till ${recipient}.`,
          `Förfrågan: #${request.requestNumber ?? request.id}`,
          `Leverans: ${provider}${gmailThreadId ? ` · Gmail-tråd ${gmailThreadId}` : " · svar söks via kontaktadress"}`,
          "",
          built.crmNote,
        ].join("\n"),
        source: "crm",
      });
      await tx.update(companies).set({
        followUpDate,
        followUpReason: stateStatus === "complete" ? "Projektbrief inkommet – granska" : "Väntar svar på kvalificeringsmejl",
        followUpTime: "09:00",
        updatedAt: now,
      }).where(eq(companies.id, company.id));
    });
    return { sent: true, provider };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await db.update(requestQualifications).set({
      status: "failed",
      lastError: message.slice(0, 1000),
      attemptCount: (existing?.attemptCount ?? 0) + 1,
      updatedAt: new Date().toISOString(),
    }).where(eq(requestQualifications.requestId, request.id));
    await db.insert(notes).values({
      id: nanoid(),
      companyId: company.id,
      channel: "mejl",
      content: `Automatiskt kvalificeringsmejl kunde inte skickas för förfrågan #${request.requestNumber ?? request.id}. Manuell uppföljning krävs. Fel: ${message.slice(0, 300)}`,
      source: "crm",
    });
    await db.update(companies).set({
      followUpDate: todayStockholm(),
      followUpReason: "Kvalificeringsmejl misslyckades – skicka manuellt",
      followUpTime: "09:00",
      updatedAt: new Date().toISOString(),
    }).where(eq(companies.id, company.id));
    return { sent: false, error: message };
  }
}

function isAutomatic(message: GmailMessage): boolean {
  const from = message.from.toLowerCase();
  return Boolean(message.autoSubmitted && message.autoSubmitted.toLowerCase() !== "no")
    || /bulk|list|junk/i.test(message.precedence)
    || /no-?reply|mailer-daemon|postmaster|bounce/i.test(from);
}

async function processQualificationReply(
  state: typeof requestQualifications.$inferSelect,
  message: GmailMessage,
  replyContext?: string,
): Promise<"complete" | "partial" | "declined"> {
  const [request] = await db.select().from(requests).where(eq(requests.id, state.requestId)).limit(1);
  if (!request) throw new Error(`Förfrågan ${state.requestId} saknas.`);
  const reply = replyContext?.trim() || stripQuotedReply(message.text || "");
  if (!reply) throw new Error("Kundsvaret saknar läsbart textinnehåll.");
  const parsed = await extractQualificationReply({
    reply,
    locale: state.locale,
    city: request.city,
    persons: request.persons,
  });
  if (parsed.confidence < 0.6) throw new Error(`Svaret kunde inte kopplas säkert till behovet (confidence ${parsed.confidence}).`);

  const complete = qualificationIsComplete(parsed, request.persons);
  const status = parsed.declined ? "declined" : complete ? "complete" : "partial";
  const now = new Date().toISOString();
  const slot = followUpSlot();
  const gmailUrl = `https://mail.google.com/mail/u/0/#all/${message.threadId}`;
  const requestPatch: Partial<typeof requests.$inferInsert> = {};
  if (parsed.startDate) requestPatch.startDate = parsed.startDate;
  if (parsed.endDate) requestPatch.endDate = parsed.endDate;
  if (parsed.durationMonths) requestPatch.projectDurationMonths = parsed.durationMonths;
  if (parsed.location) requestPatch.addressQuery = parsed.location;
  if (parsed.accommodationType) requestPatch.accommodationType = parsed.accommodationType;
  if (parsed.persons) requestPatch.persons = parsed.persons;
  if (parsed.bedrooms != null) requestPatch.bedroomsFrom = requestPatch.bedroomsTo = parsed.bedrooms;
  if (parsed.beds != null) requestPatch.bedsFrom = requestPatch.bedsTo = parsed.beds;
  if (parsed.requirementsAnswered) {
    requestPatch.parkingRequired = parsed.parkingRequired ?? false;
    requestPatch.kitchenRequired = parsed.kitchenRequired ?? false;
    requestPatch.laundryRequired = parsed.laundryRequired ?? false;
  }
  if (parsed.budgetMonthly != null) requestPatch.budgetMax = parsed.budgetMonthly;
  if (complete && request.status === "incoming") {
    requestPatch.status = "matching";
    requestPatch.statusChangedAt = now;
  }

  await db.transaction(async (tx) => {
    await tx.insert(emails).values({
      id: nanoid(),
      companyId: state.companyId,
      requestId: state.requestId,
      contactId: state.contactId,
      direction: "in",
      subject: message.subject,
      body: reply,
      html: message.html,
      fromEmail: message.from,
      toEmail: message.to,
      gmailMessageId: message.id,
      gmailThreadId: message.threadId,
      isRead: false,
      sentAt: message.date ? new Date(message.date).toISOString() : now,
    }).onConflictDoNothing();
    await tx.update(requests).set({ ...requestPatch, updatedAt: now }).where(eq(requests.id, state.requestId));
    await tx.insert(notes).values({
      id: nanoid(),
      companyId: state.companyId,
      channel: "mejl",
      content: [
        "Svar på kvalificeringsmejl mottaget",
        `Datum/tid: ${message.date || now}`,
        `Avsändare: ${message.from}`,
        `Gmail: ${gmailUrl}`,
        `Förfrågan: #${request.requestNumber ?? state.requestId} · ${request.city ?? "ort saknas"}`,
        `Bedömning: ${parsed.declined ? "kunden avböjer/har inget kvarvarande behov" : complete ? "komplett nog för matchning" : "ofullständigt – behåll incoming"}`,
        "",
        compactSummary(parsed),
        "",
        `Övrigt: ${parsed.summary}`,
        parsed.relevantQuote ? `Kort utdrag: ”${parsed.relevantQuote.slice(0, 350)}”` : null,
      ].filter(Boolean).join("\n"),
      source: "crm",
    });
    await tx.update(requestQualifications).set({
      status,
      gmailThreadId: state.gmailThreadId ?? message.threadId,
      lastProcessedMessageId: message.id,
      lastReplyAt: message.date ? new Date(message.date).toISOString() : now,
      attemptCount: 0,
      lastError: null,
      updatedAt: now,
    }).where(eq(requestQualifications.requestId, state.requestId));
    await tx.update(companies).set({
      followUpDate: slot.date,
      followUpTime: slot.time,
      followUpReason: parsed.declined
        ? "Kvalificeringssvar: kunden avböjer – granska"
        : complete
          ? "Kvalificeringssvar inkommet – granska/matcha"
          : "Kvalificeringssvar ofullständigt – följ upp",
      updatedAt: now,
    }).where(eq(companies.id, state.companyId));
  });
  return status;
}

export async function runCorporateQualificationReplySweep(): Promise<{
  checked: number;
  replies: number;
  complete: number;
  partial: number;
  declined: number;
  errors: number;
}> {
  const states = await db.select().from(requestQualifications)
    .where(inArray(requestQualifications.status, ["pending", "partial"]))
    .limit(100);
  if (!states.length) return { checked: 0, replies: 0, complete: 0, partial: 0, declined: 0, errors: 0 };
  const userId = await gmailAutomationUserId(CRM_MAILBOX);
  const summary = { checked: states.length, replies: 0, complete: 0, partial: 0, declined: 0, errors: 0 };

  for (const state of states) {
    try {
      const [contact] = state.contactId
        ? await db.select({ email: contacts.email }).from(contacts).where(eq(contacts.id, state.contactId)).limit(1)
        : [];
      let threadIds = state.gmailThreadId ? [state.gmailThreadId] : [];
      if (!threadIds.length && contact?.email) threadIds = await gmailSearchThreadIds(userId, contact.email);
      const relevantMessages: GmailMessage[] = [];
      for (const threadId of threadIds) {
        const messages = await gmailGetThread(userId, threadId);
        for (const message of messages) {
          const sentAfterQualification = !state.sentAt || new Date(message.date).getTime() > new Date(state.sentAt).getTime();
          const fromCustomer = emailAddress(message.from) !== emailAddress(CRM_MAILBOX);
          const subjectMatches = Boolean(state.gmailThreadId) || normalizeSubject(message.subject) === normalizeSubject(state.subject);
          if (sentAfterQualification && fromCustomer && subjectMatches && !isAutomatic(message)) {
            relevantMessages.push(message);
          }
        }
      }
      relevantMessages.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const newest = relevantMessages[relevantMessages.length - 1];
      if (newest && newest.id !== state.lastProcessedMessageId) {
        const context = relevantMessages
          .filter((message) => message.threadId === newest.threadId)
          .map((message, index) => `Kundsvar ${index + 1}:\n${stripQuotedReply(message.text)}`)
          .join("\n\n");
        const result = await processQualificationReply(state, newest, context);
        summary.replies++;
        summary[result]++;
      }
    } catch (error) {
      summary.errors++;
      const message = error instanceof Error ? error.message : String(error);
      await db.update(requestQualifications).set({
        attemptCount: state.attemptCount + 1,
        lastError: message.slice(0, 1000),
        updatedAt: new Date().toISOString(),
      }).where(and(eq(requestQualifications.requestId, state.requestId), eq(requestQualifications.status, state.status)));
      console.error("Qualification reply sweep failed", { requestId: state.requestId, error: message });
    }
  }
  return summary;
}
