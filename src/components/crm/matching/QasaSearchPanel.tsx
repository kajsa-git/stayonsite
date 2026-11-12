"use client";

// Qasa-sök i matchningsvyn: uppdragets kriterier förifyller sökningen, träffarna
// poängsätts med samma matchDetails() som våra egna objekt och kan importeras +
// läggas som förslag i ett klick. Inget skickas till kunden härifrån — förslaget
// hamnar i listan till vänster och objektet öppnas för granskning.
//
// En Qasa-annons är ett uppslag, inte en bostad vi har avtal om. Importen märker
// därför objektet i den interna anteckningen och startar en uthyrarrunda
// ("ej kontaktad", uppföljning i dag) så det hamnar i "Följ upp uthyrare" i Min dag.
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { CrmFetchError, crmErrorMessage, crmFetchJson } from "@/lib/crm/fetcher";
import { listingToPropertyPatch, type ImportedListing } from "@/lib/crm/import/types";
import {
  qasaBudgetRoom,
  qasaCriteriaFromRequest,
  qasaHitAsProperty,
  qasaLeadNote,
  QASA_PAGE_SIZE,
  type QasaSearchCriteria,
  type QasaSearchHit,
} from "@/lib/crm/import/qasa-search";
import { matchDetails, type MatchChip } from "@/lib/crm/matching";
import type { PropertyWithOwner } from "@/lib/crm/owners";
import type { Request } from "@/lib/crm/schema";
import { ExternalLink, Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { MatchScore } from "./MatchScore";

interface SearchResponse {
  area: string;
  total: number;
  offset: number;
  hits: QasaSearchHit[];
  inCrm: Record<string, string>;
  /** Kommunen som den sökta tätorten hör till (Figeholm → Oskarshamn), annars null. */
  widerCity: string | null;
}

type Existing = { id: string; address: string | null; city: string | null };

const HOME_TYPE: Record<string, string> = {
  apartment: "Lägenhet",
  house: "Hus",
  terrace_house: "Radhus",
  duplex: "Parhus",
  cottage: "Stuga",
  loft: "Loft",
  corridor: "Korridorrum",
  room: "Rum",
  other: "Övrigt",
};

const CHIP_CLS: Record<MatchChip["tone"], string> = {
  good: "bg-green-50 text-green-800 border-green-200",
  warn: "bg-amber-50 text-amber-800 border-amber-200",
  bad: "bg-red-50 text-red-700 border-red-200",
};

const fmtKr = (n: number) => `${n.toLocaleString("sv-SE")} kr`;
const numOrNull = (v: string) => (v.trim() ? Number(v) : null);

export function QasaSearchPanel({
  request,
  suggestedIds,
  onSuggest,
  onImported,
}: {
  request: Request;
  /** Objekt-id:n som redan ligger som förslag på uppdraget. */
  suggestedIds: Set<string>;
  onSuggest: (propertyId: string, score: number) => Promise<boolean>;
  /** Nytt objekt skapat från Qasa — föräldern laddar om listan och öppnar det för granskning. */
  onImported: (propertyId: string) => void;
}) {
  const [criteriaState, setCriteria] = useState<QasaSearchCriteria>(() => qasaCriteriaFromRequest(request));
  const criteria = criteriaState;
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  // Qasa-id → objekt-id för träffar som importerats i den här sessionen.
  const [imported, setImported] = useState<Record<string, string>>({});

  async function search(offset = 0, override?: Partial<QasaSearchCriteria>) {
    const criteria = { ...criteriaState, ...override };
    if (override) setCriteria(criteria);
    if (!criteria.city.trim()) {
      setError("Ange en ort eller kommun att söka i.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await crmFetchJson<SearchResponse>("/api/crm/qasa-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ criteria, offset }),
      });
      setResult((prev) =>
        offset > 0 && prev ? { ...res, hits: [...prev.hits, ...res.hits], inCrm: { ...prev.inCrm, ...res.inCrm } } : res,
      );
    } catch (e) {
      setError(crmErrorMessage(e));
      if (offset === 0) setResult(null);
    } finally {
      setLoading(false);
    }
  }

  // Första sökningen körs direkt med uppdragets kriterier (timeout: StrictModes
  // dubbelmontering städar bort den första, så Qasa anropas en gång).
  useEffect(() => {
    if (!criteria.city.trim()) return;
    const t = setTimeout(() => search(), 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function scoreFor(hit: QasaSearchHit) {
    return matchDetails(request, qasaHitAsProperty(hit, request.city));
  }

  // Importerar annonsen som objekt (samma hämtning + dubblettkoll som "Ny bostad")
  // och lägger det som förslag. Fanns objektet redan föreslås det befintliga.
  async function importAndSuggest(hit: QasaSearchHit) {
    if (busyId) return;
    setBusyId(hit.qasaId);
    const score = scoreFor(hit).score;
    try {
      const { listing, existing } = await crmFetchJson<{ listing: ImportedListing; existing: Existing | null }>(
        "/api/crm/import-listing",
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: hit.url }) },
      );
      let propertyId = existing?.id ?? null;
      if (!propertyId) {
        const patch = listingToPropertyPatch(listing);
        if (!patch.postalCode) {
          toast({
            title: "Annonsen saknar postnummer på Qasa",
            description: "Lägg in objektet via Bostäder → Ny bostad och fyll i postnumret.",
            variant: "destructive",
          });
          return;
        }
        try {
          const created = await crmFetchJson<PropertyWithOwner>("/api/crm/properties", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...patch, notes: qasaLeadNote(patch.notes), status: "available" }),
          });
          propertyId = created.id;
          // Uthyrarrunda kopplad till uppdraget → "Följ upp uthyrare" i Min dag i dag.
          // Best-effort: objektet och anteckningen finns även om rundan inte skapas.
          const followUp = await crmFetchJson(`/api/crm/properties/${created.id}/outreach`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              requestId: request.id,
              nextFollowUpDate: new Date().toLocaleDateString("sv-SE"),
              nextFollowUpReason: "Qasa-uppslag: kontakta uthyraren, inget avtal ännu",
              note: `Importerad från Qasa via matchning: ${hit.url}`,
            }),
          }).then(() => true, () => false);
          toast({
            title: "Importerad som Qasa-uppslag",
            description: followUp
              ? "Inget avtal med uthyraren ännu — uppföljningen ligger i Min dag."
              : "Inget avtal med uthyraren ännu. Uppföljningen kunde inte skapas — lägg in den på objektet.",
          });
          if (listing.imageUrls.length) {
            // Best-effort: objektet är sparat även om bildhämtningen fallerar.
            await crmFetchJson(`/api/crm/properties/${created.id}/images/import`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ urls: listing.imageUrls }),
            }).catch(() => {});
          }
          onImported(created.id);
        } catch (e) {
          // 409 = samma adress+ort finns redan → föreslå det befintliga i stället för en kopia.
          const dup = e instanceof CrmFetchError && e.status === 409 ? (e.data as { existing?: Existing })?.existing : null;
          if (!dup) throw e;
          propertyId = dup.id;
        }
      }
      setImported((m) => ({ ...m, [hit.qasaId]: propertyId! }));
      if (!suggestedIds.has(propertyId)) await onSuggest(propertyId, score);
    } catch (e) {
      toast({ title: crmErrorMessage(e), variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  }

  const set = <K extends keyof QasaSearchCriteria>(k: K, v: QasaSearchCriteria[K]) =>
    setCriteria((c) => ({ ...c, [k]: v }));

  const hits = (result?.hits ?? [])
    .map((hit) => ({ hit, room: qasaBudgetRoom(hit, request.budgetMax), ...scoreFor(hit) }))
    .sort((a, b) => b.score - a.score);
  const canLoadMore = !!result && result.hits.length < result.total && result.hits.length >= QASA_PAGE_SIZE;

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl border p-3 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Sök på Qasa</h2>
          {result && (
            <span className="text-xs text-muted-foreground">
              {result.hits.length} av {result.total}
            </span>
          )}
        </div>
        <form
          className="grid grid-cols-2 gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            search();
          }}
        >
          <label className="text-[11px] text-muted-foreground space-y-0.5 col-span-2">
            Ort eller kommun
            <Input
              value={criteria.city}
              onChange={(e) => set("city", e.target.value)}
              className="h-8 text-xs"
              placeholder="Ort eller kommun, t.ex. Gävle"
              title="Qasa söker per ort eller kommun"
            />
          </label>
          <label className="text-[11px] text-muted-foreground space-y-0.5">
            Antal personer
            <Input
              type="number"
              min="0"
              value={criteria.persons ?? ""}
              onChange={(e) => set("persons", numOrNull(e.target.value))}
              className="h-8 text-xs"
              placeholder="Antal personer"
              title="Qasas max antal boende"
            />
          </label>
          <label className="text-[11px] text-muted-foreground space-y-0.5">
            Min sovrum
            <Input
              type="number"
              min="0"
              value={criteria.minBedrooms ?? ""}
              onChange={(e) => set("minBedrooms", numOrNull(e.target.value))}
              className="h-8 text-xs"
              placeholder="Min sovrum"
            />
          </label>
          <label className="text-[11px] text-muted-foreground space-y-0.5">
            Ledig senast
            <Input
              type="date"
              value={criteria.moveInLatest ?? ""}
              onChange={(e) => set("moveInLatest", e.target.value || null)}
              className="h-8 text-xs"
            />
          </label>
          <label className="text-[11px] text-muted-foreground space-y-0.5">
            Ledig minst till
            <Input
              type="date"
              value={criteria.availableUntil ?? ""}
              onChange={(e) => set("availableUntil", e.target.value || null)}
              className="h-8 text-xs"
            />
          </label>
          <label className="text-[11px] text-muted-foreground space-y-0.5">
            Max hyra på Qasa (kr/mån)
            <Input
              type="number"
              min="0"
              value={criteria.maxRent ?? ""}
              onChange={(e) => set("maxRent", numOrNull(e.target.value))}
              className="h-8 text-xs"
              placeholder="Max hyra på Qasa (kr/mån)"
              title="Qasa-hyran är vår inhyra — förifylld med kundens budget som tak"
            />
          </label>
          <div className="flex items-end gap-3 pb-2 text-xs">
            <label className="inline-flex items-center gap-1.5">
              <input type="checkbox" checked={criteria.furnished} onChange={(e) => set("furnished", e.target.checked)} />
              Möblerat
            </label>
            <label className="inline-flex items-center gap-1.5" title="Döljer rum i delade boenden">
              <input type="checkbox" checked={criteria.privateOnly} onChange={(e) => set("privateOnly", e.target.checked)} />
              Hela bostaden
            </label>
          </div>
          <Button type="submit" size="sm" className="col-span-2 gap-1.5 text-xs" disabled={loading}>
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
            {loading ? "Söker…" : "Sök på Qasa"}
          </Button>
        </form>
        {error && <p className="text-xs text-red-700">{error}</p>}
      </div>

      {result && hits.length === 0 && !loading && (
        <p className="text-sm text-muted-foreground italic">
          Inga Qasa-bostäder matchar — prova att lätta på datum, hyrestak eller antal personer.
        </p>
      )}

      {result?.widerCity && !loading && (
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs"
          onClick={() => search(0, { city: result.widerCity! })}
        >
          {criteria.city} ligger i {result.widerCity} — sök i hela {result.widerCity}
        </Button>
      )}

      {hits.map(({ hit, score, chips, room }) => {
        const propertyId = imported[hit.qasaId] ?? result?.inCrm[hit.qasaId] ?? null;
        const already = !!propertyId && suggestedIds.has(propertyId);
        const busy = busyId === hit.qasaId;
        const title = [hit.street, hit.locality].filter(Boolean).join(", ") || `Qasa ${hit.qasaId}`;
        return (
          <div key={hit.qasaId} className="bg-white rounded-xl border p-3 flex gap-3 hover:border-nordic-300 transition-colors">
            {hit.imageUrl ? (
              <img src={hit.imageUrl} alt="" loading="lazy" className="h-20 w-24 shrink-0 rounded-md object-cover bg-nordic-100" />
            ) : (
              <div className="h-20 w-24 shrink-0 rounded-md bg-nordic-100" />
            )}
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <a
                    href={hit.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-sm hover:text-primary-600 hover:underline inline-flex items-center gap-1"
                  >
                    {title} <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                  <div className="text-xs text-muted-foreground">
                    {[
                      hit.homeType && (HOME_TYPE[hit.homeType] ?? hit.homeType),
                      hit.squareMeters && `${hit.squareMeters} m²`,
                      hit.bedrooms != null && `${hit.bedrooms} sovrum`,
                      hit.householdSize && `max ${hit.householdSize} pers`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {hit.rent != null && (
                      <span className="font-medium text-nordic-800">
                        {fmtKr(hit.rent)}/mån{hit.currency && hit.currency !== "SEK" ? ` (${hit.currency})` : ""}
                      </span>
                    )}
                    {hit.startDate && ` · ledig från ${hit.startDate}`}
                    {hit.endDate ? ` till ${hit.endDate}` : " · tillsvidare"}
                  </div>
                </div>
                <MatchScore score={score} />
              </div>
              {(chips.length > 0 || room != null) && (
                <div className="flex flex-wrap gap-1">
                  {room != null && (
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${CHIP_CLS[room > 0 ? "good" : "bad"]}`}
                      title="Kundens budget minus Qasa-hyran (vår inhyra), före städ, möblering och övriga kostnader"
                    >
                      {room > 0 ? `${fmtKr(room)}/mån kvar till kundens budget` : "Ingen marginal mot kundens budget"}
                    </span>
                  )}
                  {chips.map((c, i) => (
                    <span key={i} className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${CHIP_CLS[c.tone]}`}>
                      {c.label}
                    </span>
                  ))}
                </div>
              )}
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs"
                disabled={already || busy || (!!busyId && !busy)}
                onClick={() => importAndSuggest(hit)}
              >
                {busy ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> Importerar…</>
                ) : already ? (
                  "✓ Redan föreslagen"
                ) : propertyId ? (
                  "Finns i CRM — lägg till som förslag"
                ) : (
                  "Importera & lägg till som förslag"
                )}
              </Button>
            </div>
          </div>
        );
      })}

      {canLoadMore && (
        <Button variant="ghost" size="sm" className="w-full text-xs" disabled={loading} onClick={() => search(result!.hits.length)}>
          {loading ? "Hämtar…" : "Visa fler"}
        </Button>
      )}
    </div>
  );
}
