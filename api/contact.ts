import { Resend } from 'resend';
import {
  buildContactEmail,
  parseContactSubmission,
} from '../src/lib/contact-server.js';

const CONTACT_TO = process.env.CONTACT_FORM_TO || 'kajsa@stayonsite.se';

function getHeader(headers: Headers, name: string): string | undefined {
  const value = headers.get(name);
  return value ? value.trim() : undefined;
}

function getClientIp(headers: Headers): string | undefined {
  const forwardedFor = getHeader(headers, 'x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim();
  }

  return getHeader(headers, 'x-real-ip');
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const submission = parseContactSubmission(payload);
    const email = buildContactEmail(submission, {
      ip: getClientIp(request.headers),
      userAgent: getHeader(request.headers, 'user-agent'),
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
      throw new Error(`resend_error:${error.message}`);
    }

    return Response.json({ success: true, provider: 'resend' });
  } catch (error) {
    const rawMessage =
      error instanceof Error ? error.message : 'contact_form_submission_failed';
    const [message, ...detailsParts] = rawMessage.split(':');
    const details = detailsParts.join(':') || undefined;

    const status =
      message === 'spam_detected'
        ? 400
        : message === 'invalid_submission'
        ? 400
        : message === 'resend_error'
        ? 502
        : 500;

    return Response.json(
      {
        success: false,
        error: message,
        details:
          process.env.VERCEL_ENV === 'production'
            ? undefined
            : details,
      },
      { status }
    );
  }
}
