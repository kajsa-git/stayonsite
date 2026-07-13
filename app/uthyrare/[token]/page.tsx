import { AgreementGate } from "@/components/erbjudande/AgreementGate";
import { agreementValidUntil, UTHYRNINGSUPPDRAG } from "@/lib/crm/avtal";
import { loadLandlordDeal, loadLandlordStanding } from "@/lib/crm/deal-projection";
import { resolveShareLink } from "@/lib/crm/share-links";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const editorial = { fontFamily: "var(--font-playfair), Georgia, serif" } as const;

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  vantar: { text: "Väntar på hyresgästens besked", cls: "bg-blue-100 text-blue-800" },
  accepterad: { text: "Hyresgästen har accepterat", cls: "bg-green-100 text-green-800" },
  avslutad: { text: "Avslutad", cls: "bg-nordic-100 text-nordic-600" },
};

// PUBLIK uthyrarsida via kapabilitets-token (crm_share_links, audience landlord,
// scope = en affär). Gate: uthyrningsuppdraget signeras innan överenskommelsen
// visas. Uthyrarens projektion (deal-projection.ts): eget objekt + löftesvillkor —
// ALDRIG utpris, marginal eller kundföretagets identitet.
export default async function UthyrarePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const link = await resolveShareLink(token);
  if (!link || link.audience !== "landlord" || (!link.matchId && !link.ownerId)) notFound();

  // Fristående länk (uppdragsavtalet skickas före någon affär): gate → bekräftelsevy.
  if (!link.matchId && link.ownerId) {
    const standing = await loadLandlordStanding(link.ownerId);
    if (!standing) notFound();
    return (
      <div className="min-h-screen pb-16">
        <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-5">
            <img src="/stayonsite-logo.png" alt="StayOnSite" className="h-7 w-auto" />
            <span className="border-l pl-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Uthyrningsuppdrag
            </span>
          </div>
        </header>
        <div className="mx-auto max-w-3xl space-y-8 px-5 py-8">
          {!standing.agreementAccepted ? (
            <AgreementGate
              token={token}
              title={UTHYRNINGSUPPDRAG.title}
              intro={UTHYRNINGSUPPDRAG.intro}
              points={UTHYRNINGSUPPDRAG.points}
              version={UTHYRNINGSUPPDRAG.version}
              submitLabel="Godkänn uthyrningsuppdraget"
              lang="sv"
            />
          ) : (
            <div className="rounded-2xl border bg-white p-6 sm:p-8 space-y-4">
              <h1 className="text-[1.8rem] leading-tight tracking-tight text-nordic-900" style={editorial}>
                Uppdraget är signerat
              </h1>
              <p className="text-sm text-nordic-700">
                Tack! Uthyrningsuppdraget signerades av {standing.acceptedName} den{" "}
                {standing.acceptedAt?.slice(0, 10)} och gäller till{" "}
                {standing.acceptedAt ? agreementValidUntil(standing.acceptedAt) : "—"}. Det omfattar alla era objekt
                hos StayOnSite — när vi har en konkret uthyrning får ni villkoren bekräftade separat.
              </p>
              <p className="text-xs text-muted-foreground">Frågor? Hör av dig till Kajsa på StayOnSite.</p>
            </div>
          )}
          <p className="text-center text-xs text-muted-foreground">StayOnSite · Corporate housing i hela Sverige</p>
        </div>
      </div>
    );
  }

  const deal = await loadLandlordDeal(link.matchId!);
  if (!deal) notFound();

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
            Uthyrningsuppdrag
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
              submitLabel="Godkänn uthyrningsuppdraget"
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
                Uthyrningsuppdraget signerades av {deal.acceptedName} den {deal.acceptedAt?.slice(0, 10)}. Frågor?
                Hör av dig till Kajsa på StayOnSite.
              </p>
            </div>

            <p className="text-center text-xs text-muted-foreground">StayOnSite · Corporate housing i hela Sverige</p>
          </>
        )}
      </div>
    </div>
  );
}
