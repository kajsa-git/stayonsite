import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { emails } from "@/lib/crm/schema";
import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const companyId = req.nextUrl.searchParams.get("companyId");
  const ownerId = req.nextUrl.searchParams.get("ownerId");

  if (!companyId && !ownerId) {
    return NextResponse.json({ error: "companyId or ownerId required" }, { status: 400 });
  }

  const rows = companyId
    ? await db.select().from(emails).where(eq(emails.companyId, companyId)).orderBy(desc(emails.sentAt))
    : await db.select().from(emails).where(eq(emails.ownerId, ownerId!)).orderBy(desc(emails.sentAt));

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { companyId, ownerId, contactId, direction, subject, body: emailBody, fromEmail, toEmail, sentAt } = body;

  if (!direction || !subject || !emailBody || !fromEmail || !toEmail) {
    return NextResponse.json({ error: "direction, subject, body, fromEmail, toEmail required" }, { status: 400 });
  }
  // direction styr hela rendering-grenen (in vs ut) i EmailThread — en felstavning
  // skulle visa ett utgående mejl som inkommande. Validera mot tillåtna värden.
  if (direction !== "in" && direction !== "out") {
    return NextResponse.json({ error: "direction must be 'in' or 'out'" }, { status: 400 });
  }

  const user = session.user as typeof session.user & { id: string };
  const id = nanoid();
  const [row] = await db
    .insert(emails)
    .values({
      id,
      companyId: companyId ?? null,
      ownerId: ownerId ?? null,
      contactId: contactId ?? null,
      direction,
      subject,
      body: emailBody,
      fromEmail,
      toEmail,
      authorId: user.id,
      sentAt: sentAt ?? new Date().toISOString(),
    })
    .returning();

  return NextResponse.json(row, { status: 201 });
}
