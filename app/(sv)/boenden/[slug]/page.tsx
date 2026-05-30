import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight, Mail, MessageSquare, Phone } from "lucide-react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import SEO from "@/components/SEO"
import { buildMetadata } from "@/lib/metadata"
import { db } from "@/lib/crm/db"
import { properties } from "@/lib/crm/schema"
import { eq } from "drizzle-orm"
import { loadPublicProperty } from "@/lib/crm/public-property"
import { publicDisplayName } from "@/lib/crm/slug"
import { PropertyShowcase } from "@/components/prospekt/PropertyShowcase"

export const dynamic = "force-dynamic"

const BASE = "https://www.stayonsite.se"

// Lätt uppslag för metadata (ingen bild-presignering/geokodning) — slug först, id som fallback.
async function lookupForMeta(idOrSlug: string) {
  const cols = {
    published: properties.published,
    status: properties.status,
    slug: properties.slug,
    publicName: properties.publicName,
    city: properties.city,
    bedrooms: properties.bedrooms,
    beds: properties.beds,
    postalCode: properties.postalCode,
    publicDescription: properties.publicDescription,
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
  if (!p || !p.published || p.status !== "available") {
    return buildMetadata({ title: "Lediga boenden | StayOnSite", noindex: true, locale: "sv" })
  }
  const name = publicDisplayName(p.publicName, { city: p.city, bedrooms: p.bedrooms, beds: p.beds })
  const canonical = `${BASE}/boenden/${p.slug ?? slug}`
  const place = [p.postalCode, p.city].filter(Boolean).join(" ") || "Sverige"
  const description =
    p.publicDescription?.trim().slice(0, 160) ||
    `${name} — möblerat företagsboende i ${place} via StayOnSite. Hör av dig för tillgänglighet och visning.`
  return buildMetadata({
    title: `${name} | StayOnSite`,
    description,
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
  const name = publicDisplayName(p.publicName, { city: p.city, bedrooms: p.bedrooms, beds: p.beds })
  const place = p.city ?? "Sverige"
  const canonical = `${BASE}/boenden/${p.slug ?? slug}`

  const contactMsg = `Hej Kajsa! Jag är intresserad av "${name}" i ${place}. Kan ni berätta mer om tillgänglighet?`
  const mailHref = `mailto:kajsa@stayonsite.se?subject=${encodeURIComponent(`Intresseanmälan: ${name}`)}&body=${encodeURIComponent(contactMsg)}`
  const smsHref = `sms:+46762498486?body=${encodeURIComponent(contactMsg)}`

  // JSON-LD: Accommodation (områdesnivå — aldrig gatuadress).
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Accommodation",
    name,
    url: canonical,
    ...(p.publicDescription ? { description: p.publicDescription } : {}),
    ...(images[0] ? { image: images[0] } : {}),
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

  return (
    <>
      <Header />
      <SEO structuredData={structuredData} />
      <main className="min-h-screen bg-gray-50 pb-16 pt-24 md:pt-28">
        <div className="mx-auto max-w-3xl space-y-8 px-5 py-2">
          <Link
            href="/boenden"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-nordic-600 transition-colors hover:text-nordic-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Alla lediga boenden
          </Link>

          <PropertyShowcase data={data} lang="sv" title={name} />

          {/* Intresse-CTA */}
          <div className="rounded-2xl border bg-white p-6 sm:p-8">
            <h2 className="text-lg font-bold text-nordic-900">Intresserad av {place}?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Hör av dig så berättar vi mer och skickar detaljer — ofta med svar inom 24 timmar.
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
          </div>

          {/* Sekundär CTA till listan */}
          <div className="text-center">
            <Link
              href="/boenden"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-nordic-600 transition-colors hover:text-nordic-900"
            >
              Se fler lediga boenden
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
