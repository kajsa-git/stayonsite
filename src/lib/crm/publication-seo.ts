import { and, eq } from "drizzle-orm";
import { db } from "./db";
import { properties, type Property } from "./schema";
import { publicDisplayName } from "./slug";

export const MIN_PUBLIC_DESCRIPTION_LENGTH = 80;

const SEO_FIELDS = [
  "published",
  "status",
  "publicName",
  "slug",
  "publicDescription",
  "city",
  "postalCode",
  "squareMeters",
  "bedrooms",
  "beds",
] as const;

type PublicationCandidate = Pick<
  Property,
  | "id"
  | "published"
  | "status"
  | "publicName"
  | "slug"
  | "publicDescription"
  | "city"
  | "postalCode"
  | "squareMeters"
  | "bedrooms"
  | "beds"
>;

type ComparableListing = Pick<
  PublicationCandidate,
  "id" | "publicName" | "slug" | "publicDescription" | "city" | "bedrooms" | "beds"
>;

function normalizedSeoText(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFKC")
    .toLocaleLowerCase("sv")
    .replace(/\s+/g, " ")
    .trim();
}

export function shouldValidatePublication(
  existing: Pick<Property, "published" | "status"> | undefined,
  body: Record<string, unknown>,
  candidate: Pick<Property, "published" | "status">,
): boolean {
  const willBePublic = candidate.published === true && (candidate.status ?? "available") === "available";
  if (!willBePublic) return false;

  const wasPublic = existing?.published === true && existing.status === "available";
  if (!wasPublic) return true;

  return SEO_FIELDS.some((field) => Object.prototype.hasOwnProperty.call(body, field));
}

export function publicationSeoProblem(
  candidate: PublicationCandidate,
  otherListings: ComparableListing[],
): string | null {
  if (!candidate.city?.trim()) {
    return "Lägg till ort innan boendet publiceras på hemsidan.";
  }
  if (!candidate.slug?.trim()) {
    return "Spara objektet med en publik URL innan det publiceras på hemsidan.";
  }

  const description = candidate.publicDescription?.trim() ?? "";
  if (description.length < MIN_PUBLIC_DESCRIPTION_LENGTH) {
    return `Lägg till en unik extern beskrivning på minst ${MIN_PUBLIC_DESCRIPTION_LENGTH} tecken före publicering.`;
  }

  const displayName = publicDisplayName(
    candidate.publicName,
    { city: candidate.city, bedrooms: candidate.bedrooms, beds: candidate.beds },
    candidate.slug,
  );
  const comparableName = normalizedSeoText(displayName);
  const comparableDescription = normalizedSeoText(description);

  for (const other of otherListings) {
    if (other.id === candidate.id) continue;
    const otherName = publicDisplayName(
      other.publicName,
      { city: other.city, bedrooms: other.bedrooms, beds: other.beds },
      other.slug,
    );
    if (normalizedSeoText(otherName) === comparableName) {
      return `Det publika namnet används redan av “${otherName}”. Ange ett unikt publikt namn före publicering.`;
    }
    if (normalizedSeoText(other.publicDescription) === comparableDescription) {
      return `Den externa beskrivningen är identisk med “${otherName}”. Anpassa texten för det här boendet före publicering.`;
    }
  }

  return null;
}

export async function validatePublicationSeo(candidate: PublicationCandidate): Promise<string | null> {
  const otherListings = await db
    .select({
      id: properties.id,
      publicName: properties.publicName,
      slug: properties.slug,
      publicDescription: properties.publicDescription,
      city: properties.city,
      bedrooms: properties.bedrooms,
      beds: properties.beds,
    })
    .from(properties)
    .where(and(eq(properties.published, true), eq(properties.status, "available")));

  return publicationSeoProblem(candidate, otherListings);
}
