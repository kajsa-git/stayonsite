import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { contacts, emails, owners } from "@/lib/crm/schema";
import { GmailAuthError, gmailGetThread, gmailSearchThreadIds } from "@/lib/crm/gmail";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

// Synkar inkommande Gmail-svar till en parts mejltråd. Stöder både företag (companyId,
// söker på kontakternas adresser) och uthyrare (ownerId, söker på uthyrarens adress).
export async function POST(req: NextRequest) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { companyId, ownerId } = await req.json();
  if (!companyId && !ownerId) {
    return NextResponse.json({ error: "companyId or ownerId required" }, { status: 400 });
  }

  const user = session.user as typeof session.user & { id: string };
  const from = process.env.CRM_FROM ?? "kajsa@stayonsite.se";

  // Skopa: importerade mejl knyts till företaget eller uthyraren.
  const scope = companyId ? eq(emails.companyId, companyId) : eq(emails.ownerId, ownerId);
  const ownerLink: { companyId: string } | { ownerId: string } = companyId ? { companyId } : { ownerId };

  const existing = await db
    .select({ gmailThreadId: emails.gmailThreadId, gmailMessageId: emails.gmailMessageId })
    .from(emails)
    .where(scope);

  const knownThreadIds = new Set(existing.map((e) => e.gmailThreadId).filter(Boolean) as string[]);
  const knownMessageIds = new Set(existing.map((e) => e.gmailMessageId).filter(Boolean) as string[]);

  let synced = 0;

  try {
    // 1. Adresser att söka på i Gmail för att hitta trådar vi inte känner till.
    let searchEmails: string[];
    if (companyId) {
      const companyContacts = await db
        .select({ email: contacts.email })
        .from(contacts)
        .where(eq(contacts.companyId, companyId));
      searchEmails = companyContacts.map((c) => c.email).filter(Boolean) as string[];
    } else {
      const [owner] = await db.select({ email: owners.email }).from(owners).where(eq(owners.id, ownerId));
      searchEmails = owner?.email ? [owner.email] : [];
    }

    for (const addr of searchEmails) {
      const foundIds = await gmailSearchThreadIds(user.id, addr);
      for (const id of foundIds) knownThreadIds.add(id);
    }

    // 2. Hämta alla trådar (kända + nyupptäckta) och importera meddelanden vi inte har.
    for (const threadId of knownThreadIds) {
      const messages = await gmailGetThread(user.id, threadId);

      for (const msg of messages) {
        if (knownMessageIds.has(msg.id)) continue;

        const isOut = msg.from.toLowerCase().includes(from.toLowerCase());

        // onConflictDoNothing: gmailMessageId är unikt globalt. Delar en tråd både ett
        // företag och en uthyrare (samma person) får meddelandet inte krascha andra synken.
        const inserted = await db
          .insert(emails)
          .values({
            id: nanoid(),
            ...ownerLink,
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
          })
          .onConflictDoNothing()
          .returning({ id: emails.id });

        knownMessageIds.add(msg.id);
        if (inserted.length) synced++;
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
