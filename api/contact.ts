import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { z } from 'zod';

const CONTACT_TO = process.env.CONTACT_FORM_TO || 'kajsa@stayonsite.se';

// --- Validation ---

function isValidEmail(v: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function isValidPhone(v: string) { return /^[\d\s()+-]{6,50}$/.test(v); }
function isValidContact(v: string) { return isValidEmail(v) || isValidPhone(v); }

const FORM_TYPES = ['hero-intent', 'inquiry', 'homeowner', 'lp-homeowner'] as const;
const LOCALES = ['sv', 'en', 'pl'] as const;

const base = {
  locale: z.enum(LOCALES),
  page: z.string().min(1).max(200),
  source: z.string().max(100).optional(),
  startedAt: z.number().int().positive(),
  website: z.string().max(200).optional(),
  utmParams: z.record(z.string(), z.string()).optional(),
};

const submissionSchema = z.discriminatedUnion('formType', [
  // Legacy hero-intent: ort + antal_personer + kontakt (used by Index, CityPage)
  z.object({ ...base, formType: z.literal('hero-intent'), fields: z.union([
    z.object({
      ort: z.string().min(2).max(100),
      antal_personer: z.string().regex(/^\d{1,3}$/),
      kontakt: z.string().min(3).max(200).refine(isValidContact),
    }),
    // New foretag conversion form: city + people + email + phone
    z.object({
      city: z.string().min(2).max(100),
      people: z.string().regex(/^\d{1,4}$/),
      email: z.string().min(3).max(200).refine(isValidEmail),
      phone: z.string().min(6).max(50).refine(isValidPhone),
    }),
  ])}),
  z.object({ ...base, formType: z.literal('inquiry'), fields: z.object({
    email: z.string().min(3).max(200).refine(isValidEmail),
    phone: z.string().min(6).max(50).refine(isValidPhone),
    message: z.string().min(10).max(4000),
  })}),
  // Homeowner: supports both old (phone+city) and new (name+email+phone+bedrooms+postalCode)
  z.object({ ...base, formType: z.literal('homeowner'), fields: z.union([
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
  z.object({ ...base, formType: z.literal('lp-homeowner'), fields: z.object({
    phone: z.string().min(6).max(50).refine(isValidPhone),
    city: z.string().min(2).max(100),
  })}),
]);

type Submission = z.infer<typeof submissionSchema>;

// --- Email building ---

const FORM_LABELS: Record<string, string> = {
  'hero-intent': 'Snabbförfrågan',
  'inquiry': 'Kontaktformulär',
  'homeowner': 'Husägarformulär',
  'lp-homeowner': 'Husägarformulär (LP)',
};

function getSubject(s: Submission): string {
  if (s.formType === 'hero-intent') {
    const f = s.fields as Record<string, string>;
    const city = f.ort || f.city || '';
    const people = f.antal_personer || f.people || '';
    return `Snabbförfrågan: ${city} – ${people} pers`;
  }
  if (s.formType === 'inquiry') return 'Ny förfrågan från StayOnSite';
  if (s.formType === 'lp-homeowner') return 'Ny husägare via Facebook-annons';
  return 'Ny husägare-registrering från StayOnSite';
}

function esc(v: string) { return v.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function buildEmail(s: Submission, ip?: string, ua?: string) {
  const fields = s.fields as Record<string, string>;
  const subject = getSubject(s);
  const now = new Intl.DateTimeFormat('sv-SE', { dateStyle: 'medium', timeStyle: 'medium', timeZone: 'Europe/Stockholm' }).format(new Date());

  const rows = (rec: Record<string, string>) => Object.entries(rec).filter(([,v]) => v).map(([k,v]) =>
    `<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;">${esc(k)}</td><td style="padding:8px 12px;border:1px solid #e5e7eb;">${esc(v)}</td></tr>`
  ).join('');

  const meta: Record<string, string> = {
    formulär: FORM_LABELS[s.formType] || s.formType,
    sida: s.page,
    språk: s.locale,
    mottagen: now,
  };
  if (s.source) meta.källa = s.source;
  if (ip) meta.ip = ip;
  if (ua) meta['user-agent'] = ua;
  if (s.utmParams && Object.keys(s.utmParams).length) {
    meta.utm = Object.entries(s.utmParams).map(([k,v]) => `${k}=${v}`).join(', ');
  }

  const text = [subject, '', ...Object.entries(fields).map(([k,v]) => `${k}: ${v}`), '', ...Object.entries(meta).map(([k,v]) => `${k}: ${v}`)].join('\n');

  const html = `<div style="font-family:Arial,sans-serif;color:#111827;line-height:1.5;">
    <h1 style="font-size:20px;margin:0 0 16px;">${esc(subject)}</h1>
    <h2 style="font-size:16px;margin:24px 0 8px;">Insända uppgifter</h2>
    <table style="border-collapse:collapse;width:100%;max-width:720px;">${rows(fields)}</table>
    <h2 style="font-size:16px;margin:24px 0 8px;">Metadata</h2>
    <table style="border-collapse:collapse;width:100%;max-width:720px;">${rows(meta)}</table>
  </div>`;

  const replyTo = s.formType === 'inquiry' ? (s.fields as { email: string }).email : undefined;

  // Find customer email for confirmation
  let customerEmail: string | undefined;
  const f = s.fields as Record<string, string>;
  if (f.email && isValidEmail(f.email)) {
    customerEmail = f.email;
  } else if (s.formType === 'hero-intent' && f.kontakt && isValidEmail(f.kontakt)) {
    customerEmail = f.kontakt;
  }

  return { subject, text, html, replyTo, customerEmail };
}

function buildConfirmationEmail(s: Submission): { subject: string; text: string; html: string } {
  const sv = s.locale === 'sv';
  const pl = s.locale === 'pl';

  const subject = sv ? 'Vi har fått din förfrågan – StayOnSite'
    : pl ? 'Otrzymaliśmy Twoje zapytanie – StayOnSite'
    : 'We received your inquiry – StayOnSite';

  const t = {
    greeting:   sv ? 'Hej!'                          : pl ? 'Cześć!'                           : 'Hi!',
    body1:      sv ? 'Tack för att du hörde av dig. Vi har tagit emot din förfrågan och återkommer till dig <strong>inom 24 timmar</strong> med ett konkret förslag.'
                   : pl ? 'Dziękujemy za kontakt. Otrzymaliśmy Twoje zapytanie i odezwiemy się w ciągu <strong>24 godzin</strong> z konkretną propozycją.'
                   : 'Thank you for reaching out. We have received your inquiry and will get back to you <strong>within 24 hours</strong> with a concrete proposal.',
    urgent:     sv ? 'Behöver du svar snabbare? Ring oss direkt:'
                   : pl ? 'Potrzebujesz szybszej odpowiedzi? Zadzwoń bezpośrednio:'
                   : 'Need a faster response? Call us directly:',
    signoff:    sv ? 'Med vänliga hälsningar'         : pl ? 'Pozdrawiam'                       : 'Best regards',
    name:       'Kajsa Sihlén',
    title:      sv ? 'Grundare, StayOnSite'           : pl ? 'Założycielka, StayOnSite'         : 'Founder, StayOnSite',
    tagline:    'Worker accommodation across Sweden',
  };

  const text = [
    t.greeting, '',
    t.body1.replace(/<[^>]+>/g, ''), '',
    t.urgent, '076-249 84 86', '',
    `${t.signoff},\n${t.name}\n${t.title}`, '',
    '076-249 84 86',
    'kajsa@stayonsite.se',
    'www.stayonsite.se',
  ].join('\n');

  const html = `<!DOCTYPE html>
<html lang="${s.locale}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
  <tr><td align="center">
    <table role="presentation" width="100%" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

      <!-- Header -->
      <tr>
        <td style="background:#0f1c2e;padding:28px 40px;">
          <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">Stay<span style="color:#ff6300;">On</span>Site</span>
          <p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,0.45);letter-spacing:1px;text-transform:uppercase;">${esc(t.tagline)}</p>
        </td>
      </tr>

      <!-- Orange accent bar -->
      <tr><td style="background:#ff6300;height:4px;font-size:0;line-height:0;">&nbsp;</td></tr>

      <!-- Body -->
      <tr>
        <td style="padding:40px 40px 32px;">
          <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#0f1c2e;">${esc(t.greeting)}</p>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#374151;">${t.body1}</p>

          <!-- 24h badge -->
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
            <tr>
              <td style="background:#fff7f0;border:1px solid #fed7aa;border-radius:8px;padding:14px 20px;">
                <span style="font-size:14px;color:#92400e;font-weight:600;">⏱ ${sv ? 'Svarstid: inom 24 timmar' : pl ? 'Czas odpowiedzi: do 24 godzin' : 'Response time: within 24 hours'}</span>
              </td>
            </tr>
          </table>

          <!-- Urgent CTA -->
          <p style="margin:0 0 10px;font-size:14px;color:#6b7280;">${esc(t.urgent)}</p>
          <a href="tel:+46762498486" style="display:inline-block;background:#ff6300;color:#ffffff;font-size:15px;font-weight:700;padding:12px 28px;border-radius:50px;text-decoration:none;">📞 076-249 84 86</a>
        </td>
      </tr>

      <!-- Divider -->
      <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid #e5e7eb;margin:0;"></td></tr>

      <!-- Signoff -->
      <tr>
        <td style="padding:28px 40px 36px;">
          <p style="margin:0 0 4px;font-size:14px;color:#6b7280;">${esc(t.signoff)},</p>
          <p style="margin:0 0 2px;font-size:15px;font-weight:700;color:#0f1c2e;">${esc(t.name)}</p>
          <p style="margin:0 0 16px;font-size:13px;color:#9ca3af;">${esc(t.title)}</p>
          <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.8;">
            <a href="tel:+46762498486" style="color:#ff6300;text-decoration:none;">076-249 84 86</a><br>
            <a href="mailto:kajsa@stayonsite.se" style="color:#ff6300;text-decoration:none;">kajsa@stayonsite.se</a><br>
            <a href="https://www.stayonsite.se" style="color:#ff6300;text-decoration:none;">www.stayonsite.se</a>
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#f9fafb;padding:16px 40px;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center;">StayOnSite · 17165 Solna · ${sv ? 'Du fick detta mejl för att du fyllt i ett formulär på stayonsite.se' : pl ? 'Otrzymałeś ten e-mail, ponieważ wypełniłeś formularz na stayonsite.se' : 'You received this email because you filled out a form on stayonsite.se'}</p>
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'method_not_allowed' });
  }

  try {
    const result = submissionSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ success: false, error: 'invalid_submission' });
    }

    const submission = result.data;

    if (submission.website && submission.website.trim()) {
      return res.status(400).json({ success: false, error: 'spam_detected' });
    }

    const forwarded = req.headers['x-forwarded-for'];
    const ip = typeof forwarded === 'string' ? forwarded.split(',')[0]?.trim() : undefined;
    const email = buildEmail(submission, ip, req.headers['user-agent']);

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM || 'StayOnSite <onboarding@resend.dev>',
      to: CONTACT_TO,
      replyTo: email.replyTo,
      subject: email.subject,
      text: email.text,
      html: email.html,
    });

    if (error) {
      console.error('Resend error', error);
      return res.status(502).json({ success: false, error: 'resend_error' });
    }

    // Send confirmation to customer if we have their email
    if (email.customerEmail) {
      const confirmation = buildConfirmationEmail(submission);
      await resend.emails.send({
        from: process.env.RESEND_FROM || 'StayOnSite <onboarding@resend.dev>',
        to: email.customerEmail,
        subject: confirmation.subject,
        text: confirmation.text,
        html: confirmation.html,
      }).catch((err) => console.error('Confirmation email failed', err));
    }

    return res.status(200).json({ success: true, provider: 'resend' });
  } catch (err) {
    console.error('Contact form error', err);
    return res.status(500).json({ success: false, error: 'contact_form_submission_failed' });
  }
}
