import { eq, inArray } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { normalizePhoneE164 } from "./phone-links";
import { companies, contacts, notes, owners, requests } from "./schema";
import type * as schema from "./schema";

type Reader = Pick<LibSQLDatabase<typeof schema>, "select">;
const emailAddress = (value: string | null) => value?.trim().toLocaleLowerCase("en-US") ?? "";

// A number shared by a landlord and a company contact is normally ambiguous.
// The only exception is an explicitly documented mistaken web enquiry for the
// same email address, where every associated company request is closed/lost.
// Recheck this at enrollment, while composing, and before the Mac sends.
export async function unambiguousLandlordPhone(connection: Reader, phone: string, ownerId: string): Promise<boolean> {
  const [allOwners, allContacts] = await Promise.all([
    connection.select({ id: owners.id, phone: owners.phone, email: owners.email }).from(owners),
    connection.select({ phone: contacts.phone, email: contacts.email, companyId: contacts.companyId, companyName: companies.name })
      .from(contacts).leftJoin(companies, eq(contacts.companyId, companies.id)),
  ]);
  const matched = allOwners.filter((owner) => normalizePhoneE164(owner.phone) === phone);
  if (matched.length !== 1 || matched[0].id !== ownerId) return false;
  const shared = allContacts.filter((contact) => normalizePhoneE164(contact.phone) === phone);
  if (!shared.length) return true;
  const email = emailAddress(matched[0].email);
  if (!email || shared.some((contact) => emailAddress(contact.email) !== email || !contact.companyId
    || contact.companyName?.trim().toLocaleLowerCase("sv-SE") !== `webbförfrågan · ${email}`)) return false;
  const companyIds = [...new Set(shared.map((contact) => contact.companyId))];
  const [companyRequests, companyNotes] = await Promise.all([
    connection.select({ companyId: requests.companyId, status: requests.status }).from(requests).where(inArray(requests.companyId, companyIds)),
    connection.select({ companyId: notes.companyId, content: notes.content }).from(notes).where(inArray(notes.companyId, companyIds)),
  ]);
  return companyIds.every((id) => {
    const associated = companyRequests.filter((request) => request.companyId === id);
    const documented = companyNotes.some((note) => note.companyId === id && /felriktad kundförfrågan/i.test(note.content)
      && /uthyrning/i.test(note.content));
    return documented && associated.length > 0 && associated.every((request) => request.status === "lost");
  });
}
