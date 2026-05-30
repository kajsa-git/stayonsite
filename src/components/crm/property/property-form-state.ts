// Ren form-state-helper för objektredigering. Bryter ut typning + mapping från
// PropertyView/PropertyEditForm så de kan testas isolerat (round-trip-test) och
// återanvändas av skapa-formuläret. INGEN beteendeförändring — exakt samma mapping
// som tidigare låg inline i PropertyView.handleSave/toForm.
import type { PropertyWithOwner } from "@/lib/crm/owners";
import { buildPublicName, slugify } from "@/lib/crm/slug";
import type { OwnerPickerValue } from "./OwnerPicker";

export type EditForm = {
  ownerId: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  squareMeters: string;
  bedrooms: string;
  beds: string;
  bathrooms: string;
  washingMachines: string;
  dryers: string;
  parkingSpaces: string;
  skick: string;
  rentIn: string;
  rentOut: string;
  moveInFrom: string;
  availableTo: string;
  ownerType: string;
  ownerArrangement: string;
  ownerName: string;
  ownerOrgNr: string;
  ownerContactPerson: string;
  ownerPhone: string;
  ownerEmail: string;
  notes: string;
  publicName: string;
  slug: string;
  publicDescription: string;
  publicDescriptionEn: string;
  publicDescriptionPl: string;
  skickEn: string;
  skickPl: string;
  inclusions: string[];
  inclusionsEn: string[];
  inclusionsPl: string[];
  distances: { label: string; address?: string; km: number; minutes: number }[];
  furnished: boolean;
  kitchen: boolean;
  garage: boolean;
  broadband: boolean;
  egetBoende: boolean;
  dishwasher: boolean;
  allIncluded: boolean;
  excludedNote: string;
  linensIncluded: boolean;
  heatWaterIncluded: boolean;
  specialNote: string;
};

const s = (v: string | null | undefined) => v ?? "";
const ns = (v: number | null | undefined) => v?.toString() ?? "";

// Property → redigerbart formulär (strängar i fälten, defaults för land/uthyrartyp).
export function toPropertyForm(p: PropertyWithOwner): EditForm {
  return {
    ownerId: s(p.ownerId),
    address: s(p.address),
    postalCode: s(p.postalCode),
    city: s(p.city),
    country: s(p.country) || "Sverige",
    squareMeters: ns(p.squareMeters),
    bedrooms: ns(p.bedrooms),
    beds: ns(p.beds),
    bathrooms: ns(p.bathrooms),
    washingMachines: ns(p.washingMachines),
    dryers: ns(p.dryers),
    parkingSpaces: ns(p.parkingSpaces),
    skick: s(p.skick),
    rentIn: ns(p.rentIn),
    rentOut: ns(p.rentOut),
    moveInFrom: s(p.moveInFrom),
    availableTo: s(p.availableTo),
    ownerType: s(p.ownerType) || "privatperson",
    ownerArrangement: s(p.ownerArrangement) || "direkt",
    ownerName: s(p.ownerName),
    ownerOrgNr: s(p.ownerOrgNr),
    ownerContactPerson: s(p.ownerContactPerson),
    ownerPhone: s(p.ownerPhone),
    ownerEmail: s(p.ownerEmail),
    notes: s(p.notes),
    publicName: s(p.publicName),
    slug: s(p.slug),
    publicDescription: s(p.publicDescription),
    publicDescriptionEn: s(p.publicDescriptionEn),
    publicDescriptionPl: s(p.publicDescriptionPl),
    skickEn: s(p.skickEn),
    skickPl: s(p.skickPl),
    inclusions: p.inclusions ?? [],
    inclusionsEn: p.inclusionsEn ?? [],
    inclusionsPl: p.inclusionsPl ?? [],
    distances: p.distances ?? [],
    furnished: !!p.furnished,
    kitchen: !!p.kitchen,
    garage: !!p.garage,
    broadband: !!p.broadband,
    egetBoende: !!p.egetBoende,
    dishwasher: !!p.dishwasher,
    allIncluded: !!p.allIncluded,
    excludedNote: s(p.excludedNote),
    linensIncluded: !!p.linensIncluded,
    heatWaterIncluded: !!p.heatWaterIncluded,
    specialNote: s(p.specialNote),
  };
}

// Formulär → API-payload (PATCH/POST på /api/crm/properties). Tomma strängar → null,
// siffror parsas, uthyraridentiteten skickas med (normaliseras server-side).
export function propertyFormToPayload(form: EditForm): Partial<PropertyWithOwner> {
  const t = (v: string) => v.trim() || null;
  const num = (v: string) => (v ? parseFloat(v) : null);
  const int = (v: string) => (v ? parseInt(v, 10) : null);
  return {
    address: t(form.address),
    postalCode: t(form.postalCode),
    city: t(form.city),
    country: form.country.trim() || "Sverige",
    squareMeters: num(form.squareMeters),
    bedrooms: int(form.bedrooms),
    beds: int(form.beds),
    bathrooms: int(form.bathrooms),
    washingMachines: int(form.washingMachines),
    dryers: int(form.dryers),
    parkingSpaces: int(form.parkingSpaces),
    skick: t(form.skick),
    rentIn: num(form.rentIn),
    rentOut: num(form.rentOut),
    moveInFrom: t(form.moveInFrom),
    availableTo: t(form.availableTo),
    ownerType: form.ownerType,
    ownerId: form.ownerId || null,
    ownerArrangement: form.ownerArrangement,
    ownerName: t(form.ownerName),
    ownerOrgNr: t(form.ownerOrgNr),
    ownerContactPerson: t(form.ownerContactPerson),
    ownerPhone: t(form.ownerPhone),
    ownerEmail: t(form.ownerEmail),
    notes: t(form.notes),
    publicName: t(form.publicName),
    slug: t(form.slug),
    publicDescription: t(form.publicDescription),
    publicDescriptionEn: t(form.publicDescriptionEn),
    publicDescriptionPl: t(form.publicDescriptionPl),
    skickEn: t(form.skickEn),
    skickPl: t(form.skickPl),
    inclusions: form.inclusions.map((x) => x.trim()).filter(Boolean),
    inclusionsEn: form.inclusionsEn,
    inclusionsPl: form.inclusionsPl,
    distances: form.distances,
    furnished: form.furnished,
    kitchen: form.kitchen,
    garage: form.garage,
    broadband: form.broadband,
    egetBoende: form.egetBoende,
    dishwasher: form.dishwasher,
    allIncluded: form.allIncluded,
    excludedNote: t(form.excludedNote),
    linensIncluded: form.linensIncluded,
    heatWaterIncluded: form.heatWaterIncluded,
    specialNote: t(form.specialNote),
  };
}

// Deterministiskt auto-namn från formulärets ort/storlek (speglar serverns default).
export function autoPublicNameForForm(form: EditForm): string {
  return buildPublicName({
    city: form.city.trim() || null,
    bedrooms: form.bedrooms ? parseInt(form.bedrooms, 10) : null,
    beds: form.beds ? parseInt(form.beds, 10) : null,
  });
}

// Förhandsvisad slug: explicit slug först, annars publikt namn, annars auto-namn.
export function previewPublicSlug(form: EditForm): string {
  return form.slug.trim()
    ? slugify(form.slug)
    : slugify(form.publicName.trim() || autoPublicNameForForm(form));
}

// OwnerPicker-patch → partiell form-uppdatering. Bara medskickade nycklar uppdateras
// (defaults för type/arrangement, tom sträng för övriga null).
export function ownerPatchToForm(patch: Partial<OwnerPickerValue>): Partial<EditForm> {
  const has = (k: keyof OwnerPickerValue) => Object.prototype.hasOwnProperty.call(patch, k);
  return {
    ...(has("ownerId") ? { ownerId: patch.ownerId ?? "" } : {}),
    ...(has("ownerType") ? { ownerType: patch.ownerType ?? "privatperson" } : {}),
    ...(has("ownerArrangement") ? { ownerArrangement: patch.ownerArrangement ?? "direkt" } : {}),
    ...(has("ownerName") ? { ownerName: patch.ownerName ?? "" } : {}),
    ...(has("ownerOrgNr") ? { ownerOrgNr: patch.ownerOrgNr ?? "" } : {}),
    ...(has("ownerContactPerson") ? { ownerContactPerson: patch.ownerContactPerson ?? "" } : {}),
    ...(has("ownerPhone") ? { ownerPhone: patch.ownerPhone ?? "" } : {}),
    ...(has("ownerEmail") ? { ownerEmail: patch.ownerEmail ?? "" } : {}),
  };
}
