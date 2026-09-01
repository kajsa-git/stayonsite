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
  slug?: string | null,
): string {
  const manual = (publicName ?? "").trim();
  const name = manual || buildPublicName(facts);
  const normalizedSlug = slugify(slug ?? "");
  const generatedRoot = slugify(name);

  // ensureUniqueSlug() lägger -2, -3 … när flera objekt får samma auto-namn.
  // Spegla den redan unika URL-markören i titel/H1 så att två publicerade
  // bostäder aldrig får identiska SEO-rubriker. Den första behåller den korta
  // grundrubriken; efterföljande blir t.ex. "… · bostad 2".
  if (normalizedSlug.startsWith(`${generatedRoot}-`)) {
    const suffix = normalizedSlug.slice(generatedRoot.length).match(/^-(\d+)$/)?.[1];
    if (suffix) return `${name} · bostad ${suffix}`;
  }

  return name;
}
