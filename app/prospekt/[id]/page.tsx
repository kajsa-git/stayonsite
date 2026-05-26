import { db } from "@/lib/crm/db";
import { properties, propertyImages } from "@/lib/crm/schema";
import { R2_BUCKET, r2 } from "@/lib/crm/r2";
import { ProspektGallery } from "@/components/prospekt/ProspektGallery";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ArrowRight, Car, CookingPot, DoorClosed, MapPin, Sofa, Wifi } from "lucide-react";

export const dynamic = "force-dynamic";

const wordmark = { fontFamily: "var(--font-playfair), Georgia, serif" } as const;

// PUBLIC, no-auth prospekt for a published property.
// Tenant-safe only: NEVER address, owner, "vi hyr för"/"vi hyr ut för" or price.
export default async function ProspektPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Select ONLY tenant-safe fields — never address, owner-* or rent/price.
  // (If forbidden fields aren't fetched, they can't leak via the RSC payload.)
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
      publicDescription: properties.publicDescription,
      moveInFrom: properties.moveInFrom,
      availableTo: properties.availableTo,
    })
    .from(properties)
    .where(eq(properties.id, id));
  if (!p || !p.published) notFound();

  const imgRows = await db
    .select()
    .from(propertyImages)
    .where(eq(propertyImages.propertyId, id))
    .orderBy(asc(propertyImages.sortOrder), asc(propertyImages.createdAt));

  const images = await Promise.all(
    imgRows.map((im) =>
      getSignedUrl(r2, new GetObjectCommand({ Bucket: R2_BUCKET, Key: im.key }), { expiresIn: 60 * 60 * 24 * 7 })
    )
  );

  const highlights = [
    p.furnished && { label: "Möblerat", Icon: Sofa },
    p.kitchen && { label: "Eget kök", Icon: CookingPot },
    p.garage && { label: "Garage", Icon: Car },
    p.broadband && { label: "Bredband ingår", Icon: Wifi },
    p.egetBoende && { label: "Eget boende", Icon: DoorClosed },
  ].filter(Boolean) as { label: string; Icon: typeof Sofa }[];

  const facts: { label: string; value: string }[] = [
    p.squareMeters != null && { label: "Yta", value: `${p.squareMeters} m²` },
    p.bedrooms != null && { label: "Sovrum", value: String(p.bedrooms) },
    p.beds != null && { label: "Bäddar", value: String(p.beds) },
    p.bathrooms != null && { label: "Badrum", value: String(p.bathrooms) },
    p.washingMachines != null && { label: "Tvättmaskin", value: String(p.washingMachines) },
    p.dryers != null && { label: "Tumlare", value: String(p.dryers) },
    p.parkingSpaces != null && { label: "Parkering", value: `${p.parkingSpaces} pl.` },
    p.moveInFrom && { label: "Tillgänglig från", value: p.moveInFrom },
    p.availableTo && { label: "Tillgänglig till", value: p.availableTo },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="min-h-screen pb-16">
      {/* Brand bar */}
      <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/stayonsite-logo.png" alt="StayOnSite" className="h-7 w-auto" />
          <span className="border-l pl-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Bostadsförslag
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-8 px-5 py-8">
        {/* Title */}
        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-nordic-100 px-3 py-1 text-xs font-medium text-nordic-700">
            <MapPin className="h-3.5 w-3.5 text-[#ff6300]" />
            {[p.postalCode, p.city].filter(Boolean).join(" ") || "Sverige"}
          </div>
          <h1 className="text-3xl font-bold text-nordic-900" style={wordmark}>
            {p.city ? `Boende i ${p.city}` : "Bostadsförslag"}
          </h1>
        </div>

        {/* Highlights */}
        {highlights.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {highlights.map(({ label, Icon }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 rounded-xl border bg-white px-3.5 py-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fff1e8] text-[#ff6300]">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium text-nordic-900">{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Gallery */}
        <ProspektGallery images={images} />

        {/* Description */}
        {p.publicDescription && (
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-nordic-800">{p.publicDescription}</p>
        )}

        {/* Facts */}
        {facts.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Detaljer</h2>
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

        {/* Skick */}
        {p.skick && (
          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Skick</h2>
            <p className="whitespace-pre-wrap text-[15px] text-nordic-800">{p.skick}</p>
          </div>
        )}

        {/* CTA */}
        <div className="rounded-2xl border bg-white p-6 text-center">
          <p className="text-base font-semibold text-nordic-900">Intresserad av den här bostaden?</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Hör av dig till StayOnSite så hjälper vi dig vidare — ofta med svar inom 24 timmar.
          </p>
          <a
            href="https://www.stayonsite.se/kontakt"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#ff6300] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#e65800]"
          >
            Kontakta oss
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          StayOnSite · Corporate housing i hela Sverige
        </p>
      </div>
    </div>
  );
}
