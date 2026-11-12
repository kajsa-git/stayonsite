import { LandlordPropertyForm } from "@/components/erbjudande/LandlordPropertyForm";
import { loadLandlordProperties } from "@/lib/crm/landlord-properties";
import { AgreementGate } from "@/components/erbjudande/AgreementGate";
import { PublishConsentCard } from "@/components/erbjudande/PublishConsentCard";
import { PublicationWithdrawal } from "@/components/erbjudande/PublicationWithdrawal";
import { UTHYRNINGSUPPDRAG } from "@/lib/crm/avtal";
import { loadLandlordDeal, loadLandlordStanding } from "@/lib/crm/deal-projection";
import { loadPublishConsentState } from "@/lib/crm/publish-consent";
import { resolveShareLink } from "@/lib/crm/share-links";
import { HUS_UPLOAD_LINK_ACTOR } from "@/lib/crm/hus-publication";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const editorial = { fontFamily: "var(--font-playfair), Georgia, serif" } as const;

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  vantar: { text: "Väntar på hyresgästens besked", cls: "bg-blue-100 text-blue-800" },
  accepterad: { text: "Hyresgästen har accepterat", cls: "bg-green-100 text-green-800" },
  avslutad: { text: "Avslutad", cls: "bg-nordic-100 text-nordic-600" },
};

// PUBLIK uthyrarsida via kapabilitets-token (crm_share_links, audience landlord,
// scope = en affär). Gate: förmedlingsvillkoren godkänns innan överenskommelsen
// visas. Uthyrarens projektion (deal-projection.ts): eget objekt + löftesvillkor —
// ALDRIG utpris, marginal eller kundföretagets identitet.
export default async function UthyrarePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const link = await resolveShareLink(token);
  if (!link || link.audience !== "landlord" || (!link.matchId && !link.ownerId) || link.createdBy === HUS_UPLOAD_LINK_ACTOR) notFound();

  // Fristående uthyrarlänk: endast publicering för utvalda bostäder. Ett ja
  // här är inte ett godkännande av förmedlingsvillkoren för en senare affär.
  if (!link.matchId && link.ownerId) {
    const standing = await loadLandlordStanding(link.ownerId);
    if (!standing) notFound();
    const consent = await loadPublishConsentState(link.ownerId);
    const editableProperties = standing.portalAllowed ? await loadLandlordProperties(link) : [];
    return (
      <div className="min-h-screen pb-16">
        <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-5">
            <img src="/stayonsite-logo.png" alt="StayOnSite" className="h-7 w-auto" />
            <span className="border-l pl-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Din sida hos StayOnSite
            </span>
          </div>
        </header>
        <div className="mx-auto max-w-3xl space-y-6 px-5 py-8">
          <PublishConsentCard key={consent.pending.map((p) => p.id).join(":")} token={token} properties={consent.pending} />
          {consent.consented.length > 0 && <PublicationWithdrawal token={token} properties={consent.consented} />}
          {standing.portalAllowed && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl text-nordic-900" style={editorial}>Min bostad</h2>
                <p className="mt-2 text-sm text-nordic-700">Komplettera uppgifter och bilder här. Spara länken för att återkomma till din sida — ingen inloggning behövs.</p>
              </div>
              {editableProperties.length === 0 && <p className="rounded-xl border bg-white p-5 text-sm">Ingen bostad är kopplad till din sida ännu. Kontakta Kajsa på StayOnSite så hjälper vi dig.</p>}
              {editableProperties.map((property) => <LandlordPropertyForm key={property.id} token={token} property={property} />)}
            </div>
          )}
          <p className="text-center text-xs text-muted-foreground">StayOnSite · Corporate housing i hela Sverige</p>
        </div>
      </div>
    );
  }

  const deal = await loadLandlordDeal(link.matchId!);
  if (!deal) notFound();

  const editableProperties = deal.agreementAccepted ? await loadLandlordProperties(link) : [];
  const status = STATUS_LABEL[deal.status];
  const period = deal.promisedStartDate || deal.promisedEndDate
    ? `${deal.promisedStartDate ?? "?"} → ${deal.promisedEndDate ?? "tills vidare"}`
    : null;

  return (
    <div className="min-h-screen pb-16">
      <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-5">
          <img src="/stayonsite-logo.png" alt="StayOnSite" className="h-7 w-auto" />
          <span className="border-l pl-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Förmedlingsvillkor
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-8 px-5 py-8">
        {!deal.agreementAccepted ? (
          <>
            <div className="rounded-2xl border bg-white p-5 text-sm">
              <p className="font-medium text-nordic-900">{deal.propertyAddress ?? "Ert objekt"}</p>
              {deal.propertyCity && <p className="text-muted-foreground">{deal.propertyCity}</p>}
            </div>
            <AgreementGate
              token={token}
              title={UTHYRNINGSUPPDRAG.title}
              intro={UTHYRNINGSUPPDRAG.intro}
              points={UTHYRNINGSUPPDRAG.points}
              version={UTHYRNINGSUPPDRAG.version}
              submitLabel="Godkänn förmedlingsvillkoren"
              lang="sv"
            />
          </>
        ) : (
          <>
            <div>
              <h1 className="text-[2.1rem] leading-[1.1] tracking-tight text-nordic-900" style={editorial}>
                {deal.propertyAddress ?? "Ert objekt"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {[deal.propertyCity, deal.persons ? `${deal.persons} personer` : null].filter(Boolean).join(" · ")}
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-6 sm:p-8 space-y-5">
              <div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.cls}`}>{status.text}</span>
              </div>

              <h2 className="text-base font-semibold text-nordic-900">Det här har vi kommit överens om</h2>
              {deal.promisedAt ? (
                <div className="rounded-xl bg-nordic-50 p-5 space-y-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Er hyra</p>
                      <p className="text-2xl font-semibold text-nordic-900">
                        {deal.promisedRentIn != null ? `${deal.promisedRentIn.toLocaleString("sv-SE")} kr/mån` : "—"}
                      </p>
                    </div>
                    {period && (
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Period</p>
                        <p className="text-sm font-medium text-nordic-900">{period}</p>
                      </div>
                    )}
                  </div>
                  {deal.promisedConditions && (
                    <p className="text-sm text-nordic-700">
                      <span className="font-medium">Villkor:</span> {deal.promisedConditions}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Villkoren bekräftades {deal.promisedAt.slice(0, 10)} och ändras inte i efterhand.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Villkoren för den här uthyrningen bekräftas separat med StayOnSite — de visas här så fort de är
                  överenskomna.
                </p>
              )}

              <p className="text-xs text-muted-foreground">
                Godkänt av {deal.acceptedName} den {deal.acceptedAt?.slice(0, 10)}. Frågor?
                Hör av dig till Kajsa på StayOnSite.
              </p>
            </div>

            {editableProperties.map((property) => <LandlordPropertyForm key={property.id} token={token} property={property} />)}

            <p className="text-center text-xs text-muted-foreground">StayOnSite · Corporate housing i hela Sverige</p>
          </>
        )}
      </div>
    </div>
  );
}
