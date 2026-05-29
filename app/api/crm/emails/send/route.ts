import { auth } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { contacts, emails, owners } from "@/lib/crm/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { to, subject, body: emailBody, html: emailHtml, companyId, contactId, ownerId } = body;

  if (!to || !subject || !emailBody) {
    return NextResponse.json({ error: "to, subject, body required" }, { status: 400 });
  }

  const from = process.env.RESEND_FROM ?? "kajsa@stayonsite.se";
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { data, error } = await resend.emails.send({
    from: `Kajsa <${from}>`,
    to,
    replyTo: from,
    subject,
    text: emailBody,
    ...(emailHtml ? { html: emailHtml } : {}),
  });

  if (error) {
    console.error("Resend error (CRM send):", error);
    return NextResponse.json({ error: "resend_error", detail: error }, { status: 502 });
  }

  const user = session.user as typeof session.user & { id: string };
  const id = nanoid();

  // Resolve companyId from contactId if only contactId provided
  let resolvedCompanyId = companyId ?? null;
  if (!resolvedCompanyId && contactId) {
    const [c] = await db.select({ companyId: contacts.companyId }).from(contacts).where(eq(contacts.id, contactId));
    resolvedCompanyId = c?.companyId ?? null;
  }

  const [row] = await db
    .insert(emails)
    .values({
      id,
      companyId: resolvedCompanyId,
      contactId: contactId ?? null,
      ownerId: ownerId ?? null,
      direction: "out",
      subject,
      body: emailBody,
      html: emailHtml ?? null,
      fromEmail: from,
      toEmail: to,
      authorId: user.id,
      resendId: data?.id ?? null,
      sentAt: new Date().toISOString(),
    })
    .returning();

  return NextResponse.json(row, { status: 201 });
}
