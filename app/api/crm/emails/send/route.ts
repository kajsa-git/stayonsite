import { auth } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { contacts } from "@/lib/crm/schema";
import { emails } from "@/lib/crm/schema";
import { GmailAuthError, gmailSend } from "@/lib/crm/gmail";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { to, subject, body: emailBody, html: emailHtml, companyId, contactId, ownerId, threadId } = body;

  if (!to || !subject || !emailBody) {
    return NextResponse.json({ error: "to, subject, body required" }, { status: 400 });
  }

  const user = session.user as typeof session.user & { id: string };
  const from = process.env.CRM_FROM ?? "kajsa@stayonsite.se";

  let gmailMessageId: string | null = null;
  let gmailThreadId: string | null = null;

  try {
    const result = await gmailSend(user.id, {
      from: `Kajsa <${from}>`,
      to,
      subject,
      text: emailBody,
      html: emailHtml ?? undefined,
      threadId: threadId ?? undefined,
    });
    gmailMessageId = result.messageId;
    gmailThreadId = result.threadId;
  } catch (err) {
    if (err instanceof GmailAuthError) {
      return NextResponse.json({ error: "gmail_auth", message: err.message }, { status: 403 });
    }
    console.error("Gmail send error:", err);
    return NextResponse.json({ error: "send_error", message: "Kunde inte skicka mejlet via Gmail." }, { status: 502 });
  }

  // Resolve companyId from contactId if needed
  let resolvedCompanyId = companyId ?? null;
  if (!resolvedCompanyId && contactId) {
    const [c] = await db.select({ companyId: contacts.companyId }).from(contacts).where(eq(contacts.id, contactId));
    resolvedCompanyId = c?.companyId ?? null;
  }

  const id = nanoid();
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
      gmailMessageId,
      gmailThreadId,
      sentAt: new Date().toISOString(),
    })
    .returning();

  return NextResponse.json(row, { status: 201 });
}
