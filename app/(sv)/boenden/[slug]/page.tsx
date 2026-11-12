import { approvedPropertyIds } from "@/lib/crm/approved-property-content"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound, permanentRedirect } from "next/navigation"
import { ArrowLeft, ArrowRight, Mail, MessageSquare, Phone } from "lucide-react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import SEO from "@/components/SEO"
import { buildMetadata } from "@/lib/metadata"
import { db } from "@/lib/crm/db"
import { properties, propertyImages } from "@/lib/crm/schema"
import { eq } from "drizzle-orm"
import { loadPublicProperty } from "@/lib/crm/public-property"
import { publicDisplayName } from "@/lib/crm/slug"
import { publicPropertyDescription, publicPropertyTitle, truncateSeoDescription } from "@/lib/crm/public-seo"
import { getCityForLocality } from "@/data/cities"
import { publicPropertyImageUrl } from "@/lib/crm/public-images"
import { WebsitePropertyShowcase } from "@/components/prospekt/WebsitePropertyShowcase"
import { hasCurrentPublicAvailability, hasWebsitePropertyStatus } from "@/lib/crm/publication"
import { isHusTestProperty } from "@/lib/crm/test-property"

export const dynamic = "force-dynamic"

const BASE = "https://www.stayonsite.se"

// Lätt uppslag för metadata (ingen bild-presignering/geokodning) — slug först, id som fallback.
async function lookupForMeta(idOrSlug: string) {
  const cols = {
    id: properties.id,
    updatedAt: properties.updatedAt,
    published: properties.published,
    publishConsentAt: properties.publishConsentAt,
    status: properties.status,
    slug: properties.slug,
    publicName: properties.publicName,
    city: properties.city,
    squareMeters: properties.squareMeters,
    bedrooms: properties.bedrooms,
    beds: properties.beds,
    postalCode: properties.postalCode,
    publicDescription: properties.publicDescription,
    notes: properties.notes,
  }
  const bySlug = await db.select(cols).from(properties).where(eq(properties.slug, idOrSlug)).limit(1)
  const [row] = bySlug.length
    ? bySlug
    : await db.select(cols).from(properties).where(eq(properties.id, idOrSlug)).limit(1)
  return row ?? null
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const p = await lookupForMeta(slug)
  if (!p || !p.published || !hasWebsitePropertyStatus(p.status, p.publishConsentAt) || !(await approvedPropertyIds([p.id], new Map([[p.id, p.updatedAt]]))).has(p.id)) {
    return buildMetadata({ title: "Våra boenden | StayOnSite", noindex: true, locale: "sv" })
  }
  if (isHusTestProperty(p.notes)) {
    return buildMetadata({ title: "Test av bostadsregistrering | StayOnSite", noindex: true, locale: "sv" })
  }
  const name = publicDisplayName(
    p.publicName,
    { city: p.city, bedrooms: p.bedrooms, beds: p.beds },
    p.slug,
  )
  const canonical = `${BASE}/boenden/${p.slug ?? slug}`
  const description = truncateSeoDescription(
    publicPropertyDescription(p.publicDescription, {
      name,
      slug: p.slug,
      city: p.city,
      postalCode: p.postalCode,
      squareMeters: p.squareMeters,
      bedrooms: p.bedrooms,
      beds: p.beds,
    }),
  )
  const [firstImage] = p.slug
    ? await db.select({ id: propertyImages.id }).from(propertyImages).where(eq(propertyImages.propertyId, p.id)).limit(1)
    : []
  return buildMetadata({
    title: `${publicPropertyTitle({ name, city: p.city, bedrooms: p.bedrooms, beds: p.beds })} | StayOnSite`,
    description,
    ...(firstImage && p.slug ? { ogImage: publicPropertyImageUrl(p.slug, 1) } : {}),
    canonical,
    hreflangs: [
      { lang: "sv", href: canonical },
      { lang: "x-default", href: canonical },
    ],
    locale: "sv",
  })
}

export default async function BoendeDetailPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const data = await loadPublicProperty(slug, { surface: "web" })
  if (!data) notFound()

  const { row: p, images } = data
  if (p.slug && slug !== p.slug) permanentRedirect(`/boenden/${p.slug}`)
  const testOnly = isHusTestProperty((await lookupForMeta(p.id))?.notes)

  const name = publicDisplayName(
    p.publicName,
    { city: p.city, bedrooms: p.bedrooms, beds: p.beds },
    p.slug,
  )
  const place = p.city ?? "Sverige"
  const showAvailability = hasCurrentPublicAvailability(p.status, p.availableTo)
  const canonical = `${BASE}/boenden/${p.slug ?? slug}`
  const description = publicPropertyDescription(p.publicDescription, {
    name,
    slug: p.slug,
    city: p.city,
    postalCode: p.postalCode,
    squareMeters: p.squareMeters,
    bedrooms: p.bedrooms,
    beds: p.beds,
  })

  const cityPage = getCityForLocality(p.city)

  const contactMsg = `Hej Kajsa! Jag är intresserad av "${name}" i ${place}. Kan ni berätta mer om tillgänglighet?`
  const mailHref = `mailto:kajsa@stayonsite.se?subject=${encodeURIComponent(`Intresseanmälan: ${name}`)}&body=${encodeURIComponent(contactMsg)}`
  const smsHref = `sms:+46762498486?body=${encodeURIComponent(contactMsg)}`

  // JSON-LD: Accommodation (områdesnivå — aldrig gatuadress).
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Accommodation",
    name,
    url: canonical,
    description,
    ...(images.length && p.slug
      ? { image: images.slice(0, 10).map((_, i) => publicPropertyImageUrl(p.slug as string, i + 1)) }
      : {}),
    ...(p.city
      ? {
          address: {
            "@type": "PostalAddress",
            addressLocality: p.city,
            ...(p.postalCode ? { postalCode: p.postalCode } : {}),
            addressCountry: "SE",
          },
        }
      : {}),
    ...(p.bedrooms != null ? { numberOfRooms: p.bedrooms } : {}),
    ...(p.beds != null ? { occupancy: { "@type": "QuantitativeValue", value: p.beds } } : {}),
    ...(p.squareMeters != null
      ? { floorSize: { "@type": "QuantitativeValue", value: p.squareMeters, unitCode: "MTK" } }
      : {}),
    ...(p.furnished || p.egetBoende
      ? {
          amenityFeature: [
            p.furnished && { "@type": "LocationFeatureSpecification", name: "Möblerat", value: true },
            p.egetBoende && { "@type": "LocationFeatureSpecification", name: "Eget boende", value: true },
          ].filter(Boolean),
        }
      : {}),
  }

  // Brödsmulor: Hem → Boenden → ortens stadssida → objektet. Visar sökmotorerna
  // att stadssidan är överordnad de enskilda objekten på orten.
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { name: "Hem", item: "https://www.stayonsite.se/" },
      { name: "Boenden", item: "https://www.stayonsite.se/boenden" },
      ...(cityPage ? [{ name: `Företagsboende ${cityPage.name}`, item: `https://www.stayonsite.se/stad/${cityPage.slug}` }] : []),
      { name, item: canonical },
    ].map((crumb, i) => ({ "@type": "ListItem", position: i + 1, ...crumb })),
  }

  return (
    <>
      <Header />
      {!testOnly && <SEO structuredData={[structuredData, breadcrumbs]} />}
      <main className="min-h-screen bg-gray-50 pb-16 pt-24 md:pt-28">
        <div className="mx-auto max-w-3xl space-y-8 px-5 py-2">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link
              href="/boenden"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-nordic-600 transition-colors hover:text-nordic-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Alla boenden
            </Link>
            {cityPage && (
              <Link
                href={`/stad/${cityPage.slug}`}
                className="inline-flex items-center text-sm font-medium text-nordic-600 transition-colors hover:text-nordic-900"
              >
                Företagsboende {cityPage.name}
              </Link>
            )}
          </div>

          {testOnly && <p role="status" className="rounded-xl border border-amber-300 bg-amber-50 p-4 font-semibold text-amber-950">Test av registreringsflödet – detta är inte ett boende som kan hyras.</p>}

          <WebsitePropertyShowcase
            data={{ ...data, row: {
              ...p,
              published: null,
              prospektPublished: null,
              status: null,
              moveInFrom: showAvailability ? p.moveInFrom : null,
              availableTo: showAvailability ? p.availableTo : null,
            } }}
            title={name}
            description={description}
          />

          {/* Intresse-CTA */}
          {!testOnly && <div className="rounded-2xl border bg-white p-6 sm:p-8">
            <h2 className="text-lg font-bold text-nordic-900">Intresserad av {place}?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Hör av dig så bekräftar vi tillgänglighet och skickar detaljer — ofta med svar inom 24 timmar.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <a
                href="tel:+46762498486"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#ff6300] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#e55a00]"
              >
                <Phone className="h-4 w-4" /> Ring oss
              </a>
              <a
                href={mailHref}
                className="flex items-center justify-center gap-2 rounded-xl border border-nordic-200 px-4 py-3 text-sm font-semibold text-nordic-900 transition-colors hover:bg-nordic-50"
              >
                <Mail className="h-4 w-4" /> Mejla
              </a>
              <a
                href={smsHref}
                className="flex items-center justify-center gap-2 rounded-xl border border-nordic-200 px-4 py-3 text-sm font-semibold text-nordic-900 transition-colors hover:bg-nordic-50"
              >
                <MessageSquare className="h-4 w-4" /> Skicka SMS
              </a>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Telefon 076-249 84 86 · kajsa@stayonsite.se
            </p>
          </div>}

          {/* Sekundär CTA till listan + stadssidan (intern länkkraft till "företagsboende <stad>") */}
          <div className="flex flex-col items-center gap-3 text-center">
            <Link
              href="/boenden"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-nordic-600 transition-colors hover:text-nordic-900"
            >
              Se fler boenden
              <ArrowRight className="h-4 w-4" />
            </Link>
            {cityPage && (
              <Link
                href={`/stad/${cityPage.slug}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-nordic-600 transition-colors hover:text-nordic-900"
              >
                Företagsboende {cityPage.name} – priser, områden och FAQ
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
