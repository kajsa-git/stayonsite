import { z } from 'zod';
import { isValidContact, isValidEmail, isValidPhoneNumber } from './contact.js';
import type { ContactFormSubmission, ContactFormType } from './contact-form.js';

const FORM_TYPES = ['hero-intent', 'inquiry', 'homeowner', 'lp-homeowner'] as const;
const LOCALES = ['sv', 'en', 'pl'] as const;

const baseSchema = z.object({
  formType: z.enum(FORM_TYPES),
  locale: z.enum(LOCALES),
  page: z.string().trim().min(1).max(200),
  source: z.string().trim().max(100).optional(),
  startedAt: z.number().int().positive(),
  website: z.string().max(200).optional(),
  fields: z.record(z.string(), z.string()),
  utmParams: z.record(z.string(), z.string()).optional(),
});

const heroIntentSchema = baseSchema.extend({
  formType: z.literal('hero-intent'),
  fields: z.union([
    z.object({
      ort: z.string().trim().min(2).max(100),
      antal_personer: z.string().trim().regex(/^\d{1,3}$/),
      kontakt: z
        .string()
        .trim()
        .min(3)
        .max(200)
        .refine(isValidContact, 'invalid_contact'),
    }),
    z.object({
      city: z.string().trim().min(2).max(100),
      people: z.string().trim().regex(/^\d{1,4}$/),
      email: z.string().trim().min(3).max(200).refine(isValidEmail, 'invalid_email'),
      phone: z.string().trim().min(6).max(50).refine(isValidPhoneNumber, 'invalid_phone'),
    }),
  ]),
});

const inquirySchema = baseSchema.extend({
  formType: z.literal('inquiry'),
  fields: z.object({
    email: z
      .string()
      .trim()
      .min(3)
      .max(200)
      .refine(isValidEmail, 'invalid_email'),
    message: z.string().trim().min(10).max(4000),
  }),
});

const homeownerSchema = baseSchema.extend({
  formType: z.enum(['homeowner', 'lp-homeowner']),
  fields: z.union([
    z.object({
      phone: z.string().trim().min(6).max(50).refine(isValidPhoneNumber, 'invalid_phone'),
      city: z.string().trim().min(2).max(100),
    }),
    z.object({
      name: z.string().trim().min(1).max(200),
      email: z.string().trim().min(3).max(200).refine(isValidEmail, 'invalid_email'),
      phone: z.string().trim().min(6).max(50).refine(isValidPhoneNumber, 'invalid_phone'),
      bedrooms: z.string().trim().regex(/^\d{1,2}$/),
      postalCode: z.string().trim().min(3).max(10),
    }),
  ]),
});

const submissionSchema = z.discriminatedUnion('formType', [
  heroIntentSchema,
  inquirySchema,
  homeownerSchema.extend({ formType: z.literal('homeowner') }),
  homeownerSchema.extend({ formType: z.literal('lp-homeowner') }),
]);

export type ParsedContactSubmission = z.infer<typeof submissionSchema>;

function isSpam(submission: { website?: string }): boolean {
  return Boolean(submission.website && submission.website.trim());
}

function getSubject(submission: ParsedContactSubmission): string {
  switch (submission.formType) {
    case 'hero-intent': {
      const f = submission.fields as Record<string, string>;
      const city = f.ort || f.city || '';
      const people = f.antal_personer || f.people || '';
      return `Snabbförfrågan: ${city} – ${people} pers`;
    }
    case 'inquiry':
      return 'Ny förfrågan från StayOnSite';
    case 'homeowner':
      return 'Ny husägare-registrering från StayOnSite';
    case 'lp-homeowner':
      return 'Ny husägare via Facebook-annons';
  }
}

function getReplyTo(submission: ParsedContactSubmission): string | undefined {
  if (submission.formType === 'inquiry') {
    return submission.fields.email;
  }

  return undefined;
}

function getFormLabel(formType: ContactFormType): string {
  switch (formType) {
    case 'hero-intent':
      return 'Snabbförfrågan';
    case 'inquiry':
      return 'Kontaktformulär';
    case 'homeowner':
      return 'Husägarformulär';
    case 'lp-homeowner':
      return 'Husägarformulär (LP)';
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatTimestamp(date = new Date()): string {
  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'medium',
    timeStyle: 'medium',
    timeZone: 'Europe/Stockholm',
  }).format(date);
}

function toTextLines(record: Record<string, string>): string {
  return Object.entries(record)
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
}

function toHtmlRows(record: Record<string, string>): string {
  return Object.entries(record)
    .filter(([, value]) => value)
    .map(
      ([key, value]) =>
        `<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;">${escapeHtml(
          key
        )}</td><td style="padding:8px 12px;border:1px solid #e5e7eb;">${escapeHtml(value)}</td></tr>`
    )
    .join('');
}

function getMetadata(submission: ParsedContactSubmission, requestMeta: RequestMeta): Record<string, string> {
  const metadata: Record<string, string> = {
    formulär: getFormLabel(submission.formType),
    sida: submission.page,
    språk: submission.locale,
    mottagen: formatTimestamp(),
  };

  if (submission.source) {
    metadata.källa = submission.source;
  }

  if (requestMeta.ip) {
    metadata.ip = requestMeta.ip;
  }

  if (requestMeta.userAgent) {
    metadata['user-agent'] = requestMeta.userAgent;
  }

  if (submission.utmParams && Object.keys(submission.utmParams).length > 0) {
    metadata.utm = Object.entries(submission.utmParams)
      .map(([key, value]) => `${key}=${value}`)
      .join(', ');
  }

  return metadata;
}

export interface RequestMeta {
  ip?: string;
  userAgent?: string;
}

export function parseContactSubmission(payload: unknown): ParsedContactSubmission {
  const result = submissionSchema.safeParse(payload);

  if (!result.success) {
    throw new Error('invalid_submission');
  }

  const submission = result.data;

  if (isSpam(submission)) {
    throw new Error('spam_detected');
  }

  return submission;
}

export function buildContactEmail(
  submission: ParsedContactSubmission,
  requestMeta: RequestMeta
) {
  const metadata = getMetadata(submission, requestMeta);
  const fields = submission.fields as Record<string, string>;
  const subject = getSubject(submission);
  const text = [
    subject,
    '',
    toTextLines(fields),
    '',
    toTextLines(metadata),
  ]
    .filter(Boolean)
    .join('\n');

  const html = `
    <div style="font-family:Arial,sans-serif;color:#111827;line-height:1.5;">
      <h1 style="font-size:20px;margin:0 0 16px;">${escapeHtml(subject)}</h1>
      <h2 style="font-size:16px;margin:24px 0 8px;">Insända uppgifter</h2>
      <table style="border-collapse:collapse;width:100%;max-width:720px;">
        ${toHtmlRows(fields)}
      </table>
      <h2 style="font-size:16px;margin:24px 0 8px;">Metadata</h2>
      <table style="border-collapse:collapse;width:100%;max-width:720px;">
        ${toHtmlRows(metadata)}
      </table>
    </div>
  `.trim();

  return {
    subject,
    replyTo: getReplyTo(submission),
    text,
    html,
  };
}
