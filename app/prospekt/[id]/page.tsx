import { db } from "@/lib/crm/db";
import { properties, propertyImages } from "@/lib/crm/schema";
import { R2_BUCKET, r2 } from "@/lib/crm/r2";
import { ProspektGallery } from "@/components/prospekt/ProspektGallery";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { asc, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, Car, Check, CookingPot, DoorClosed, MapPin, Sofa, Wifi } from "lucide-react";

export const dynamic = "force-dynamic";

const editorial = { fontFamily: "var(--font-instrument), Georgia, serif" } as const;
const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

type Lang = "sv" | "en" | "pl";
function pickLang(v: string | string[] | undefined): Lang {
  const s = Array.isArray(v) ? v[0] : v;
  return s === "en" || s === "pl" ? s : "sv";
}

const T: Record<Lang, {
  tagline: string;
  title: (c: string | null) => string;
  photos: (n: number) => string;
  details: string;
  condition: string;
  included: string;
  distancesTitle: string;
  mapTitle: string;
  ctaTitle: string;
  ctaSub: string;
  ctaButton: string;
  ctaHref: string;
  footer: string;
  metaDesc: (place: string) => string;
  hl: { furnished: string; kitchen: string; garage: string; broadband: string; eget: string };
  f: { area: string; bedrooms: string; beds: string; bathrooms: string; washer: string; dryer: string; parking: string; from: string; to: string };
  parkingUnit: string;
}> = {
  sv: {
    tagline: "Bostadsförslag",
    title: (c) => (c ? `Boende i ${c}` : "Bostadsförslag"),
    photos: (n) => `${n} bilder`,
    details: "Detaljer",
    condition: "Skick",
    included: "Vad ingår",
    distancesTitle: "Avstånd",
    mapTitle: "Karta",
    ctaTitle: "Intresserad av den här bostaden?",
    ctaSub: "Hör av dig till StayOnSite så hjälper vi dig vidare — ofta med svar inom 24 timmar.",
    ctaButton: "Kontakta oss",
    ctaHref: "https://www.stayonsite.se/kontakt",
    footer: "StayOnSite · Corporate housing i hela Sverige",
    metaDesc: (place) => `Möblerat boende i ${place} via StayOnSite — corporate housing i hela Sverige.`,
    hl: { furnished: "Möblerat", kitchen: "Eget kök", garage: "Garage", broadband: "Bredband ingår", eget: "Eget boende" },
    f: { area: "Yta", bedrooms: "Sovrum", beds: "Bäddar", bathrooms: "Badrum", washer: "Tvättmaskin", dryer: "Tumlare", parking: "Parkering", from: "Tillgänglig från", to: "Tillgänglig till" },
    parkingUnit: "pl.",
  },
  en: {
    tagline: "Housing proposal",
    title: (c) => (c ? `Accommodation in ${c}` : "Housing proposal"),
    photos: (n) => `${n} photos`,
    details: "Details",
    condition: "Condition",
    included: "What's included",
    distancesTitle: "Distances",
    mapTitle: "Map",
    ctaTitle: "Interested in this property?",
    ctaSub: "Get in touch with StayOnSite and we'll help you further — usually a reply within 24 hours.",
    ctaButton: "Contact us",
    ctaHref: "https://www.stayonsite.se/en/corporate-housing-sweden",
    footer: "StayOnSite · Corporate housing across Sweden",
    metaDesc: (place) => `Furnished accommodation in ${place} via StayOnSite — corporate housing across Sweden.`,
    hl: { furnished: "Furnished", kitchen: "Kitchen", garage: "Garage", broadband: "Broadband included", eget: "Private accommodation" },
    f: { area: "Area", bedrooms: "Bedrooms", beds: "Beds", bathrooms: "Bathrooms", washer: "Washing machine", dryer: "Dryer", parking: "Parking", from: "Available from", to: "Available until" },
    parkingUnit: "spots",
  },
  pl: {
    tagline: "Propozycja zakwaterowania",
    title: (c) => (c ? `Zakwaterowanie w ${c}` : "Propozycja zakwaterowania"),
    photos: (n) => `${n} zdjęć`,
    details: "Szczegóły",
    condition: "Stan",
    included: "Co jest wliczone",
    distancesTitle: "Odległości",
    mapTitle: "Mapa",
    ctaTitle: "Zainteresowany tym mieszkaniem?",
    ctaSub: "Skontaktuj się ze StayOnSite, a pomożemy Ci dalej — zwykle odpowiadamy w ciągu 24 godzin.",
    ctaButton: "Skontaktuj się",
    ctaHref: "https://www.stayonsite.se/pl/zakwaterowanie-firmowe",
    footer: "StayOnSite · Zakwaterowanie firmowe w całej Szwecji",
    metaDesc: (place) => `Umeblowane zakwaterowanie w ${place} przez StayOnSite — zakwaterowanie firmowe w całej Szwecji.`,
    hl: { furnished: "Umeblowane", kitchen: "Kuchnia", garage: "Garaż", broadband: "Internet w cenie", eget: "Własne zakwaterowanie" },
    f: { area: "Powierzchnia", bedrooms: "Sypialnie", beds: "Łóżka", bathrooms: "Łazienki", washer: "Pralka", dryer: "Suszarka", parking: "Parking", from: "Dostępne od", to: "Dostępne do" },
    parkingUnit: "miejsc",
  },
};

const LANGS: { code: Lang; label: string }[] = [
  { code: "sv", label: "SV" },
  { code: "en", label: "EN" },
  { code: "pl", label: "PL" },
];

export async function generateMetadata(
  { params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ lang?: string | string[] }> },
): Promise<Metadata> {
  const { id } = await params;
  const lang = pickLang((await searchParams).lang);
  const tr = T[lang];
  const [p] = await db
    .select({
      published: properties.published,
      city: properties.city,
      postalCode: properties.postalCode,
      publicDescription: properties.publicDescription,
      publicDescriptionEn: properties.publicDescriptionEn,
      publicDescriptionPl: properties.publicDescriptionPl,
    })
    .from(properties)
    .where(eq(properties.id, id));
  if (!p || !p.published) return { title: `${tr.tagline} – StayOnSite` };
  const title = `${tr.title(p.city)} – StayOnSite`;
  const place = [p.postalCode, p.city].filter(Boolean).join(" ") || "Sverige";
  const localDesc = lang === "en" ? p.publicDescriptionEn : lang === "pl" ? p.publicDescriptionPl : p.publicDescription;
  const desc = (localDesc || p.publicDescription)?.trim().slice(0, 160) || tr.metaDesc(place);
  return {
    title,
    description: desc,
    openGraph: { title, description: desc, type: "website" },
    twitter: { card: "summary_large_image", title, description: desc },
  };
}

// PUBLIC, no-auth prospekt for a published property.
// Tenant-safe only: NEVER address, owner, "vi hyr för"/"vi hyr ut för" or price.
export default async function ProspektPage(
  { params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ lang?: string | string[] }> },
) {
  const { id } = await params;
  const lang = pickLang((await searchParams).lang);
  const tr = T[lang];

  // Select ONLY tenant-safe fields — never address, owner-* or rent/price.
  const [p] = await db
    .select({
      published: properties.published,
      postalCode: properties.postalCode,
      city: properties.city,
      squareMeters: properties.squareMeters,
      bedrooms: properties.bedrooms,
      beds: properties.beds,
      bathrooms: properties.bathrooms,
      washingMachines: properties.washingMachines,
      dryers: properties.dryers,
      parkingSpaces: properties.parkingSpaces,
      furnished: properties.furnished,
      kitchen: properties.kitchen,
      garage: properties.garage,
      broadband: properties.broadband,
      egetBoende: properties.egetBoende,
      skick: properties.skick,
      skickEn: properties.skickEn,
      skickPl: properties.skickPl,
      publicDescription: properties.publicDescription,
      publicDescriptionEn: properties.publicDescriptionEn,
      publicDescriptionPl: properties.publicDescriptionPl,
      inclusions: properties.inclusions,
      inclusionsEn: properties.inclusionsEn,
      inclusionsPl: properties.inclusionsPl,
      distances: properties.distances,
      moveInFrom: properties.moveInFrom,
      availableTo: properties.availableTo,
    })
    .from(properties)
    .where(eq(properties.id, id));
  if (!p || !p.published) notFound();

  const description =
    (lang === "en" ? p.publicDescriptionEn : lang === "pl" ? p.publicDescriptionPl : null) || p.publicDescription;
  const skick = (lang === "en" ? p.skickEn : lang === "pl" ? p.skickPl : null) || p.skick;
  const localInclusions = lang === "en" ? p.inclusionsEn : lang === "pl" ? p.inclusionsPl : null;
  const inclusions = (localInclusions && localInclusions.length ? localInclusions : p.inclusions) ?? [];
  const distances = (p.distances ?? []).filter((d) => d.label?.trim());

  // Karta på områdesnivå — aldrig exakt adress. Centrerad på postnummer/ort.
  const mapArea = [p.postalCode, p.city].filter(Boolean).join(" ");
  const mapSrc =
    MAPS_KEY && mapArea
      ? `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(`${mapArea}, Sverige`)}&zoom=12&size=640x300&scale=2&language=sv&region=SE&markers=${encodeURIComponent(`color:0xff6300|${mapArea}, Sverige`)}&key=${MAPS_KEY}`
      : null;

  const imgRows = await db
    .select()
    .from(propertyImages)
    .where(eq(propertyImages.propertyId, id))
    .orderBy(desc(propertyImages.isPrimary), asc(propertyImages.sortOrder), asc(propertyImages.createdAt));

  const images = await Promise.all(
    imgRows.map((im) =>
      getSignedUrl(r2, new GetObjectCommand({ Bucket: R2_BUCKET, Key: im.key }), { expiresIn: 60 * 60 * 24 * 7 })
    )
  );

  const highlights = [
    p.furnished && { label: tr.hl.furnished, Icon: Sofa },
    p.kitchen && { label: tr.hl.kitchen, Icon: CookingPot },
    p.garage && { label: tr.hl.garage, Icon: Car },
    p.broadband && { label: tr.hl.broadband, Icon: Wifi },
    p.egetBoende && { label: tr.hl.eget, Icon: DoorClosed },
  ].filter(Boolean) as { label: string; Icon: typeof Sofa }[];

  const facts: { label: string; value: string }[] = [
    p.squareMeters != null && { label: tr.f.area, value: `${p.squareMeters} m²` },
    p.bedrooms != null && { label: tr.f.bedrooms, value: String(p.bedrooms) },
    p.beds != null && { label: tr.f.beds, value: String(p.beds) },
    p.bathrooms != null && { label: tr.f.bathrooms, value: String(p.bathrooms) },
    p.washingMachines != null && { label: tr.f.washer, value: String(p.washingMachines) },
    p.dryers != null && { label: tr.f.dryer, value: String(p.dryers) },
    p.parkingSpaces != null && { label: tr.f.parking, value: `${p.parkingSpaces} ${tr.parkingUnit}` },
    p.moveInFrom && { label: tr.f.from, value: p.moveInFrom },
    p.availableTo && { label: tr.f.to, value: p.availableTo },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="min-h-screen pb-16">
      {/* Brand bar */}
      <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/stayonsite-logo.png" alt="StayOnSite" className="h-7 w-auto" />
          <span className="border-l pl-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {tr.tagline}
          </span>
          <div className="ml-auto flex items-center gap-1">
            {LANGS.map((l) => (
              <a
                key={l.code}
                href={`?lang=${l.code}`}
                className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                  l.code === lang ? "bg-nordic-900 text-white" : "text-muted-foreground hover:bg-nordic-100"
                }`}
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-8 px-5 py-8">
        {/* Title */}
        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-nordic-100 px-3 py-1 text-xs font-medium text-nordic-700">
            <MapPin className="h-3.5 w-3.5 text-[#ff6300]" />
            {[p.postalCode, p.city].filter(Boolean).join(" ") || "Sverige"}
          </div>
          <h1 className="text-[2.1rem] leading-[1.1] tracking-tight text-nordic-900" style={editorial}>
            {tr.title(p.city)}
          </h1>
        </div>

        {/* Highlights */}
        {highlights.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {highlights.map(({ label, Icon }) => (
              <div key={label} className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff1e8] text-[#ff6300]">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                </span>
                <span className="text-sm font-medium text-nordic-900">{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Gallery */}
        <ProspektGallery images={images} imagesLabel={tr.photos(images.length)} fullBleed />

        {/* Description */}
        {description && (
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-nordic-800">{description}</p>
        )}

        {/* Facts */}
        {facts.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{tr.details}</h2>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {facts.map((f) => (
                <div key={f.label} className="rounded-xl border bg-white px-4 py-3">
                  <dt className="text-xs text-muted-foreground">{f.label}</dt>
                  <dd className="mt-0.5 text-lg font-semibold tabular-nums text-nordic-900">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {/* Vad ingår */}
        {inclusions.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{tr.included}</h2>
            <ul className="divide-y rounded-xl border bg-white">
              {inclusions.map((item, i) => (
                <li key={i} className="flex items-center gap-3 px-4 py-3 text-[15px] text-nordic-800">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#fff1e8] text-[#ff6300]">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Skick */}
        {skick && (
          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{tr.condition}</h2>
            <p className="whitespace-pre-wrap text-[15px] text-nordic-800">{skick}</p>
          </div>
        )}

        {/* Avstånd */}
        {distances.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{tr.distancesTitle}</h2>
            <ul className="divide-y rounded-xl border bg-white">
              {distances.map((d, i) => (
                <li key={i} className="flex items-center justify-between gap-3 px-4 py-2.5 text-[15px] text-nordic-900">
                  <span>{d.label}</span>
                  <span className="flex items-center gap-2 tabular-nums">
                    {d.km > 0 && <span className="text-sm text-muted-foreground">{d.km} km</span>}
                    {d.minutes > 0 && <span className="font-semibold text-[#ff6300]">{d.minutes} min</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Karta — områdesnivå (aldrig exakt adress) */}
        {mapSrc && (
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{tr.mapTitle}</h2>
            <div className="overflow-hidden rounded-xl border bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mapSrc} alt={`Karta ${mapArea}`} width={640} height={300} className="h-auto w-full" />
              <div className="flex items-center gap-2 px-4 py-3 text-sm text-nordic-800">
                <MapPin className="h-4 w-4 shrink-0 text-[#ff6300]" />
                {mapArea}
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="rounded-2xl border bg-white p-6 text-center">
          <p className="text-base font-semibold text-nordic-900">{tr.ctaTitle}</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{tr.ctaSub}</p>
          <a
            href={tr.ctaHref}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#ff6300] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#e65800]"
          >
            {tr.ctaButton}
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <p className="text-center text-xs text-muted-foreground">{tr.footer}</p>
      </div>
    </div>
  );
}
