import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import {
  buildContactEmail,
  parseContactSubmission,
} from '../src/lib/contact-server';

const CONTACT_TO = process.env.CONTACT_FORM_TO || 'kajsa@stayonsite.se';

function getClientIp(req: VercelRequest): string | undefined {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0]?.trim();
  return undefined;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'method_not_allowed' });
  }

  try {
    const submission = parseContactSubmission(req.body);
    const email = buildContactEmail(submission, {
      ip: getClientIp(req),
      userAgent: req.headers['user-agent'],
    });

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

    return res.status(200).json({ success: true, provider: 'resend' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'contact_form_submission_failed';

    const status =
      message === 'spam_detected' ? 400 :
      message === 'invalid_submission' ? 400 : 500;

    return res.status(status).json({ success: false, error: message });
  }
}
