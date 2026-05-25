import { db } from "@/lib/crm/db";
import { properties, propertyImages } from "@/lib/crm/schema";
import { R2_BUCKET, r2 } from "@/lib/crm/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

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

  const features: string[] = [
    p.furnished && "Möblerat",
    p.kitchen && "Kök",
    p.garage && "Garage",
    p.broadband && "Bredband ingår",
    p.egetBoende && "Eget boende",
  ].filter(Boolean) as string[];

  const facts: { label: string; value: string }[] = [
    p.squareMeters != null && { label: "Yta", value: `${p.squareMeters} m²` },
    p.bedrooms != null && { label: "Sovrum", value: String(p.bedrooms) },
    p.beds != null && { label: "Bäddar", value: String(p.beds) },
    p.bathrooms != null && { label: "Badrum", value: String(p.bathrooms) },
    p.washingMachines != null && { label: "Tvättmaskin", value: String(p.washingMachines) },
    p.dryers != null && { label: "Tumlare", value: String(p.dryers) },
    p.parkingSpaces != null && { label: "Parkering", value: String(p.parkingSpaces) },
    p.moveInFrom && { label: "Tillgänglig från", value: p.moveInFrom },
    p.availableTo && { label: "Tillgänglig till", value: p.availableTo },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="min-h-screen">
      {/* Brand bar */}
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-5 h-14 flex items-center">
          <span className="font-semibold text-nordic-900">Stay On Site</span>
          <span className="ml-2 text-sm text-muted-foreground">Bostadsförslag</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-nordic-900">
            {[p.postalCode, p.city].filter(Boolean).join(" ") || "Bostad"}
          </h1>
          {features.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {features.map((f) => (
                <span key={f} className="text-sm px-3 py-1 rounded-full bg-nordic-100 text-nordic-800">
                  {f}
                </span>
              ))}
            </div>
          )}
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {images.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={url}
                alt={`Bild ${i + 1}`}
                className={`w-full rounded-xl border object-cover ${i === 0 ? "col-span-2 aspect-video" : "aspect-square"}`}
              />
            ))}
          </div>
        )}

        {p.publicDescription && (
          <div>
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-nordic-800">{p.publicDescription}</p>
          </div>
        )}

        {facts.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Detaljer</h2>
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-6">
              {facts.map((f) => (
                <div key={f.label}>
                  <dt className="text-xs text-muted-foreground">{f.label}</dt>
                  <dd className="font-medium text-nordic-900">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {p.skick && (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">Skick</h2>
            <p className="whitespace-pre-wrap text-[15px] text-nordic-800">{p.skick}</p>
          </div>
        )}

        <div className="border-t pt-6 text-sm text-muted-foreground">
          Intresserad? Kontakta Stay On Site så hjälper vi dig vidare.
        </div>
      </div>
    </div>
  );
}
