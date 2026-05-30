import { db } from "@/lib/crm/db";
import { properties } from "@/lib/crm/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { loadPublicProperty } from "@/lib/crm/public-property";
import { PropertyShowcase } from "@/components/prospekt/PropertyShowcase";
import { LANGS, T, pickLang } from "@/components/prospekt/prospekt-i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  { params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ lang?: string | string[] }> },
): Promise<Metadata> {
  const { id } = await params;
  const lang = pickLang((await searchParams).lang);
  const tr = T[lang];
  const [p] = await db
    .select({
      prospektPublished: properties.prospektPublished,
      city: properties.city,
      postalCode: properties.postalCode,
      publicDescription: properties.publicDescription,
      publicDescriptionEn: properties.publicDescriptionEn,
      publicDescriptionPl: properties.publicDescriptionPl,
    })
    .from(properties)
    .where(eq(properties.id, id));
  if (!p || !p.prospektPublished) return { title: `${tr.tagline} – StayOnSite` };
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

// PUBLIC, no-auth prospekt for a published property — säljlänk som CRM:et delar direkt.
// Tenant-safe only: NEVER address, owner, "vi hyr för"/"vi hyr ut för" or price (säkras i loadPublicProperty).
export default async function ProspektPage(
  { params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ lang?: string | string[] }> },
) {
  const { id } = await params;
  const lang = pickLang((await searchParams).lang);
  const tr = T[lang];

  const data = await loadPublicProperty(id, { surface: "prospekt" });
  if (!data) notFound();

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
        <PropertyShowcase data={data} lang={lang} title={tr.title(data.row.city)} />

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
