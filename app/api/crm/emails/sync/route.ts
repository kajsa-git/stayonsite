import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { contacts, emails } from "@/lib/crm/schema";
import { GmailAuthError, gmailGetThread, gmailSearchThreadIds } from "@/lib/crm/gmail";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { companyId } = await req.json();
  if (!companyId) return NextResponse.json({ error: "companyId required" }, { status: 400 });

  const user = session.user as typeof session.user & { id: string };
  const from = process.env.CRM_FROM ?? "kajsa@stayonsite.se";

  const existing = await db
    .select({ gmailThreadId: emails.gmailThreadId, gmailMessageId: emails.gmailMessageId })
    .from(emails)
    .where(eq(emails.companyId, companyId));

  const knownThreadIds = new Set(existing.map((e) => e.gmailThreadId).filter(Boolean) as string[]);
  const knownMessageIds = new Set(existing.map((e) => e.gmailMessageId).filter(Boolean) as string[]);

  let synced = 0;

  try {
    // 1. Sök Gmail på kontakternas e-postadresser för att hitta trådar vi inte känner till
    const companyContacts = await db
      .select({ email: contacts.email })
      .from(contacts)
      .where(and(eq(contacts.companyId, companyId)));

    const contactEmails = companyContacts.map((c) => c.email).filter(Boolean) as string[];

    for (const contactEmail of contactEmails) {
      const foundIds = await gmailSearchThreadIds(user.id, contactEmail);
      for (const id of foundIds) knownThreadIds.add(id);
    }

    // 2. Hämta alla trådar (kända + nyupptäckta) och importera meddelanden vi inte har
    for (const threadId of knownThreadIds) {
      const messages = await gmailGetThread(user.id, threadId);

      for (const msg of messages) {
        if (knownMessageIds.has(msg.id)) continue;

        const isOut = msg.from.toLowerCase().includes(from.toLowerCase());

        await db.insert(emails).values({
          id: nanoid(),
          companyId,
          direction: isOut ? "out" : "in",
          subject: msg.subject,
          body: msg.text || "(inget textinnehåll)",
          html: msg.html,
          fromEmail: msg.from,
          toEmail: msg.to,
          gmailMessageId: msg.id,
          gmailThreadId: msg.threadId,
          isRead: isOut,
          sentAt: msg.date ? new Date(msg.date).toISOString() : new Date().toISOString(),
        });
        knownMessageIds.add(msg.id);
        synced++;
      }
    }
  } catch (err) {
    if (err instanceof GmailAuthError) {
      return NextResponse.json({ error: "gmail_auth", message: err.message }, { status: 403 });
    }
    throw err;
  }

  return NextResponse.json({ synced });
}
