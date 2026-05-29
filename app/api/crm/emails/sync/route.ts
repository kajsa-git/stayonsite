import { auth } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { emails } from "@/lib/crm/schema";
import { GmailAuthError, gmailGetThread } from "@/lib/crm/gmail";
import { and, eq, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

// Synkar alla Gmail-trådar kopplade till ett företag och lagrar nya meddelanden.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { companyId } = await req.json();
  if (!companyId) return NextResponse.json({ error: "companyId required" }, { status: 400 });

  const user = session.user as typeof session.user & { id: string };
  const from = process.env.RESEND_FROM ?? "kajsa@stayonsite.se";

  // Hitta alla unika Gmail-trådar för företaget
  const existing = await db
    .select({ gmailThreadId: emails.gmailThreadId, gmailMessageId: emails.gmailMessageId })
    .from(emails)
    .where(and(eq(emails.companyId, companyId)));

  const threadIds = [...new Set(existing.map((e) => e.gmailThreadId).filter(Boolean) as string[])];
  const knownMessageIds = new Set(existing.map((e) => e.gmailMessageId).filter(Boolean) as string[]);

  if (threadIds.length === 0) return NextResponse.json({ synced: 0 });

  let synced = 0;

  try {
    for (const threadId of threadIds) {
      const messages = await gmailGetThread(user.id, threadId);

      for (const msg of messages) {
        if (knownMessageIds.has(msg.id)) continue;

        // Avgör riktning: utgående om from-adressen är vår
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
