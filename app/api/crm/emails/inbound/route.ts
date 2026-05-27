import { db } from "@/lib/crm/db";
import { contacts, emails, owners } from "@/lib/crm/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

function extractEmail(from: string): string {
  // "Name <email@example.com>" → "email@example.com"
  const match = from.match(/<([^>]+)>/);
  return match ? match[1].trim().toLowerCase() : from.trim().toLowerCase();
}

export async function POST(req: NextRequest) {
  // Verify webhook secret if configured
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (secret) {
    const sig = req.headers.get("resend-signature") ?? req.headers.get("svix-signature");
    if (!sig || !sig.includes(secret)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return new NextResponse("Bad Request", { status: 400 });
  }

  const from = String(payload.from ?? "");
  const subject = String(payload.subject ?? "(inget ämne)");
  const text = String(payload.text ?? payload.plain_text ?? "");
  const senderEmail = extractEmail(from);

  if (!senderEmail) {
    return NextResponse.json({ ok: true, matched: false });
  }

  // Try matching against contacts.email → get companyId
  const [matchedContact] = await db
    .select({ id: contacts.id, companyId: contacts.companyId })
    .from(contacts)
    .where(eq(contacts.email, senderEmail));

  // Try matching against owners.email
  const [matchedOwner] = await db
    .select({ id: owners.id })
    .from(owners)
    .where(eq(owners.email, senderEmail));

  const id = nanoid();
  await db.insert(emails).values({
    id,
    companyId: matchedContact?.companyId ?? null,
    contactId: matchedContact?.id ?? null,
    ownerId: matchedOwner?.id ?? null,
    direction: "in",
    subject,
    body: text,
    fromEmail: senderEmail,
    toEmail: String(payload.to ?? ""),
    isRead: false,
    sentAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, matched: !!(matchedContact || matchedOwner) });
}
