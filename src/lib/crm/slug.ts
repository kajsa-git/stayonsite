// Rena hjälpare för publik namngivning + URL-slug. INGA DB-beroenden här —
// modulen importeras både server- och klientside. DB-logik (unik slug) bor i owners.ts.

// Slugify för svenska: gemener, å/ä→a, ö→o, övriga diakritiska tecken bort,
// allt icke-alfanumeriskt → bindestreck, trimma/kollapsa.
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/å/g, "a")
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // ta bort kvarvarande kombinerande diakritiska tecken
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type NameFacts = { city?: string | null; bedrooms?: number | null; beds?: number | null };

// Deterministiskt, SEO-optimerat publikt namn.
// Mönster: "Företagsboende {Stad} · {N} sovrum" (faller tillbaka till bäddar, sedan bara stad).
// "Företagsboende" + ort träffar gap-sökorden ("företagsbostäder", "boende {stad}").
export function buildPublicName(facts: NameFacts): string {
  const city = (facts.city ?? "").trim();
  const base = city ? `Företagsboende ${city}` : "Företagsboende i Sverige";
  if (facts.bedrooms != null && facts.bedrooms > 0) return `${base} · ${facts.bedrooms} sovrum`;
  if (facts.beds != null && facts.beds > 0) return `${base} · ${facts.beds} bäddar`;
  return base;
}

// Den publika rubriken: manuell override om satt, annars det deterministiska namnet.
export function publicDisplayName(
  publicName: string | null | undefined,
  facts: NameFacts,
): string {
  const manual = (publicName ?? "").trim();
  return manual || buildPublicName(facts);
}
