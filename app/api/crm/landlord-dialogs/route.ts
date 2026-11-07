import { and, desc, eq, inArray, isNull, lt, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { gmailAutomationUserId, gmailGetThread } from "@/lib/crm/gmail";
import { mailboxAddress } from "@/lib/crm/landlord-dialog-policy";
import { landlordConversationLockKey } from "@/lib/crm/landlord-dialog-coordination";
import { acquireLandlordPropertyLock, releaseLandlordPropertyLock } from "@/lib/crm/landlord-property-lock";
import { landlordAgentHealth, landlordDialogs, landlordReplyRuns, owners, properties } from "@/lib/crm/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSchema = z.object({ propertyId: z.string().min(1), gmailThreadId: z.string().regex(/^[a-zA-Z0-9_-]{1,200}$/) }).strict();
const updateSchema = z.object({ id: z.string().min(1), active: z.boolean() }).strict();
const resolveSchema = z.object({ gmailMessageId: z.string().min(1), checked: z.literal(true) }).strict();

export async function GET(req: NextRequest) {
  if (!await requireApprovedSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const propertyId = req.nextUrl.searchParams.get("propertyId");
  if (!propertyId) return NextResponse.json({ error: "propertyId krävs" }, { status: 400 });
  const dialogs = await db.select().from(landlordDialogs).where(eq(landlordDialogs.propertyId, propertyId));
  const result = await Promise.all(dialogs.map(async (dialog) => {
    const runs = await db.select().from(landlordReplyRuns).where(eq(landlordReplyRuns.dialogId, dialog.id))
      .orderBy(desc(landlordReplyRuns.createdAt)).limit(10);
    return { ...dialog, recentRuns: runs.map((run) => ({
      ...run, requiresReview: run.attachmentsNeedReview || ["needs_review", "send_uncertain"].includes(run.status)
        || (["claimed", "sending"].includes(run.status) && Date.now() - Date.parse(run.updatedAt) > 120_000),
    })) };
  }));
  const [health] = await db.select().from(landlordAgentHealth).where(eq(landlordAgentHealth.id, "minute")).limit(1);
  const lastSuccess = Date.parse(health?.lastSuccessAt ?? "");
  const healthy = Number.isFinite(lastSuccess) && Date.now() - lastSuccess < 5 * 60_000 && !health?.failureStartedAt;
  return NextResponse.json({ dialogs: result, health: { healthy, lastSuccessAt: health?.lastSuccessAt ?? null } });
}

export async function POST(req: NextRequest) {
  if (!await requireApprovedSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ogiltiga uppgifter" }, { status: 400 });
  const [row] = await db.select({ propertyId: properties.id, ownerId: owners.id, ownerEmail: owners.email })
    .from(properties).innerJoin(owners, eq(properties.ownerId, owners.id))
    .where(eq(properties.id, parsed.data.propertyId)).limit(1);
  if (!row?.ownerEmail) return NextResponse.json({ error: "Objektet saknar uthyrare med e-postadress" }, { status: 400 });
  const email = mailboxAddress(row.ownerEmail);
  const userId = await gmailAutomationUserId();
  const messages = await gmailGetThread(userId, parsed.data.gmailThreadId);
  if (!messages.some((message) => mailboxAddress(message.from) === email)) {
    return NextResponse.json({ error: "Tråden innehåller inget mejl från objektets uthyrare" }, { status: 400 });
  }
  const key = landlordConversationLockKey("email", email, parsed.data.gmailThreadId)!;
  const token = await acquireLandlordPropertyLock(key);
  if (!token) return NextResponse.json({ error: "Dialogen behandlas just nu. Försök igen om en stund." }, { status: 409 });
  try {
    const now = new Date().toISOString();
    const [inserted] = await db.insert(landlordDialogs).values({
      id: nanoid(), propertyId: row.propertyId, ownerId: row.ownerId, gmailThreadId: parsed.data.gmailThreadId,
      landlordEmail: email, enrolledAt: now, active: true, createdAt: now, updatedAt: now,
    }).onConflictDoNothing().returning();
    if (!inserted) return NextResponse.json({ error: "Tråden är redan ansluten till ett objekt" }, { status: 409 });
    return NextResponse.json({ dialog: inserted }, { status: 201 });
  } finally { await releaseLandlordPropertyLock(key, token); }
}

export async function PATCH(req: NextRequest) {
  if (!await requireApprovedSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ogiltiga uppgifter" }, { status: 400 });
  // Resuming starts from now; it must not send replies to messages that arrived
  // while the agent was paused.
  const now = new Date().toISOString();
  const [updated] = await db.update(landlordDialogs).set({
    active: parsed.data.active, ...(parsed.data.active ? { enrolledAt: now, lastSeenFingerprint: null } : {}), updatedAt: now,
  }).where(and(eq(landlordDialogs.id, parsed.data.id))).returning();
  return updated ? NextResponse.json({ dialog: updated }) : NextResponse.json({ error: "Dialogen saknas" }, { status: 404 });
}

// Called only after a person has inspected the Gmail thread and confirmed the
// uncertain send outcome. It never retries or sends the old reply.
export async function PUT(req: NextRequest) {
  if (!await requireApprovedSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = resolveSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Bekräftad kontroll krävs" }, { status: 400 });
  const now = new Date().toISOString();
  const result = await db.transaction(async (tx) => {
    const [existing] = await tx.select().from(landlordReplyRuns).where(eq(landlordReplyRuns.gmailMessageId, parsed.data.gmailMessageId)).limit(1);
    if (!existing) return { error: "Händelsen saknas", status: 404 } as const;
    const [dialog] = await tx.update(landlordDialogs).set({ lastSeenFingerprint: null }).where(and(
      eq(landlordDialogs.id, existing.dialogId),
      or(isNull(landlordDialogs.leaseUntil), lt(landlordDialogs.leaseUntil, now)),
    )).returning({ id: landlordDialogs.id });
    if (!dialog) return { error: "Dialogen behandlas just nu", status: 409 } as const;
    const [run] = await tx.update(landlordReplyRuns).set({
      ...(existing.status === "sent" ? {} : { status: "resolved" }), attachmentsNeedReview: false, updatedAt: now,
    })
      .where(and(eq(landlordReplyRuns.gmailMessageId, parsed.data.gmailMessageId),
        or(inArray(landlordReplyRuns.status, ["claimed", "sending", "send_uncertain", "needs_review"]),
          eq(landlordReplyRuns.attachmentsNeedReview, true)))).returning();
    return run ? { run } as const : { error: "Händelsen behöver inte markeras som kontrollerad", status: 409 } as const;
  });
  return "run" in result ? NextResponse.json({ run: result.run }) : NextResponse.json({ error: result.error }, { status: result.status });
}
