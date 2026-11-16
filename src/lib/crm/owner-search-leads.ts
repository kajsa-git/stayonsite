export interface OwnerSearchLead {
  id: string;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  cities: string[];
}

// Sökorter anges uttryckligen på uthyrarkortet; annan löptext är inte ett
// löfte om att uthyraren kan erbjuda bostäder på den orten.
export function ownerSearchCities(notes: string | null | undefined): string[] {
  const cities = [...(notes ?? "").matchAll(/^[ \t]*sökorter[ \t]*:[ \t]*([^\r\n]*)/gim)]
    .flatMap((match) => match[1].split(/[,;/]|\s+och\s+/i))
    .map((city) => city.trim().replace(/[.\s]+$/, ""))
    .filter(Boolean);
  return [...new Map(cities.map((city) => [normalizeOwnerSearch(city), city])).values()];
}

export function normalizeOwnerSearch(value: string): string {
  return value.toLowerCase().trim().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}

/** En ort i fritextsökningen ska kunna ersätta förfrågans ursprungliga ort. */
export function isOwnerSearchCity(leads: OwnerSearchLead[], query: string): boolean {
  const normalized = normalizeOwnerSearch(query);
  return !!normalized && leads.some((lead) => lead.cities.some((city) => normalizeOwnerSearch(city) === normalized));
}

export function filterOwnerSearchLeads(
  leads: OwnerSearchLead[],
  { city = "", query = "", ownerId = "" }: { city?: string | null; query?: string; ownerId?: string },
): OwnerSearchLead[] {
  const cities = (city ?? "").split(/[,;/]|\s+och\s+/i).map(normalizeOwnerSearch).filter(Boolean);
  const q = normalizeOwnerSearch(query);
  if (!cities.length && !q) return [];

  return leads.filter((lead) => {
    if (ownerId && lead.id !== ownerId) return false;
    if (cities.length && !lead.cities.some((candidate) => cities.some((term) => normalizeOwnerSearch(candidate).includes(term)))) return false;
    const searchable = normalizeOwnerSearch([lead.name, lead.contactPerson, lead.phone, lead.email, ...lead.cities].filter(Boolean).join(" "));
    return !q || searchable.includes(q);
  });
}
