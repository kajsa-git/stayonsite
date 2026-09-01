type PublicSeoFacts = {
  name: string;
  slug?: string | null;
  city?: string | null;
  postalCode?: string | null;
  squareMeters?: number | null;
  bedrooms?: number | null;
  beds?: number | null;
};

function swedishList(parts: string[]): string {
  if (parts.length < 2) return parts[0] ?? "";
  return `${parts.slice(0, -1).join(", ")} och ${parts.at(-1)}`;
}

function factsText(facts: PublicSeoFacts): string {
  return swedishList(
    [
      facts.squareMeters != null && `${facts.squareMeters} m²`,
      facts.bedrooms != null && `${facts.bedrooms} sovrum`,
      facts.beds != null && `${facts.beds} ${facts.beds === 1 ? "bädd" : "bäddar"}`,
    ].filter(Boolean) as string[],
  );
}

function descriptionVariant(slug: string | null | undefined): number {
  const suffix = slug?.match(/-(\d+)$/)?.[1];
  return suffix ? (Number(suffix) - 1) % 3 : 0;
}

// Saklig nödlösning för äldre publicerade objekt som saknar extern beskrivning.
// Nya publiceringar stoppas av publication-seo.ts tills en riktig, unik text finns.
export function publicPropertyDescription(
  publicDescription: string | null | undefined,
  facts: PublicSeoFacts,
): string {
  const authored = publicDescription?.trim();
  if (authored) return authored;

  const place = [facts.postalCode, facts.city].filter(Boolean).join(" ") || "Sverige";
  const details = factsText(facts) || "de uppgifter som visas på sidan";

  switch (descriptionVariant(facts.slug)) {
    case 1:
      return `${facts.name} är ett separat publicerat boendealternativ i ${place}. Bostaden har ${details} och är avsedd för företag som ordnar boende åt personal under projekt eller tidsbegränsade uppdrag. StayOnSite bekräftar aktuella datum, villkor och praktiska detaljer före bokning.`;
    case 2:
      return `För företag med personal i ${place} omfattar ${facts.name.toLowerCase()} ${details}. Boendet presenteras som ett eget alternativ för projektteam och längre arbetsvistelser. Kontakta StayOnSite för besked om tillgänglighet, hyresperiod och vad som ingår i upplägget.`;
    default:
      return `${facts.name} ligger i ${place} och omfattar ${details}. Boendet publiceras för företag som söker en praktisk lösning för personal vid projekt och tillfälliga uppdrag. Kontakta StayOnSite för aktuell tillgänglighet, möjlig hyresperiod och bekräftelse av vad som ingår.`;
  }
}

export function truncateSeoDescription(text: string, maxLength = 160): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  const prefix = normalized.slice(0, maxLength - 1);
  const lastSpace = prefix.lastIndexOf(" ");
  return `${prefix.slice(0, Math.max(lastSpace, maxLength - 20)).trimEnd()}…`;
}
