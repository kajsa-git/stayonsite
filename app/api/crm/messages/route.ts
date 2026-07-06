import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { normalizePhoneE164 } from "@/lib/crm/phone-links";
import { outboxMessages } from "@/lib/crm/schema";
import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MAX_BODY_CHARS = 1600;

// POST — köa ett meddelande. Mac-agenten plockar upp det inom ~30 s och
// skickar via Messages.app (iMessage, fallback SMS).
export async function POST(req: NextRequest) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const raw = await req.json().catch(() => ({}) as Record<string, unknown>);
  const toPhone = normalizePhoneE164(typeof raw.toPhone === "string" ? raw.toPhone : null);
  const body = typeof raw.body === "string" ? raw.body.trim() : "";

  if (!toPhone) return NextResponse.json({ error: "Ogiltigt telefonnummer" }, { status: 400 });
  if (!body) return NextResponse.json({ error: "Meddelandet är tomt" }, { status: 400 });
  if (body.length > MAX_BODY_CHARS) {
    return NextResponse.json({ error: `Max ${MAX_BODY_CHARS} tecken` }, { status: 400 });
  }

  const [row] = await db
    .insert(outboxMessages)
    .values({
      id: nanoid(),
      toPhone,
      body,
      ownerId: typeof raw.ownerId === "string" ? raw.ownerId : null,
      contactId: typeof raw.contactId === "string" ? raw.contactId : null,
    })
    .returning();
  return NextResponse.json(row, { status: 201 });
}

// GET ?phone=+46… — senaste meddelandena till ett nummer (för dialogens historik).
export async function GET(req: NextRequest) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const phone = normalizePhoneE164(req.nextUrl.searchParams.get("phone"));
  const rows = phone
    ? await db.select().from(outboxMessages).where(eq(outboxMessages.toPhone, phone)).orderBy(desc(outboxMessages.createdAt)).limit(10)
    : await db.select().from(outboxMessages).orderBy(desc(outboxMessages.createdAt)).limit(50);
  return NextResponse.json(rows);
}
