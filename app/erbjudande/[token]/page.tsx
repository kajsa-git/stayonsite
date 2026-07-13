import { AgreementGate } from "@/components/erbjudande/AgreementGate";
import { OFFER_T } from "@/components/erbjudande/erbjudande-i18n";
import { LANGS, T, pickLang } from "@/components/prospekt/prospekt-i18n";
import { PropertyShowcase } from "@/components/prospekt/PropertyShowcase";
import { agreementFor } from "@/lib/crm/avtal";
import { loadTenantOffer, type TenantOfferItem } from "@/lib/crm/deal-projection";
import { resolveShareLink } from "@/lib/crm/share-links";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

// Länkförhandsvisningen speglar det kunden landar på: uppdragsbekräftelsen före
// signering, boendeförslaget efter. (Meddelandeappar cachar förhandsvisningen vid
// utskicket — då är gaten aktiv, så titeln stämmer.) trackView: false så att
// metadata-uppslag inte dubbelräknar sidvisningen.
export async function generateMetadata(
  { params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ lang?: string | string[] }> },
): Promise<Metadata> {
  const { token } = await params;
  const lang = pickLang((await searchParams).lang);
  const link = await resolveShareLink(token, { trackView: false });
  if (!link || link.audience !== "tenant") return { title: `${OFFER_T[lang].tagline} — StayOnSite` };
  const offer = await loadTenantOffer(link.requestId);
  if (offer && !offer.agreementAccepted) {
    const { text } = agreementFor("uppdragsbekraftelse", lang);
    return { title: `${text.title} — StayOnSite` };
  }
  return { title: `${OFFER_T[lang].tagline} — StayOnSite` };
}

// PUBLIK kundsida via kapabilitets-token (crm_share_links). Kunden ser sin
// projektion av affären (deal-projection.ts): stämplade erbjudandevillkor +
// tenant-säkra objekt. Gaten: uppdragsbekräftelsen måste vara godkänd för
// aktuell version innan erbjudandet visas.
export default async function ErbjudandePage(
  { params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ lang?: string | string[] }> },
) {
  const { token } = await params;
  const lang = pickLang((await searchParams).lang);
  const tr = OFFER_T[lang];

  const link = await resolveShareLink(token);
  if (!link || link.audience !== "tenant") notFound();

  const offer = await loadTenantOffer(link.requestId);
  if (!offer) notFound();

  const gated = !offer.agreementAccepted;

  return (
    <div className="min-h-screen pb-16">
      {/* Brand bar — samma som prospektet */}
      <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-5">
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
        {gated ? (
          (() => {
            // Avtal finns bara på svenska och engelska — pl-besökare får engelskan.
            const { text, language } = agreementFor("uppdragsbekraftelse", lang);
            return (
              <AgreementGate
                token={token}
                title={text.title}
                intro={text.intro}
                points={text.points}
                version={text.version}
                submitLabel={language === "sv" ? "Godkänn uppdragsbekräftelsen" : "Approve the assignment confirmation"}
                lang={language}
              />
            );
          })()
        ) : (
          <>
            {/* Intro */}
            <div>
              <h1
                className="text-[2.1rem] leading-[1.1] tracking-tight text-nordic-900"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                {tr.heading(offer.companyName)}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {[
                  offer.offers.length > 0 ? tr.intro(offer.offers.length) : null,
                  offer.persons ? tr.persons(offer.persons) : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>

            {offer.offers.map((item) => (
              <OfferBlock key={item.matchId} item={item} lang={lang} />
            ))}

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

            {offer.acceptedName && offer.acceptedAt && (
              <p className="text-center text-xs text-muted-foreground">
                {tr.agreementBadge(offer.acceptedName, offer.acceptedAt.slice(0, 10))}
              </p>
            )}
            <p className="text-center text-xs text-muted-foreground">{tr.footer}</p>
          </>
        )}
      </div>
    </div>
  );
}

const STATUS_CLS: Record<TenantOfferItem["status"], string> = {
  sent: "bg-blue-100 text-blue-800",
  accepted: "bg-green-100 text-green-800",
  unavailable: "bg-nordic-100 text-nordic-600",
};

function OfferBlock({ item, lang }: { item: TenantOfferItem; lang: "sv" | "en" | "pl" }) {
  const tr = OFFER_T[lang];
  const period = item.offerOngoing
    ? `${item.offerStartDate ?? "?"} → ${tr.ongoing}`
    : item.offerStartDate || item.offerEndDate
      ? `${item.offerStartDate ?? "?"} → ${item.offerEndDate ?? "?"}`
      : null;

  // Otillgängliga objekt gråas ut men försvinner aldrig — länken är ett
  // sanningsenligt protokoll över vad som erbjudits. Kompakt kort utan galleri.
  if (item.status === "unavailable" || !item.property) {
    return (
      <div className="rounded-2xl border bg-white p-6 opacity-70">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLS.unavailable}`}>
            {tr.status.unavailable}
          </span>
          <span className="text-sm font-medium text-nordic-900">
            {item.property?.row.publicName ?? T[lang].title(item.property?.row.city ?? null)}
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{tr.unavailableInfo}</p>
        {item.offerRentOut != null && (
          <p className="mt-1 text-sm text-muted-foreground line-through">
            {tr.yourPrice}: {item.offerRentOut.toLocaleString("sv-SE")} {tr.perMonth}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-2xl border bg-white p-6 sm:p-8">
      <div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLS[item.status]}`}>
          {tr.status[item.status]}
        </span>
      </div>

      <PropertyShowcase
        data={item.property}
        lang={lang}
        title={item.property.row.publicName ?? T[lang].title(item.property.row.city)}
      />

      {/* Stämplade villkor — kundens pris kommer från affären, aldrig från objektet */}
      <div className="rounded-xl bg-nordic-50 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{tr.yourPrice}</p>
            <p className="text-2xl font-semibold text-nordic-900">
              {item.offerRentOut != null ? `${item.offerRentOut.toLocaleString("sv-SE")} ${tr.perMonth}` : "—"}
            </p>
          </div>
          {period && (
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{tr.period}</p>
              <p className="text-sm font-medium text-nordic-900">{period}</p>
            </div>
          )}
        </div>
        {item.offerNote && (
          <p className="mt-3 text-sm text-nordic-700">
            <span className="font-medium">{tr.note}:</span> {item.offerNote}
          </p>
        )}
        <p className="mt-3 text-xs text-muted-foreground">{tr.priceLocked}</p>
      </div>
    </div>
  );
}
