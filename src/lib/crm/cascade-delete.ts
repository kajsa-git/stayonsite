import { eq, inArray } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";

const {
  agreementAcceptances,
  companies,
  contacts,
  emails,
  matches,
  notes,
  ownerOutreach,
  owners,
  properties,
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
    await tx.delete(shareLinks).where(inArray(shareLinks.requestId, reqIds));
    await tx.delete(agreementAcceptances).where(inArray(agreementAcceptances.requestId, reqIds));
    await tx.update(ownerOutreach).set({ requestId: null }).where(inArray(ownerOutreach.requestId, reqIds));
  }
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
  const matchRows = await tx
    .select({ id: matches.id })
    .from(matches)
    .where(eq(matches.propertyId, propertyId));
  const matchIds = matchRows.map((m) => m.id);
  if (matchIds.length) {
    await tx.delete(shareLinks).where(inArray(shareLinks.matchId, matchIds));
  }
  await tx.delete(agreementAcceptances).where(eq(agreementAcceptances.propertyId, propertyId));
  await tx.delete(matches).where(eq(matches.propertyId, propertyId));
  await tx.delete(ownerOutreach).where(eq(ownerOutreach.propertyId, propertyId));
  await tx.delete(propertyNotes).where(eq(propertyNotes.propertyId, propertyId));
  await tx.delete(propertyImages).where(eq(propertyImages.propertyId, propertyId));
  await tx.update(requests).set({ wonPropertyId: null }).where(eq(requests.wonPropertyId, propertyId));
  await tx.delete(properties).where(eq(properties.id, propertyId));
}

// Uthyrare → nollställ alla lösa kopplingar (objekt, rundor, mejl) innan raderingen.
export async function deleteOwnerDeep(tx: Tx, ownerId: string): Promise<void> {
  const now = new Date().toISOString();
  await tx.update(properties).set({ ownerId: null, updatedAt: now }).where(eq(properties.ownerId, ownerId));
  await tx.update(ownerOutreach).set({ ownerId: null }).where(eq(ownerOutreach.ownerId, ownerId));
  await tx.update(emails).set({ ownerId: null }).where(eq(emails.ownerId, ownerId));
  await tx.delete(owners).where(eq(owners.id, ownerId));
}

// Kontakt → nollställ mejl-koppling innan raderingen (emails.contactId är denormaliserad).
export async function deleteContactDeep(tx: Tx, contactId: string): Promise<void> {
  await tx.update(emails).set({ contactId: null }).where(eq(emails.contactId, contactId));
  await tx.delete(contacts).where(eq(contacts.id, contactId));
}
