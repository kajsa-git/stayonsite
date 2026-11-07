// Modellsteget: läser kontext + playbook och föreslår tolkning, nästa steg och svar.
// Förslaget går alltid genom policy.ts innan något skickas.
import { z } from "zod";
import type { ModelDecision } from "./policy";
import { formatConversation, type PartyContext } from "./context";

export const DEFAULT_MODEL = "claude-sonnet-5-5";
const FALLBACK_MODEL = "claude-sonnet-4-6";

export function engineModel(): string {
  return process.env.REPLY_ENGINE_MODEL?.trim() || DEFAULT_MODEL;
}

const decisionSchema = z.object({
  partyRole: z.string().default("okänd"),
  intent: z.string().default(""),
  stage: z.string().default(""),
  outcomeGoal: z.string().default(""),
  nextStep: z.string().nullable().default(null),
  needsReply: z.boolean().default(false),
  reply: z.string().nullable().default(null),
  replySubject: z.string().nullable().default(null),
  routine: z.boolean().default(false),
  confidence: z.coerce.number().min(0).max(1).catch(0),
  riskFlags: z.array(z.string()).default([]),
  handover: z.boolean().default(false),
  handoverReason: z.string().nullable().default(null),
  followUpInHours: z.coerce.number().nullable().catch(null).default(null),
  followUpReason: z.string().nullable().default(null),
  kajsaTask: z.string().nullable().default(null),
  summary: z.string().default(""),
});

export const ENGINE_RULES = `Du är Kajsa Sihléns svarsassistent på StayOnSite. StayOnSite ordnar möblerat företagsboende (hus och lägenheter) åt bygg-, industri-, energi- och montageföretag som har personal på annan ort. Bostäderna kommer från privata husägare och fastighetsägare (uthyrare). StayOnSite äger inte bostäderna. Hyresperioden är minst tre månader. Kajsa nås på 076-249 84 86 och kajsa@stayonsite.se.

Du skriver som Kajsa, i jag-form, i samma kanal och på samma språk som kontakten (svenska, engelska eller polska). Varm, personlig och tydlig. Korta stycken. Inte säljig och inte inställsam; hellre en rak, vänlig fråga än en passiv omskrivning. SMS/WhatsApp: kort, 1–4 meningar. Mejl: kort. Hälsning och avslut som i playbooken (finns ingen: "Mvh Kajsa" i SMS, "Vänliga hälsningar, Kajsa" i mejl, "Kind regards, Kajsa" på engelska).

Målet är att varje kontakt rör sig mot rätt utfall:
- Företag som söker boende: tydlig förfrågan (ort/arbetsplats, startdatum, period, antal personer, sovrum/bäddar, budget, företagsnamn) → boendeförslag → beslut → avtal → inflytt → nöjd vistelse → förlängning eller nytt uppdrag → Google-recension.
- Husägare som vill hyra ut: intresse → uppgifter och bilder via https://www.stayonsite.se/registrera-bostad → publiceringsmedgivande → publicerad bostad → matchning mot förfrågan → villkor → uthyrd.
- Pågående uthyrning (hyresgäst eller uthyrare): lös praktiska frågor snabbt; allt som rör skador, klagomål, pengar eller avtal går till Kajsa.

Ett rutinsvar (routine=true) är bara: kvittens och tack, en fråga efter saknad uppgift, en länk till StayOnSites egna sidor, upprepning av fakta som redan står i kontexten, eller ett vänligt avslut. Ett rutinsvar lovar aldrig något som Kajsa inte redan har lovat.

Aldrig i ett svar: priser eller belopp, avtals- eller betalningsvillkor, löften om att en bostad är ledig eller bokad, löften om datum, uppgifter som inte står i kontexten, adresser till bostäder, interna anteckningar eller skattningar. Om svaret skulle kräva något av detta: sätt handover=true, skriv ändå ett förslag till svar som Kajsa kan redigera, och beskriv vad hon behöver göra i kajsaTask.

kajsaTask är bara för något Kajsa själv måste göra snart (t.ex. "skicka boendeförslag", "ta fram avtalsutkast", "uppdatera att internet ingår"). Högst en kort mening. Att vänta på kontakten är ingen uppgift – det sköts med followUpInHours. Säger svaret att Kajsa återkommer med något, ska kajsaTask säga vad.

riskFlags väljs bland: price, contract, payment, availability_promise, date_promise, complaint, legal, personal_sensitive, new_commitment, unclear, emotional.

followUpInHours: om vi ställer en fråga eller väntar på något från kontakten, hur många timmar vi ska vänta innan en vänlig påminnelse (het förfrågan 3–6 h, vanlig 24–48 h, uthyrare 24–72 h). null om ingen uppföljning behövs.

needsReply=false när meddelandet bara är ett "ok/tack/👍", när Kajsa redan har svarat på det senaste, eller när det inte förtjänar ett svar.

Skriv partyRole, intent, stage, outcomeGoal, nextStep, kajsaTask och summary på svenska och kort (några ord, högst en mening). kajsaTask bara när Kajsa faktiskt behöver göra något.

Om playbooken nedan och dessa regler säger olika saker gäller dessa regler.`;

export function buildDecisionPrompt(args: {
  ctx: PartyContext;
  channel: "sms" | "whatsapp" | "email";
  inbound: { text: string; subject?: string | null; at: string };
  playbook: string;
  corrections: string;
  nowText: string;
  mode: "reply" | "followup";
  followUp?: { lastMessage: string; reason: string | null };
}): string {
  const task = args.mode === "followup"
    ? `UPPGIFT: Vi skickade ett meddelande och har inte fått svar. Senast skickat: """${args.followUp?.lastMessage ?? ""}""" Anledning till uppföljning: ${args.followUp?.reason ?? "okänd"}.
Bedöm om en kort, vänlig påminnelse är rätt nu (needsReply) eller om ärendet ska till Kajsa (handover). Påminnelsen får inte vara påträngande och ska inte upprepa hela frågan ordagrant.`
    : `UPPGIFT: Ett nytt meddelande har kommit in via ${args.channel}${args.inbound.subject ? ` med ämnet "${args.inbound.subject}"` : ""}:
"""${args.inbound.text.slice(0, 6000)}"""
Tolka det, bestäm nästa steg mot rätt utfall och skriv vid behov ett svar.`;

  return `${ENGINE_RULES}

${args.playbook.trim() ? `# Kajsas playbook (lärt från tidigare konversationer – följ den)\n${args.playbook.trim().slice(0, 12000)}\n` : ""}
${args.corrections.trim() ? `# Kajsas senaste rättelser av motorns förslag (lär av dem)\n${args.corrections.trim().slice(0, 4000)}\n` : ""}
# Nu
${args.nowText}

# Kontakten i CRM:et
Typ: ${args.ctx.partyType}
${args.ctx.text || "(ingen ytterligare information i CRM)"}

# Konversation (äldst först, alla kanaler)
${formatConversation(args.ctx.conversation)}

${task}

Returnera ENDAST giltig JSON:
{"partyRole":"","intent":"","stage":"","outcomeGoal":"","nextStep":null,"needsReply":false,"reply":null,"replySubject":null,"routine":false,"confidence":0,"riskFlags":[],"handover":false,"handoverReason":null,"followUpInHours":null,"followUpReason":null,"kajsaTask":null,"summary":""}`;
}

function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("Modellen returnerade inte JSON.");
  return JSON.parse(text.slice(start, end + 1));
}

export async function callClaude(prompt: string, opts: { maxTokens?: number; model?: string } = {}): Promise<{ text: string; model: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY saknas.");
  const models = [opts.model ?? engineModel(), FALLBACK_MODEL].filter((m, i, a) => a.indexOf(m) === i);
  let lastError = "";
  for (const model of models) {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model,
        max_tokens: opts.maxTokens ?? 4000,
        thinking: { type: "disabled" },
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (response.ok) {
      const data = await response.json() as { content?: Array<{ type: string; text?: string }>; stop_reason?: string };
      // Ett avklippt svar får aldrig användas – varken som playbook eller som kundsvar.
      if (data.stop_reason === "max_tokens") throw new Error("Modellens svar blev avklippt (max_tokens).");
      return { text: (data.content ?? []).filter((b) => b.type === "text").map((b) => b.text ?? "").join(""), model };
    }
    lastError = `Claude API ${response.status}: ${(await response.text()).slice(0, 250)}`;
    // Bara ett okänt modellnamn är skäl att prova reservmodellen.
    if (response.status !== 404 && response.status !== 400) break;
  }
  throw new Error(lastError);
}

export function parseDecision(text: string): ModelDecision {
  const parsed = decisionSchema.parse(extractJson(text));
  return {
    ...parsed,
    reply: parsed.reply?.trim() ? parsed.reply.trim() : null,
    replySubject: parsed.replySubject?.trim() || null,
  } as ModelDecision;
}

export async function decide(prompt: string): Promise<{ decision: ModelDecision; model: string }> {
  const { text, model } = await callClaude(prompt, { maxTokens: 4000 });
  return { decision: parseDecision(text), model };
}
