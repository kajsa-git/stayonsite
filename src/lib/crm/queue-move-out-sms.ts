import { and, eq, sql } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { db as defaultDb } from "./db";
import { hasUnfilledMoveOutSmsFields, moveOutSmsSource, type MoveOutRecipient } from "./move-out-sms";
import { normalizePhoneE164 } from "./phone-links";
import * as schema from "./schema";
import { contacts, outboxMessages, owners, properties, requests } from "./schema";

type DB = LibSQLDatabase<typeof schema>;
type QueueResult =
  | { ok: true; message: typeof outboxMessages.$inferSelect }
  | { ok: false; status: number; error: string };

export async function queueMoveOutSms(
  requestId: string,
  input: { toPhone: unknown; body: unknown; contactId: unknown; ownerId: unknown; recipient: unknown; submissionId: unknown },
  options?: { db?: DB },
): Promise<QueueResult> {
  const db = options?.db ?? defaultDb;
  const toPhone = normalizePhoneE164(typeof input.toPhone === "string" ? input.toPhone : null);
  const body = typeof input.body === "string" ? input.body.trim() : "";
  const contactId = typeof input.contactId === "string" && input.contactId ? input.contactId : null;
  const ownerId = typeof input.ownerId === "string" && input.ownerId ? input.ownerId : null;
  const recipient = input.recipient;
  const submissionId = typeof input.submissionId === "string" ? input.submissionId : "";
  if (recipient !== "tenant" && recipient !== "landlord") return { ok: false, status: 400, error: "Välj mottagare." };
  if ((recipient === "tenant" && ownerId) || (recipient === "landlord" && contactId)) return { ok: false, status: 400, error: "Mottagaren hör inte till den valda rollen." };
  if (!toPhone) return { ok: false, status: 400, error: "Ange ett giltigt telefonnummer." };
  if (!body || body.length > 1600) return { ok: false, status: 400, error: "Meddelandet måste innehålla 1–1600 tecken." };
  if (hasUnfilledMoveOutSmsFields(body)) return { ok: false, status: 400, error: "Fyll i uppgifterna inom hakparenteser först." };
  if (!/^[a-zA-Z0-9-]{16,80}$/.test(submissionId)) return { ok: false, status: 400, error: "Utskicket saknar giltig identifierare." };

  const [request] = await db.select({ companyId: requests.companyId, propertyId: requests.wonPropertyId, status: requests.status,
    endDate: requests.endDate, ongoing: requests.endDateOngoing, doneAt: requests.moveOutDoneAt })
    .from(requests).where(eq(requests.id, requestId));
  if (!request) return { ok: false, status: 404, error: "Uppdraget hittades inte." };
  if (!["won", "invoiced"].includes(request.status) || !request.endDate || request.ongoing || request.doneAt) {
    return { ok: false, status: 409, error: "Avflyttningen är inte längre öppen." };
  }
  if (contactId) {
    const [contact] = await db.select({ phone: contacts.phone }).from(contacts)
      .where(and(eq(contacts.id, contactId), eq(contacts.companyId, request.companyId)));
    if (!contact || normalizePhoneE164(contact.phone) !== toPhone) {
      return { ok: false, status: 400, error: "Telefonnumret stämmer inte med den valda kontakten." };
    }
  }
  if (ownerId) {
    const [owner] = await db.select({ phone: owners.phone }).from(properties)
      .innerJoin(owners, eq(properties.ownerId, owners.id))
      .where(and(eq(properties.id, request.propertyId ?? ""), eq(owners.id, ownerId)));
    if (!owner || normalizePhoneE164(owner.phone) !== toPhone) {
      return { ok: false, status: 400, error: "Telefonnumret stämmer inte med den kopplade uthyraren." };
    }
  }

  const source = moveOutSmsSource(requestId, recipient as MoveOutRecipient);
  const id = `move-out:${recipient}:${requestId}:${submissionId}`;
  // En enda SQL-sats gör att två flikar inte kan köa var sitt meddelande medan
  // ett utskick redan väntar. Samma submissionId kan tryggt försökas igen.
  await db.run(sql`
    INSERT OR IGNORE INTO ${outboxMessages} (id, to_phone, body, contact_id, owner_id, status, source)
    SELECT ${id}, ${toPhone}, ${body}, ${contactId}, ${ownerId}, 'queued', ${source}
    WHERE NOT EXISTS (
      SELECT 1 FROM ${outboxMessages}
      WHERE ${outboxMessages.source} = ${source}
        AND ${outboxMessages.status} IN ('queued', 'sending')
    ) AND EXISTS (
      SELECT 1 FROM ${requests} WHERE ${requests.id} = ${requestId}
        AND ${requests.status} IN ('won', 'invoiced')
        AND ${requests.endDate} IS NOT NULL
        AND (${requests.endDateOngoing} IS NULL OR ${requests.endDateOngoing} = 0)
        AND ${requests.moveOutDoneAt} IS NULL
    )
  `);
  const [message] = await db.select().from(outboxMessages).where(eq(outboxMessages.id, id));
  if (message) {
    // En återanvänd identifierare får aldrig dölja ett annat meddelande.
    if (message.source !== source || message.toPhone !== toPhone || message.body !== body || message.contactId !== contactId || message.ownerId !== ownerId) {
      return { ok: false, status: 409, error: "Utskicket har redan använts med andra uppgifter." };
    }
    return { ok: true, message };
  }
  return { ok: false, status: 409, error: "Ett sms väntar redan på att skickas, eller avflyttningen är inte längre öppen." };
}
