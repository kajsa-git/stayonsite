import { and, desc, eq, isNull, lt, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { normalizePhoneE164 } from "@/lib/crm/phone-links";
import { unambiguousLandlordPhone } from "@/lib/crm/landlord-sms-identity";
import { landlordConversationLockKey } from "@/lib/crm/landlord-dialog-coordination";
import { acquireLandlordPropertyLock, releaseLandlordPropertyLock } from "@/lib/crm/landlord-property-lock";
import { contacts, landlordAgentHealth, landlordSmsDialogs, landlordSmsRuns, owners, properties } from "@/lib/crm/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const createSchema = z.object({ propertyId: z.string().min(1) }).strict();
const updateSchema = z.object({ id: z.string().min(1), active: z.boolean() }).strict();
const resolveSchema = z.object({ inboxGuid: z.string().min(1), checked: z.literal(true) }).strict();

export async function GET(req: NextRequest) {
  if (!await requireApprovedSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const propertyId = req.nextUrl.searchParams.get("propertyId");
  if (!propertyId) return NextResponse.json({ error: "propertyId krävs" }, { status: 400 });
  const dialogs = await db.select().from(landlordSmsDialogs).where(eq(landlordSmsDialogs.propertyId, propertyId));
  const result = await Promise.all(dialogs.map(async (dialog) => ({ ...dialog,
    recentRuns: await db.select().from(landlordSmsRuns).where(eq(landlordSmsRuns.dialogId, dialog.id)).orderBy(desc(landlordSmsRuns.createdAt)).limit(10),
  })));
  const [mac] = await db.select().from(landlordAgentHealth).where(eq(landlordAgentHealth.id, "mac")).limit(1);
  const [worker] = await db.select().from(landlordAgentHealth).where(eq(landlordAgentHealth.id, "sms")).limit(1);
  const fresh = (value: string | null | undefined) => Number.isFinite(Date.parse(value ?? "")) && Date.now() - Date.parse(value!) < 5 * 60_000;
  return NextResponse.json({ dialogs: result, macConnected: fresh(mac?.lastSuccessAt), workerHealthy: fresh(worker?.lastSuccessAt) && !worker?.failureStartedAt });
}

export async function PUT(req: NextRequest) {
  if (!await requireApprovedSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = resolveSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Bekräftad kontroll krävs" }, { status: 400 });
  const now = new Date().toISOString();
  const result = await db.transaction(async (tx) => {
    const [run] = await tx.select().from(landlordSmsRuns).where(eq(landlordSmsRuns.inboxGuid, parsed.data.inboxGuid)).limit(1);
    if (!run || (run.status !== "needs_review" && !run.attachmentsNeedReview)) return null;
    const [dialog] = await tx.select().from(landlordSmsDialogs).where(and(eq(landlordSmsDialogs.id, run.dialogId),
      or(isNull(landlordSmsDialogs.leaseUntil), lt(landlordSmsDialogs.leaseUntil, now)))).limit(1);
    if (!dialog) return null;
    const [saved] = await tx.update(landlordSmsRuns).set({
      ...(run.status === "needs_review" ? { status: "resolved" as const } : {}),
      attachmentsNeedReview: false, updatedAt: now,
    }).where(and(eq(landlordSmsRuns.inboxGuid, run.inboxGuid), eq(landlordSmsRuns.status, run.status))).returning();
    return saved ?? null;
  });
  return result ? NextResponse.json({ run: result }) : NextResponse.json({ error: "Kontrollen kan inte sparas just nu." }, { status: 409 });
}

export async function POST(req: NextRequest) {
  if (!await requireApprovedSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ogiltiga uppgifter" }, { status: 400 });
  const [row] = await db.select({ propertyId: properties.id, ownerId: owners.id, phone: owners.phone })
    .from(properties).innerJoin(owners, eq(properties.ownerId, owners.id)).where(eq(properties.id, parsed.data.propertyId)).limit(1);
  const phone = normalizePhoneE164(row?.phone);
  if (!row || !phone) return NextResponse.json({ error: "Bostaden saknar en uthyrare med giltigt telefonnummer." }, { status: 400 });
  // A number shared by multiple owners is ambiguous even if one is selected.
  const all = await db.select({ id: owners.id, phone: owners.phone }).from(owners);
  const contactsWithPhones = await db.select({ phone: contacts.phone }).from(contacts);
  if (!unambiguousLandlordPhone(phone, row.ownerId, all, contactsWithPhones)) {
    return NextResponse.json({ error: "Numret används av flera kontakter eller uthyrare och måste hanteras manuellt." }, { status: 409 });
  }
  const key = landlordConversationLockKey("sms", phone, null)!;
  const token = await acquireLandlordPropertyLock(key);
  if (!token) return NextResponse.json({ error: "Dialogen behandlas just nu. Försök igen om en stund." }, { status: 409 });
  try {
    const now = new Date().toISOString();
    const [dialog] = await db.insert(landlordSmsDialogs).values({
      id: nanoid(), ownerId: row.ownerId, propertyId: row.propertyId, phone, enrolledAt: now, active: true, createdAt: now, updatedAt: now,
    }).onConflictDoNothing().returning();
    if (!dialog) return NextResponse.json({ error: "Numret är redan kopplat till en bostadsdialog." }, { status: 409 });
    return NextResponse.json({ dialog }, { status: 201 });
  } finally { await releaseLandlordPropertyLock(key, token); }
}

export async function PATCH(req: NextRequest) {
  if (!await requireApprovedSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ogiltiga uppgifter" }, { status: 400 });
  const now = new Date().toISOString();
  const [dialog] = await db.update(landlordSmsDialogs).set({ active: parsed.data.active,
    ...(parsed.data.active ? { enrolledAt: now } : {}), updatedAt: now,
  }).where(and(eq(landlordSmsDialogs.id, parsed.data.id))).returning();
  return dialog ? NextResponse.json({ dialog }) : NextResponse.json({ error: "Dialogen saknas" }, { status: 404 });
}
