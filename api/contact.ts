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
  z.object({ ...base, formType: z.literal('hero-intent'), fields: z.object({
    ort: z.string().min(2).max(100),
    antal_personer: z.string().regex(/^\d{1,3}$/),
    kontakt: z.string().min(3).max(200).refine(isValidContact),
  })}),
  z.object({ ...base, formType: z.literal('inquiry'), fields: z.object({
    email: z.string().min(3).max(200).refine(isValidEmail),
    message: z.string().min(10).max(4000),
  })}),
  z.object({ ...base, formType: z.literal('homeowner'), fields: z.object({
    phone: z.string().min(6).max(50).refine(isValidPhone),
    city: z.string().min(2).max(100),
  })}),
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
  if (s.formType === 'hero-intent') return `Snabbförfrågan: ${s.fields.ort} – ${(s.fields as { antal_personer: string }).antal_personer} pers`;
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
  if (s.formType === 'inquiry') {
    customerEmail = (s.fields as { email: string }).email;
  } else if (s.formType === 'hero-intent') {
    const kontakt = (s.fields as { kontakt: string }).kontakt;
    if (isValidEmail(kontakt)) customerEmail = kontakt;
  }

  return { subject, text, html, replyTo, customerEmail };
}

function buildConfirmationEmail(s: Submission): { subject: string; text: string; html: string } {
  const isSwedish = s.locale === 'sv';
  const isPolish = s.locale === 'pl';

  const subject = isSwedish ? 'Tack för din förfrågan - StayOnSite'
    : isPolish ? 'Dziękujemy za zapytanie - StayOnSite'
    : 'Thank you for your inquiry - StayOnSite';

  const greeting = isSwedish ? 'Hej!'
    : isPolish ? 'Cześć!'
    : 'Hi!';

  const body = isSwedish
    ? 'Tack för att du kontaktade oss. Vi har tagit emot din förfrågan och återkommer inom 24 timmar.'
    : isPolish
    ? 'Dziękujemy za kontakt. Otrzymaliśmy Twoje zapytanie i odezwiemy się w ciągu 24 godzin.'
    : 'Thank you for reaching out. We have received your inquiry and will get back to you within 24 hours.';

  const signoff = isSwedish ? 'Vänliga hälsningar,\nKajsa med Team\nStayOnSite'
    : isPolish ? 'Pozdrawiam,\nKajsa z Zespołem\nStayOnSite'
    : 'Best regards,\nKajsa and Team\nStayOnSite';

  const text = `${greeting}\n\n${body}\n\n${signoff}\n\n076-249 84 86\nkajsa@stayonsite.se\nwww.stayonsite.se`;

  const html = `<div style="font-family:Arial,sans-serif;color:#111827;line-height:1.6;max-width:600px;">
    <p style="font-size:16px;font-weight:600;">${greeting}</p>
    <p>${body}</p>
    ${!isSwedish ? '' : `<p style="color:#6b7280;font-size:14px;margin-top:4px;"><em>Thank you for reaching out. We have received your inquiry and will get back to you within 24 hours.</em></p>`}
    <p style="margin-top:24px;">${signoff.replace(/\n/g, '<br>')}</p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
    <p style="font-size:13px;color:#6b7280;">
      <a href="tel:+46762498486" style="color:#ff6300;">076-249 84 86</a><br>
      <a href="mailto:kajsa@stayonsite.se" style="color:#ff6300;">kajsa@stayonsite.se</a><br>
      <a href="https://www.stayonsite.se" style="color:#ff6300;">www.stayonsite.se</a>
    </p>
  </div>`;

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
