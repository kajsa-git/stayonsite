import { normalizePhoneE164 } from "./phone-links";

// A number used for both a landlord and a company contact is ambiguous: the
// next message could concern either role or a different business relationship.
export function unambiguousLandlordPhone(phone: string, ownerId: string,
  owners: Array<{ id: string; phone: string | null }>, contacts: Array<{ phone: string | null }>): boolean {
  const matched = owners.filter((owner) => normalizePhoneE164(owner.phone) === phone);
  return matched.length === 1 && matched[0].id === ownerId
    && !contacts.some((contact) => normalizePhoneE164(contact.phone) === phone);
}
