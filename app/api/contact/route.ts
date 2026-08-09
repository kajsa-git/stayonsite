import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { mapWebSubmissionToCrm, type WebSubmission } from "@/lib/crm/contact-intake";
import { loadLandlordStanding } from "@/lib/crm/deal-projection";
import { ensureShareLink } from "@/lib/crm/share-links";

// Node-runtime route handler. Importing @/lib/crm/* directly lets Next.js bundle
// the CRM intake into the function — the old standalone api/contact.ts function
// could not resolve the cross-boundary dynamic import under ESM on Vercel
// ("Cannot find module .../src/lib/crm/contact-intake"), so CRM intake always failed.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const CONTACT_TO = process.env.CONTACT_FORM_TO || "kajsa@stayonsite.se";

// --- Validation ---

function isValidEmail(v: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function isValidPhone(v: string) { return /^[\d\s()+-]{6,50}$/.test(v); }
function isValidContact(v: string) { return isValidEmail(v) || isValidPhone(v); }

const LOCALES = ["sv", "en", "pl"] as const;

const base = {
  locale: z.enum(LOCALES),
  page: z.string().min(1).max(200),
  source: z.string().max(100).optional(),
  startedAt: z.number().int().positive(),
  website: z.string().max(200).optional(),
  utmParams: z.record(z.string(), z.string()).optional(),
};

const submissionSchema = z.discriminatedUnion("formType", [
  // Legacy hero-intent: ort + antal_personer + kontakt (used by Index, CityPage)
  z.object({ ...base, formType: z.literal("hero-intent"), fields: z.union([
    z.object({
      ort: z.string().min(2).max(100),
      antal_personer: z.string().regex(/^\d{1,3}$/),
      kontakt: z.string().min(3).max(200).refine(isValidContact),
    }),
    z.object({
      ort: z.string().min(2).max(100),
      antal_personer: z.string().regex(/^\d{1,4}$/),
      email: z.string().min(3).max(200).refine(isValidEmail),
      phone: z.string().min(6).max(50).refine(isValidPhone),
    }),
    // Foretag two-step form: city + people + company + email + optional phone.
    // Must come before the phone-required variant — zod tries union options in
    // order and the older variant would match-and-strip the company key.
    z.object({
      city: z.string().min(2).max(100),
      people: z.string().regex(/^\d{1,4}$/),
      company: z.string().min(1).max(200),
      email: z.string().min(3).max(200).refine(isValidEmail),
      phone: z.string().min(6).max(50).refine(isValidPhone).optional(),
    }),
    // New foretag conversion form: city + people + email + phone
    z.object({
      city: z.string().min(2).max(100),
      people: z.string().regex(/^\d{1,4}$/),
      email: z.string().min(3).max(200).refine(isValidEmail),
      phone: z.string().min(6).max(50).refine(isValidPhone),
    }),
  ])}),
  z.object({ ...base, formType: z.literal("inquiry"), fields: z.object({
    email: z.string().min(3).max(200).refine(isValidEmail),
    phone: z.string().min(6).max(50).refine(isValidPhone),
    message: z.string().min(10).max(4000),
  })}),
  // Homeowner: supports both old (phone+city) and new (name+email+phone+bedrooms+postalCode)
  z.object({ ...base, formType: z.literal("homeowner"), fields: z.union([
    z.object({
      phone: z.string().min(6).max(50).refine(isValidPhone),
      city: z.string().min(2).max(100),
    }),
    z.object({
      name: z.string().min(1).max(200),
      email: z.string().min(3).max(200).refine(isValidEmail),
      phone: z.string().min(6).max(50).refine(isValidPhone),
      bedrooms: z.string().regex(/^\d{1,2}$/),
      postalCode: z.string().min(3).max(10),
    }),
  ])}),
  z.object({ ...base, formType: z.literal("lp-homeowner"), fields: z.object({
    phone: z.string().min(6).max(50).refine(isValidPhone),
    city: z.string().min(2).max(100),
  })}),
  // Corporate housing paid LP (English): company + email + phone + city + people
  z.object({ ...base, formType: z.literal("lp-corporate"), fields: z.object({
    company: z.string().min(1).max(200),
    email: z.string().min(3).max(200).refine(isValidEmail),
    phone: z.string().min(6).max(50).refine(isValidPhone),
    city: z.string().min(2).max(100),
    people: z.string().regex(/^\d{1,4}$/),
  })}),
]);

type Submission = z.infer<typeof submissionSchema>;

// --- Email building ---

const FORM_LABELS: Record<string, string> = {
  "hero-intent": "Snabbförfrågan",
  "inquiry": "Kontaktformulär",
  "homeowner": "Husägarformulär",
  "lp-homeowner": "Husägarformulär (LP)",
  "lp-corporate": "Företagsförfrågan (engelsk LP)",
};

function getSubject(s: Submission): string {
  if (s.formType === "hero-intent") {
    const f = s.fields as Record<string, string>;
    const city = f.ort || f.city || "";
    const people = f.antal_personer || f.people || "";
    if (f.company) return `Snabbförfrågan: ${f.company} – ${city} – ${people} pers`;
    return `Snabbförfrågan: ${city} – ${people} pers`;
  }
  if (s.formType === "inquiry") return "Ny förfrågan från StayOnSite";
  if (s.formType === "lp-homeowner") return "Ny husägare via Facebook-annons";
  if (s.formType === "lp-corporate") {
    const f = s.fields as Record<string, string>;
    return `Företagslead (engelsk annons): ${f.company || ""} – ${f.city || ""}`.trim();
  }
  return "Ny husägare-registrering från StayOnSite";
}

function esc(v: string) { return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

function buildEmail(s: Submission, ip?: string, ua?: string, crmOk = true, crmError?: string) {
  const fields = s.fields as Record<string, string>;
  const subject = getSubject(s);
  const now = new Intl.DateTimeFormat("sv-SE", { dateStyle: "medium", timeStyle: "medium", timeZone: "Europe/Stockholm" }).format(new Date());

  const rows = (rec: Record<string, string>) => Object.entries(rec).filter(([, v]) => v).map(([k, v]) =>
    `<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;">${esc(k)}</td><td style="padding:8px 12px;border:1px solid #e5e7eb;">${esc(v)}</td></tr>`
  ).join("");

  const meta: Record<string, string> = {
    formulär: FORM_LABELS[s.formType] || s.formType,
    sida: s.page,
    språk: s.locale,
    mottagen: now,
  };
  if (s.source) meta.källa = s.source;
  if (ip) meta.ip = ip;
  if (ua) meta["user-agent"] = ua;
  if (s.utmParams && Object.keys(s.utmParams).length) {
    meta.utm = Object.entries(s.utmParams).map(([k, v]) => `${k}=${v}`).join(", ");
  }

  const crmWarnText = crmOk ? "" : `⚠️ OBS: Kunde INTE läggas in i CRM automatiskt — lägg in leadet manuellt.${crmError ? `\nFel: ${crmError}` : ""}\n\n`;
  const crmWarnHtml = crmOk
    ? ""
    : `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px 16px;margin:0 0 16px;color:#991b1b;font-weight:600;">⚠️ Kunde inte läggas in i CRM automatiskt — lägg in leadet manuellt.${crmError ? `<br><code style="font-size:12px;font-weight:400;">${esc(crmError)}</code>` : ""}</div>`;

  const text = [crmWarnText + subject, "", ...Object.entries(fields).map(([k, v]) => `${k}: ${v}`), "", ...Object.entries(meta).map(([k, v]) => `${k}: ${v}`)].join("\n");

  const html = `<div style="font-family:Arial,sans-serif;color:#111827;line-height:1.5;">
    ${crmWarnHtml}
    <h1 style="font-size:20px;margin:0 0 16px;">${esc(subject)}</h1>
    <h2 style="font-size:16px;margin:24px 0 8px;">Insända uppgifter</h2>
    <table style="border-collapse:collapse;width:100%;max-width:720px;">${rows(fields)}</table>
    <h2 style="font-size:16px;margin:24px 0 8px;">Metadata</h2>
    <table style="border-collapse:collapse;width:100%;max-width:720px;">${rows(meta)}</table>
  </div>`;

  const replyTo = s.formType === "inquiry" ? (s.fields as { email: string }).email : undefined;

  // Find customer email for confirmation
  let customerEmail: string | undefined;
  const f = s.fields as Record<string, string>;
  if (f.email && isValidEmail(f.email)) {
    customerEmail = f.email;
  } else if (s.formType === "hero-intent" && f.kontakt && isValidEmail(f.kontakt)) {
    customerEmail = f.kontakt;
  }

  return { subject, text, html, replyTo, customerEmail };
}

function buildConfirmationEmail(s: Submission): { subject: string; text: string; html: string } {
  const pl = s.locale === "pl";

  // Primary language block (sv default, pl if Polish)
  const primary = pl ? {
    greeting: "Cześć!",
    body: "Dziękujemy za kontakt. Otrzymaliśmy Twoje zapytanie i odezwiemy się w ciągu <strong>24 godzin</strong> z konkretną propozycją.",
    badge: "Czas odpowiedzi: do 24 godzin",
    urgent: "Potrzebujesz szybszej odpowiedzi? Zadzwoń bezpośrednio:",
    signoff: "Pozdrawiam",
    title: "Założycielka, StayOnSite",
    footer: "Otrzymałeś ten e-mail, ponieważ wypełniłeś formularz na stayonsite.se",
  } : {
    greeting: "Hej!",
    body: "Tack för att du hörde av dig. Vi har tagit emot din förfrågan och återkommer till dig <strong>inom 24 timmar</strong> med ett konkret förslag.",
    badge: "Svarstid: inom 24 timmar",
    urgent: "Behöver du svar snabbare? Ring oss direkt:",
    signoff: "Med vänliga hälsningar",
    title: "Grundare, StayOnSite",
    footer: "Du fick detta mejl för att du fyllt i ett formulär på stayonsite.se",
  };

  // English always shown as secondary
  const en = {
    greeting: "Hi!",
    body: "Thank you for reaching out. We have received your inquiry and will get back to you <strong>within 24 hours</strong> with a concrete proposal.",
    badge: "Response time: within 24 hours",
    urgent: "Need a faster response? Call us directly:",
    signoff: "Best regards",
    title: "Founder, StayOnSite",
    footer: "You received this email because you filled out a form on stayonsite.se",
  };

  const showSecondary = s.locale !== "en";

  const subject = pl
    ? "Otrzymaliśmy Twoje zapytanie – StayOnSite"
    : s.locale === "en"
    ? "We received your inquiry – StayOnSite"
    : "Vi har fått din förfrågan / We received your inquiry – StayOnSite";

  const text = [
    `${primary.greeting} / ${en.greeting}`, "",
    primary.body.replace(/<[^>]+>/g, ""),
    en.body.replace(/<[^>]+>/g, ""), "",
    primary.urgent, en.urgent, "076-249 84 86", "",
    `${primary.signoff},\nKajsa Sihlén\n${primary.title}`, "",
    "076-249 84 86", "kajsa@stayonsite.se", "www.stayonsite.se",
  ].join("\n");

  const secondaryBlock = (svText: string, enText: string, isHtml = false) =>
    showSecondary
      ? `<p style="margin:6px 0 0;font-size:13px;line-height:1.6;color:#9ca3af;font-style:italic;">${isHtml ? enText : esc(enText)}</p>`
      : "";

  const html = `<!DOCTYPE html>
<html lang="${s.locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
  <tr><td align="center">
    <table role="presentation" width="100%" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

      <!-- Header / Logo -->
      <tr>
        <td style="background:#0f1c2e;padding:28px 40px;">
          <span style="font-family:'Playfair Display',Georgia,'Times New Roman',serif;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Stay<span style="color:#ff6300;">On</span>Site</span>
          <p style="margin:6px 0 0;font-size:11px;color:rgba(255,255,255,0.4);letter-spacing:1.5px;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;">Worker accommodation across Sweden</p>
        </td>
      </tr>

      <!-- Orange accent bar -->
      <tr><td style="background:#ff6300;height:4px;font-size:0;line-height:0;">&nbsp;</td></tr>

      <!-- Body -->
      <tr>
        <td style="padding:40px 40px 32px;">

          <!-- Greeting -->
          <p style="margin:0 0 24px;font-size:18px;font-weight:700;color:#0f1c2e;">
            ${esc(primary.greeting)}${showSecondary ? ` <span style="color:#9ca3af;font-weight:400;font-size:16px;">/ ${esc(en.greeting)}</span>` : ""}
          </p>

          <!-- Body text -->
          <p style="margin:0 0 6px;font-size:15px;line-height:1.7;color:#374151;">${primary.body}</p>
          ${secondaryBlock(primary.body, en.body, true)}

          <!-- 24h badge -->
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;">
            <tr>
              <td style="background:#fff7f0;border:1px solid #fed7aa;border-radius:8px;padding:14px 20px;">
                <span style="font-size:14px;color:#92400e;font-weight:600;">⏱ ${esc(primary.badge)}</span>
                ${showSecondary ? `<br><span style="font-size:12px;color:#b45309;font-style:italic;">${esc(en.badge)}</span>` : ""}
              </td>
            </tr>
          </table>

          <!-- Urgent CTA -->
          <p style="margin:0 0 4px;font-size:14px;color:#6b7280;">${esc(primary.urgent)}</p>
          ${secondaryBlock(primary.urgent, en.urgent)}
          <a href="tel:+46762498486" style="display:inline-block;margin-top:12px;background:#ff6300;color:#ffffff;font-size:15px;font-weight:700;padding:12px 28px;border-radius:50px;text-decoration:none;">📞 076-249 84 86</a>
        </td>
      </tr>

      <!-- Divider -->
      <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid #e5e7eb;margin:0;"></td></tr>

      <!-- Signoff -->
      <tr>
        <td style="padding:28px 40px 36px;">
          <p style="margin:0 0 2px;font-size:14px;color:#6b7280;">
            ${esc(primary.signoff)}${showSecondary ? ` / <span style="font-style:italic;">${esc(en.signoff)}</span>` : ""},
          </p>
          <p style="margin:0 0 2px;font-size:15px;font-weight:700;color:#0f1c2e;">Kajsa Sihlén</p>
          <p style="margin:0 0 16px;font-size:13px;color:#9ca3af;">
            ${esc(primary.title)}${showSecondary ? ` / ${esc(en.title)}` : ""}
          </p>
          <p style="margin:0;font-size:13px;color:#9ca3af;line-height:2;">
            <a href="tel:+46762498486" style="color:#ff6300;text-decoration:none;">076-249 84 86</a><br>
            <a href="mailto:kajsa@stayonsite.se" style="color:#ff6300;text-decoration:none;">kajsa@stayonsite.se</a><br>
            <a href="https://www.stayonsite.se" style="color:#ff6300;text-decoration:none;">www.stayonsite.se</a>
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#f9fafb;padding:16px 40px;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center;">
            StayOnSite · 17165 Solna<br>
            ${esc(primary.footer)}${showSecondary ? `<br><span style="font-style:italic;">${esc(en.footer)}</span>` : ""}
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;

  return { subject, text, html };
}

// --- Handler ---

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const result = submissionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ success: false, error: "invalid_submission" }, { status: 400 });
    }

    const submission = result.data;

    if (submission.website && submission.website.trim()) {
      return NextResponse.json({ success: false, error: "spam_detected" }, { status: 400 });
    }

    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0]?.trim() : undefined;

    // CRM intake must never break email delivery (the critical path). A DB/scrape
    // failure is caught here and surfaced as a warning in the notification email.
    let crmError: string | undefined;
    let crmResult: Awaited<ReturnType<typeof mapWebSubmissionToCrm>> | null = null;
    try {
      crmResult = await mapWebSubmissionToCrm(submission as WebSubmission);
    } catch (err) {
      crmError = err instanceof Error ? err.message : String(err);
      console.error("CRM intake mapping failed", err);
    }

    // Del 2 för husägarformuläret: privatpersoner får uthyrningsuppdraget direkt
    // i formuläret (samma flöde och länktyp som /registrera-bostad — påminnelse-
    // cronen plockar upp osignerade automatiskt). LP-formuläret (lp-homeowner) är
    // medvetet undantaget: annonstrafik ska inte auto-påminnas utan Kajsas beslut.
    // Får aldrig fälla mejlvägen — leadet är redan sparat.
    let agreement: { token: string; alreadySigned: boolean } | null = null;
    if (
      submission.formType === "homeowner" &&
      crmResult &&
      "owner" in crmResult &&
      crmResult.owner?.ownerType === "privatperson"
    ) {
      try {
        const [standing, link] = await Promise.all([
          loadLandlordStanding(crmResult.owner.id),
          ensureShareLink({ audience: "landlord", ownerId: crmResult.owner.id }),
        ]);
        agreement = { token: link.token, alreadySigned: standing?.agreementAccepted ?? false };
      } catch (err) {
        console.error("Homeowner agreement link failed", err);
      }
    }

    // Notisen till oss varnar om leadet inte kom in i CRM automatiskt.
    const email = buildEmail(submission, ip, req.headers.get("user-agent") ?? undefined, crmResult != null, crmError);

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM || "StayOnSite <onboarding@resend.dev>",
      to: CONTACT_TO,
      replyTo: email.replyTo,
      subject: email.subject,
      text: email.text,
      html: email.html,
    });

    if (error) {
      console.error("Resend error", error);
      return NextResponse.json({ success: false, error: "resend_error" }, { status: 502 });
    }

    // Send confirmation to customer if we have their email
    if (email.customerEmail) {
      const confirmation = buildConfirmationEmail(submission);
      await resend.emails.send({
        from: process.env.RESEND_FROM || "StayOnSite <onboarding@resend.dev>",
        to: email.customerEmail,
        subject: confirmation.subject,
        text: confirmation.text,
        html: confirmation.html,
      }).catch((err) => console.error("Confirmation email failed", err));
    }

    return NextResponse.json({ success: true, provider: "resend", crm: crmResult ? "mapped" : "skipped", agreement });
  } catch (err) {
    console.error("Contact form error", err);
    return NextResponse.json({ success: false, error: "contact_form_submission_failed" }, { status: 500 });
  }
}
