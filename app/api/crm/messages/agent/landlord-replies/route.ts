import { and, desc, eq, inArray, ne, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { bearerAuthorized } from "@/lib/crm/bearer-auth";
import { db } from "@/lib/crm/db";
import { LANDLORD_SMS_SOURCE } from "@/lib/crm/landlord-sms-source";
import { unambiguousLandlordPhone } from "@/lib/crm/landlord-sms-identity";
import { normalizePhoneE164 } from "@/lib/crm/phone-links";
import { contacts, inboxMessages, landlordAgentHealth, landlordSmsDialogs, landlordSmsReceipts, landlordSmsRuns, outboxMessages, owners, properties } from "@/lib/crm/schema";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!bearerAuthorized(req, process.env.CRM_AGENT_TOKEN)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const now = new Date().toISOString();
  await db.insert(landlordAgentHealth).values({ id: "mac", lastSuccessAt: now })
    .onConflictDoUpdate({ target: landlordAgentHealth.id, set: { lastSuccessAt: now } });
  const candidates = await db.select().from(outboxMessages).where(and(
    eq(outboxMessages.source, LANDLORD_SMS_SOURCE), eq(outboxMessages.status, "queued"),
  )).orderBy(outboxMessages.createdAt).limit(10);
  const claimed = [];
  for (const candidate of candidates) {
    const row = await db.transaction(async (tx) => {
      const [run] = await tx.select().from(landlordSmsRuns).where(eq(landlordSmsRuns.outboxId, candidate.id)).limit(1);
      const [dialog] = run ? await tx.select().from(landlordSmsDialogs).where(eq(landlordSmsDialogs.id, run.dialogId)).limit(1) : [];
      const [owner] = dialog ? await tx.select().from(owners).where(eq(owners.id, dialog.ownerId)).limit(1) : [];
      const [property] = dialog ? await tx.select({ id: properties.id }).from(properties).where(and(
        eq(properties.id, dialog.propertyId), eq(properties.ownerId, dialog.ownerId),
      )).limit(1) : [];
      const [latest] = await tx.select().from(inboxMessages).where(and(eq(inboxMessages.fromPhone, candidate.toPhone),
        sql`lower(coalesce(${inboxMessages.service}, '')) NOT LIKE '%whats%'`))
        .orderBy(desc(inboxMessages.sentAt), desc(inboxMessages.createdAt)).limit(1);
      const [receipt] = latest ? await tx.select().from(landlordSmsReceipts).where(eq(landlordSmsReceipts.guid, latest.guid)).limit(1) : [];
      const otherPending = await tx.select({ id: outboxMessages.id }).from(outboxMessages).where(and(
        eq(outboxMessages.toPhone, candidate.toPhone), ne(outboxMessages.id, candidate.id),
        inArray(outboxMessages.status, ["draft", "queued", "sending"]),
      )).limit(1);
      const allOwners = await tx.select({ id: owners.id, phone: owners.phone }).from(owners);
      const allContacts = await tx.select({ phone: contacts.phone }).from(contacts);
      const valid = dialog?.active && run?.status === "queued" && Date.parse(run.createdAt) > Date.parse(dialog.enrolledAt)
        && property && dialog.phone === candidate.toPhone
        && normalizePhoneE164(owner?.phone) === dialog.phone && latest?.direction === "in"
        && latest.guid === run.inboxGuid && candidate.replyToInboxIds?.includes(latest.id)
        && receipt?.conversationKind === "direct" && !otherPending.length && unambiguousLandlordPhone(dialog.phone, dialog.ownerId, allOwners, allContacts);
      if (!valid) {
        await tx.update(outboxMessages).set({ status: "failed", error: "Dialogen ändrades eller pausades före utskicket; kontrollera manuellt." })
          .where(and(eq(outboxMessages.id, candidate.id), eq(outboxMessages.status, "queued")));
        return null;
      }
      const [item] = await tx.update(outboxMessages).set({ status: "sending" })
        .where(and(eq(outboxMessages.id, candidate.id), eq(outboxMessages.status, "queued"))).returning();
      if (item && run) await tx.update(landlordSmsRuns).set({ updatedAt: now }).where(eq(landlordSmsRuns.inboxGuid, run.inboxGuid));
      return item ?? null;
    });
    if (row) claimed.push(row);
  }
  return NextResponse.json(claimed);
}
