import { and, eq, inArray } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";
import { HUS_PUBLICATION_SMS_SOURCE, husPublicationSmsId } from "./hus-publication";
import { LANDLORD_SMS_SOURCE } from "./landlord-sms-source";

const {
  agreementAcceptances,
  companies,
  contacts,
  emails,
  matches,
  matchEvents,
  landlordDialogs,
  landlordImageCandidates,
  landlordPropertyLocks,
  landlordReplyRuns,
  landlordSmsDialogs,
  landlordSmsRuns,
  notes,
  ownerOutreach,
  outboxMessages,
  owners,
  properties,
  rentalReviews,
  propertyImages,
  propertyNotes,
  requests,
  shareLinks,
} = schema;

// libSQL/Turso kör med foreign_keys = OFF (ingen PRAGMA sätts på anslutningen, och
// över Tursos remote-protokoll går den inte att lita på per-anslutning). Därför fyrar
// `onDelete: cascade`/`set null` i schemat ALDRIG i produktion. Vi raderar i stället
// barnen explicit, i rätt ordning, inom en transaktion så att en radering blir atomär.
//
// Använd alltid dessa helpers från DELETE-handlers i stället för en naken db.delete().

// Drizzle-transaktionens typ — härledd från LibSQLDatabase så modulen kan importeras
// utan att en DB-anslutning skapas (viktigt för enhetstester mot in-memory libSQL).
type Tx = Parameters<Parameters<LibSQLDatabase<typeof schema>["transaction"]>[0]>[0];

async function removeLandlordDialogLinks(tx: Tx, key: "property" | "owner", id: string) {
  const mail = await tx.select({ id: landlordDialogs.id }).from(landlordDialogs)
    .where(key === "property" ? eq(landlordDialogs.propertyId, id) : eq(landlordDialogs.ownerId, id));
  if (mail.length) {
    await tx.delete(landlordReplyRuns).where(inArray(landlordReplyRuns.dialogId, mail.map((row) => row.id)));
    await tx.delete(landlordDialogs).where(inArray(landlordDialogs.id, mail.map((row) => row.id)));
  }
  const sms = await tx.select({ id: landlordSmsDialogs.id }).from(landlordSmsDialogs)
    .where(key === "property" ? eq(landlordSmsDialogs.propertyId, id) : eq(landlordSmsDialogs.ownerId, id));
  if (sms.length) {
    const runs = await tx.select({ outboxId: landlordSmsRuns.outboxId }).from(landlordSmsRuns)
      .where(inArray(landlordSmsRuns.dialogId, sms.map((row) => row.id)));
    const ids = runs.map((row) => row.outboxId).filter((value): value is string => !!value);
    if (ids.length) await tx.update(outboxMessages).set({ status: "failed", error: "Bostaden eller uthyraren har tagits bort." })
      .where(and(inArray(outboxMessages.id, ids), eq(outboxMessages.source, LANDLORD_SMS_SOURCE), eq(outboxMessages.status, "queued")));
    await tx.delete(landlordSmsRuns).where(inArray(landlordSmsRuns.dialogId, sms.map((row) => row.id)));
    await tx.delete(landlordSmsDialogs).where(inArray(landlordSmsDialogs.id, sms.map((row) => row.id)));
  }
}

// Företag → kontakter, förfrågningar (+ deras matchningar, delningslänkar och
// avtalsgodkännanden), noter, mejl. ownerOutreach.requestId nollställs (rundan
// tillhör objektet, inte företaget).
export async function deleteCompanyDeep(tx: Tx, companyId: string): Promise<void> {
  const reqRows = await tx
    .select({ id: requests.id })
    .from(requests)
    .where(eq(requests.companyId, companyId));
  const reqIds = reqRows.map((r) => r.id);
  if (reqIds.length) {
    await tx.delete(matches).where(inArray(matches.requestId, reqIds));
    await tx.delete(matchEvents).where(inArray(matchEvents.requestId, reqIds));
    await tx.delete(shareLinks).where(inArray(shareLinks.requestId, reqIds));
    await tx.delete(agreementAcceptances).where(inArray(agreementAcceptances.requestId, reqIds));
    await tx.update(ownerOutreach).set({ requestId: null }).where(inArray(ownerOutreach.requestId, reqIds));
  }
  await tx.delete(agreementAcceptances).where(eq(agreementAcceptances.companyId, companyId));
  await tx.delete(emails).where(eq(emails.companyId, companyId));
  await tx.delete(notes).where(eq(notes.companyId, companyId));
  await tx.delete(requests).where(eq(requests.companyId, companyId));
  await tx.delete(contacts).where(eq(contacts.companyId, companyId));
  await tx.delete(companies).where(eq(companies.id, companyId));
}

// Förfrågan → dess matchningar, delningslänkar och avtalsgodkännanden.
// ownerOutreach.requestId nollställs.
export async function deleteRequestDeep(tx: Tx, requestId: string): Promise<void> {
  await tx.delete(matches).where(eq(matches.requestId, requestId));
  await tx.delete(matchEvents).where(eq(matchEvents.requestId, requestId));
  await tx.delete(shareLinks).where(eq(shareLinks.requestId, requestId));
  await tx.delete(agreementAcceptances).where(eq(agreementAcceptances.requestId, requestId));
  await tx.update(ownerOutreach).set({ requestId: null }).where(eq(ownerOutreach.requestId, requestId));
  await tx.delete(requests).where(eq(requests.id, requestId));
}

// Objekt → matchningar (+ deras match-scopade delningslänkar), uthyrar-rundor,
// kontaktlogg, bildrader. requests.wonPropertyId nollställs (det är en lös
// referens, inte en FK). R2-objekten städas separat i bild-routern innan
// raderingen (se properties/[id]/route.ts).
export async function deletePropertyDeep(tx: Tx, propertyId: string): Promise<void> {
  await removeLandlordDialogLinks(tx, "property", propertyId);
  const matchRows = await tx
    .select({ id: matches.id })
    .from(matches)
    .where(eq(matches.propertyId, propertyId));
  const matchIds = matchRows.map((m) => m.id);
  if (matchIds.length) {
    await tx.delete(shareLinks).where(inArray(shareLinks.matchId, matchIds));
    await tx.delete(matchEvents).where(inArray(matchEvents.matchId, matchIds));
  }
  await tx.delete(agreementAcceptances).where(eq(agreementAcceptances.propertyId, propertyId));
  await tx.delete(matches).where(eq(matches.propertyId, propertyId));
  await tx.delete(ownerOutreach).where(eq(ownerOutreach.propertyId, propertyId));
  await tx.delete(rentalReviews).where(eq(rentalReviews.propertyId, propertyId));
  // Do not leave an unsent link to an object that no longer exists.
  await tx.delete(outboxMessages).where(and(
    eq(outboxMessages.id, husPublicationSmsId(propertyId)),
    eq(outboxMessages.source, HUS_PUBLICATION_SMS_SOURCE),
    inArray(outboxMessages.status, ["pending_publication", "queued"]),
  ));
  await tx.delete(propertyNotes).where(eq(propertyNotes.propertyId, propertyId));
  await tx.delete(landlordImageCandidates).where(eq(landlordImageCandidates.propertyId, propertyId));
  await tx.delete(landlordPropertyLocks).where(eq(landlordPropertyLocks.propertyId, propertyId));
  await tx.delete(propertyImages).where(eq(propertyImages.propertyId, propertyId));
  await tx.update(requests).set({ wonPropertyId: null }).where(eq(requests.wonPropertyId, propertyId));
  await tx.delete(properties).where(eq(properties.id, propertyId));
}

// Uthyrare → nollställ alla lösa kopplingar (objekt, rundor, mejl) innan raderingen.
// Avtalslänkar och signeringar raderas — de saknar mening utan uthyraren.
export async function deleteOwnerDeep(tx: Tx, ownerId: string): Promise<void> {
  await removeLandlordDialogLinks(tx, "owner", ownerId);
  const now = new Date().toISOString();
  await tx.update(properties).set({ ownerId: null, updatedAt: now }).where(eq(properties.ownerId, ownerId));
  await tx.update(ownerOutreach).set({ ownerId: null }).where(eq(ownerOutreach.ownerId, ownerId));
  await tx.update(emails).set({ ownerId: null }).where(eq(emails.ownerId, ownerId));
  await tx.delete(shareLinks).where(eq(shareLinks.ownerId, ownerId));
  await tx.delete(agreementAcceptances).where(eq(agreementAcceptances.ownerId, ownerId));
  await tx.delete(owners).where(eq(owners.id, ownerId));
}

// Kontakt → nollställ mejl-koppling innan raderingen (emails.contactId är denormaliserad).
export async function deleteContactDeep(tx: Tx, contactId: string): Promise<void> {
  await tx.update(emails).set({ contactId: null }).where(eq(emails.contactId, contactId));
  await tx.delete(contacts).where(eq(contacts.id, contactId));
}
