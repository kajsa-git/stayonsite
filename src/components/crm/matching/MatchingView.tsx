"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { matchDetails, availableForRequest, type MatchChip } from "@/lib/crm/matching";
import type { Request } from "@/lib/crm/schema";
import type { PropertyWithOwner } from "@/lib/crm/owners";
import { toast } from "@/components/ui/use-toast";
import { ArrowUpRight, Check, Loader2, Navigation, Pencil, Search, Send, Trash2, X } from "lucide-react";
import { useDistances } from "@/hooks/use-distances";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import { MatchScore } from "./MatchScore";
import { PropertyDetailModal } from "../property/PropertyDetailModal";
import { swrFetcher } from "@/lib/crm/fetcher";
import { plusDaysStockholm } from "@/lib/crm/date";

interface Props {
  request: Request;
  companyName: string;
  companyInvoiceEmail: string | null;
}

interface MatchRow {
  id: string;
  propertyId: string;
  status: string;
  matchScore: number | null;
  sentAt: string | null;
  followUpDate: string | null;
  followUpReason: string | null;
  propertyAddress: string | null;
  propertyCity: string | null;
  propertyRentOut: number | null;
}

const plusDays = plusDaysStockholm;

const fetcher = swrFetcher;

const MATCH_STATUS_LABEL: Record<string, string> = {
  suggested: "Förslag",
  sent: "Skickad",
  accepted: "Accepterad",
  rejected: "Avböjd",
};
const MATCH_STATUS_CLS: Record<string, string> = {
  suggested: "bg-nordic-100 text-nordic-700",
  sent: "bg-blue-100 text-blue-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

// Varning på objekt som inte längre är lediga (taget av annan kund el. av marknaden)
const PROP_UNAVAILABLE: Record<string, string> = {
  reserved: "Reserverad",
  rented: "Uthyrd",
  off_market: "Av marknaden",
};

const FOLLOWUP_REASONS = ["Kolla pris", "Tillgänglighet", "Nyckelvisning", "Få bilder", "Bekräfta antal bäddar"];

export function MatchingView({ request, companyName, companyInvoiceEmail }: Props) {
  const router = useRouter();
  const [detailProperty, setDetailProperty] = useState<PropertyWithOwner | null>(null);
  const [confirmAccept, setConfirmAccept] = useState<MatchRow | null>(null);
  const [wonValue, setWonValue] = useState("");
  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    q: "",
    city: request.city ?? "",
    minBeds: request.persons?.toString() ?? "",
    maxRent: request.budgetMax?.toString() ?? "",
    minRating: "",
    availableOnly: true,
    hideSuggested: false,
    furnished: !!request.furnishedRequired,
    garage: !!request.garageRequired,
    availableDates: false,
    showWeak: false,
  });
  const { data: properties = [], isLoading } = useSWR<PropertyWithOwner[]>(`/api/crm/properties?q=`, fetcher);
  const { data: matches = [], mutate: mutateMatches } = useSWR<MatchRow[]>(
    `/api/crm/matches?requestId=${request.id}`,
    fetcher
  );

  const suggestedIds = new Set(matches.map((m) => m.propertyId));

  const scored = properties
    .filter((p) => {
      const q = filters.q.trim().toLowerCase();
      const hay = [p.address, p.postalCode, p.city, p.ownerName, p.ownerContactPerson, p.notes]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (q && !hay.includes(q)) return false;
      if (filters.city.trim() && !(p.city ?? "").toLowerCase().includes(filters.city.trim().toLowerCase())) return false;
      if (filters.minBeds && (p.beds ?? 0) < parseInt(filters.minBeds, 10)) return false;
      if (filters.maxRent && (p.rentOut ?? Infinity) > parseFloat(filters.maxRent)) return false;
      if (filters.minRating && (p.rating ?? 0) < parseInt(filters.minRating, 10)) return false;
      if (filters.availableOnly && p.status !== "available") return false;
      if (filters.furnished && !p.furnished) return false;
      if (filters.garage && !p.garage) return false;
      if (filters.availableDates && !availableForRequest(request, p)) return false;
      if (filters.hideSuggested && suggestedIds.has(p.id)) return false;
      return true;
    })
    .map((p) => ({ property: p, ...matchDetails(request, p) }))
    .filter((r) => filters.showWeak || r.score > 0)
    .sort((a, b) => b.score - a.score);

  const isFiltered =
    !!filters.q ||
    !!filters.city ||
    !!filters.minBeds ||
    !!filters.maxRent ||
    !!filters.minRating ||
    !filters.availableOnly ||
    filters.hideSuggested ||
    filters.furnished ||
    filters.garage ||
    filters.availableDates ||
    filters.showWeak;

  // Avstånd objekt → förfrågans arbetsplatsadress (kör-avstånd via Google, klient-sidigt).
  const workplaceAddress =
    [request.street, request.postalCode, request.city].filter(Boolean).join(" ") ||
    request.addressQuery ||
    request.city ||
    "";
  const distDests = (() => {
    const byId = new Map<string, string>();
    for (const { property } of scored) {
      byId.set(property.id, [property.address, property.postalCode, property.city].filter(Boolean).join(" "));
    }
    for (const m of matches) {
      if (!byId.has(m.propertyId)) byId.set(m.propertyId, [m.propertyAddress, m.propertyCity].filter(Boolean).join(" "));
    }
    return [...byId].map(([id, address]) => ({ id, address }));
  })();
  const distances = useDistances(workplaceAddress, distDests);

  function resetFilters() {
    setFilters({
      q: "",
      city: "",
      minBeds: "",
      maxRent: "",
      minRating: "",
      availableOnly: true,
      hideSuggested: false,
      furnished: false,
      garage: false,
      availableDates: false,
      showWeak: false,
    });
  }

  async function addSuggestion(propertyId: string, score: number) {
    try {
      const res = await fetch("/api/crm/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: request.id, propertyId, matchScore: score }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        toast({ title: j.error ?? "Kunde inte lägga till förslag", variant: "destructive" });
        return;
      }
      mutateMatches();
      toast({ title: "Förslag tillagt" });
    } catch {
      toast({ title: "Kunde inte lägga till förslag", variant: "destructive" });
    }
  }

  // Endast Skickad/Avböjd här — accept hanteras av acceptMatch (vinst-kaskaden).
  async function setMatchStatus(id: string, status: string) {
    // Skickad → default jaga-datum (+3 dagar). Avböjd → sluta jaga.
    const extra: Record<string, unknown> =
      status === "sent" ? { followUpDate: plusDays(3) } : status === "rejected" ? { followUpDate: null } : {};
    try {
      const res = await fetch(`/api/crm/matches/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...extra }),
      });
      if (!res.ok) {
        toast({ title: "Kunde inte uppdatera förslaget", variant: "destructive" });
        return;
      }
      mutateMatches();
      toast({ title: status === "sent" ? "Markerat som skickad" : "Förslag avböjt" });
    } catch {
      toast({ title: "Kunde inte uppdatera förslaget", variant: "destructive" });
    }
  }

  // Acceptera ett förslag → vunnet objekt + stäng övriga utestående förslag ("hyrde annat objekt")
  async function acceptMatch(m: MatchRow) {
    if (accepting) return;
    setAccepting(true);
    setAcceptError(null);
    const patch = async (url: string, body: unknown) => {
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`${url} → ${res.status}`);
    };
    try {
      // Förfrågan blir won (Att fakturera) med valt objekt + värde FÖRST — om detta
      // kärnsteg fallerar avbryts hela kaskaden innan något förslag stängts.
      await patch(`/api/crm/requests/${request.id}`, {
        status: "won",
        wonPropertyId: m.propertyId,
        monthlyValue: wonValue ? parseFloat(wonValue) : undefined,
      });
      await patch(`/api/crm/matches/${m.id}`, { status: "accepted", followUpDate: null });
      const others = matches.filter((x) => x.id !== m.id && x.status !== "accepted" && x.status !== "rejected");
      await Promise.all(
        others.map((x) =>
          patch(`/api/crm/matches/${x.id}`, {
            status: "rejected",
            followUpDate: null,
            notes: "Kund valde annat objekt",
          })
        )
      );
      setConfirmAccept(null);
      mutateMatches();
      router.refresh();
      toast({ title: "Affären flyttad till att fakturera" });
    } catch (err) {
      setAcceptError(
        "Något gick fel när affären skulle stängas. Kontrollera förslagens status nedan och försök igen."
      );
      mutateMatches();
      router.refresh();
      console.error("acceptMatch failed:", err);
    } finally {
      setAccepting(false);
    }
  }

  async function setMatchFollowUp(id: string, date: string) {
    await fetch(`/api/crm/matches/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followUpDate: date || null }),
    });
    mutateMatches();
    toast({ title: "Uppföljning sparad" });
  }

  async function setMatchReason(id: string, reason: string) {
    await fetch(`/api/crm/matches/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followUpReason: reason || null }),
    });
    mutateMatches();
    toast({ title: "Anledning sparad" });
  }

  async function removeMatch(id: string) {
    await fetch(`/api/crm/matches/${id}`, { method: "DELETE" });
    mutateMatches();
    toast({ title: "Förslag borttaget" });
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <datalist id="followup-reasons">
        {FOLLOWUP_REASONS.map((r) => (
          <option key={r} value={r} />
        ))}
      </datalist>
      <div className="mb-6">
        <button
          onClick={() => router.push(`/crm/company/${request.companyId}`)}
          className="text-sm text-muted-foreground hover:text-foreground mb-2 block"
        >
          ← {companyName}
        </button>
        <h1 className="text-xl font-bold">Matcha förfrågan #{request.requestNumber}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {[
            [request.street, request.postalCode, request.city].filter(Boolean).join(" ") || request.addressQuery || request.city,
            request.persons && `${request.persons} pers.`,
            (request.bedroomsFrom || request.bedroomsTo) &&
              `${request.bedroomsFrom ?? "?"}-${request.bedroomsTo ?? "?"} sovrum`,
            (request.bedsFrom || request.bedsTo) &&
              `${request.bedsFrom ?? "?"}-${request.bedsTo ?? "?"} bäddar`,
            request.budgetMax && `≤ ${request.budgetMax.toLocaleString("sv-SE")} kr`,
            request.projectDurationMonths && `${request.projectDurationMonths} mån`,
            request.startDate,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left: criteria + current proposals */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border p-4">
            <h2 className="text-sm font-semibold mb-3">Kriterier</h2>
            <dl className="space-y-2 text-sm">
              <Row label="Ort" value={request.city} />
              <Row label="Postnummer" value={request.postalCode} />
              <Row label="Gata / plats" value={request.street} />
              <Row label="Adressökning" value={request.addressQuery} />
              <Row label="Antal personer" value={request.persons?.toString()} />
              <Row
                label="Sovrum"
                value={
                  request.bedroomsFrom || request.bedroomsTo
                    ? `${request.bedroomsFrom ?? "?"}-${request.bedroomsTo ?? "?"}`
                    : undefined
                }
              />
              <Row
                label="Bäddar"
                value={
                  request.bedsFrom || request.bedsTo
                    ? `${request.bedsFrom ?? "?"}-${request.bedsTo ?? "?"}`
                    : undefined
                }
              />
              <Row label="Budget (max)" value={request.budgetMax ? `${request.budgetMax.toLocaleString("sv-SE")} kr/mån` : undefined} />
              <Row label="Projekttid" value={request.projectDurationMonths ? `${request.projectDurationMonths} mån` : undefined} />
              <Row label="Projekt-id faktura" value={request.billingProjectId ?? request.requestNumber?.toString()} />
              <Row label="Möblerat krävs" value={request.furnishedRequired ? "Ja" : undefined} />
              <Row label="Garage krävs" value={request.garageRequired ? "Ja" : undefined} />
              <Row label="Inflytt" value={request.startDate} />
              <Row label="Utflytt" value={request.endDate} />
            </dl>
          </div>

          <div className="bg-white rounded-xl border p-4">
            <h2 className="text-sm font-semibold mb-3">Förslag ({matches.length})</h2>
            {matches.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Inga förslag tillagda ännu.</p>
            ) : (
              <div className="space-y-2">
                {matches.map((m) => (
                  <div key={m.id} className="border rounded-lg p-2.5 text-sm">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <button
                        onClick={() => router.push(`/crm/properties?id=${m.propertyId}`)}
                        className="font-medium truncate text-left hover:text-primary-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded inline-flex items-center gap-1"
                        title="Öppna i Objektsbanken"
                      >
                        {m.propertyAddress ?? "(bostad)"}
                        <ArrowUpRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                      </button>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${MATCH_STATUS_CLS[m.status]}`}>
                        {MATCH_STATUS_LABEL[m.status]}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      {[m.propertyCity, m.propertyRentOut && `${m.propertyRentOut.toLocaleString("sv-SE")} kr`, m.sentAt && `skickad ${m.sentAt.slice(0, 10)}`]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                    {distances[m.propertyId] && (
                      <div className="-mt-1 mb-2 inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary-700">
                        <Navigation className="h-3 w-3" />
                        {distances[m.propertyId].distanceText} · {distances[m.propertyId].durationText} till arbetsplatsen
                      </div>
                    )}
                    {(m.status === "suggested" || m.status === "sent") && (
                      <div className="flex flex-wrap items-center gap-1.5 mb-2 text-xs text-muted-foreground">
                        <span>📲 Följ upp:</span>
                        <input
                          type="date"
                          value={m.followUpDate ?? ""}
                          onChange={(e) => setMatchFollowUp(m.id, e.target.value)}
                          className="border rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                        <input
                          list="followup-reasons"
                          defaultValue={m.followUpReason ?? ""}
                          onBlur={(e) => {
                            if ((e.target.value || "") !== (m.followUpReason ?? "")) setMatchReason(m.id, e.target.value);
                          }}
                          placeholder="anledning"
                          className="border rounded px-1.5 py-0.5 text-xs w-28 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
                    )}
                    <div className="flex gap-1">
                      {m.status === "suggested" && (
                        <button onClick={() => setMatchStatus(m.id, "sent")} className="text-xs px-2 py-1 rounded border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center gap-1">
                          <Send className="h-3 w-3" /> Skickad
                        </button>
                      )}
                      {m.status !== "accepted" && (
                        <button
                          onClick={() => {
                            setWonValue(m.propertyRentOut?.toString() ?? request.monthlyValue?.toString() ?? "");
                            setConfirmAccept(m);
                          }}
                          className="text-xs px-2 py-1 rounded border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 flex items-center gap-1"
                        >
                          <Check className="h-3 w-3" /> Acceptera
                        </button>
                      )}
                      {m.status !== "rejected" && (
                        <button onClick={() => setMatchStatus(m.id, "rejected")} className="text-xs px-2 py-1 rounded border border-red-200 bg-red-50 text-red-700 hover:bg-red-100">
                          Avböj
                        </button>
                      )}
                      {m.status === "rejected" && (
                        <button onClick={() => setMatchStatus(m.id, "sent")} className="text-xs px-2 py-1 rounded border border-input bg-white text-muted-foreground hover:bg-muted flex items-center gap-1">
                          <Pencil className="h-3 w-3" /> Ändra
                        </button>
                      )}
                      <button onClick={() => removeMatch(m.id)} className="text-xs px-1.5 py-1 rounded hover:bg-muted text-muted-foreground ml-auto" title="Ta bort förslag">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: available properties */}
        <div className="space-y-3">
          <div className="bg-white rounded-xl border p-3 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">Sök bostäder</h2>
              <span className="text-xs text-muted-foreground">{scored.length} av {properties.length}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2 relative">
                <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={filters.q}
                  onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                  className="h-8 pl-7 text-xs"
                  placeholder="Adress, uthyrare, anteckning…"
                />
              </div>
              <Input
                value={filters.city}
                onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
                className="h-8 text-xs"
                placeholder="Ort"
              />
              <Input
                type="number"
                min="0"
                value={filters.minBeds}
                onChange={(e) => setFilters((f) => ({ ...f, minBeds: e.target.value }))}
                className="h-8 text-xs"
                placeholder="Min bäddar"
              />
              <Input
                type="number"
                min="0"
                value={filters.maxRent}
                onChange={(e) => setFilters((f) => ({ ...f, maxRent: e.target.value }))}
                className="h-8 text-xs"
                placeholder="Max hyra (kr/mån)"
              />
              <Input
                type="number"
                min="0"
                max="10"
                value={filters.minRating}
                onChange={(e) => setFilters((f) => ({ ...f, minRating: e.target.value }))}
                className="h-8 text-xs"
                placeholder="Min betyg (0–10)"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <FilterPill active={filters.availableOnly} onClick={() => setFilters((f) => ({ ...f, availableOnly: !f.availableOnly }))}>
                Endast lediga
              </FilterPill>
              <FilterPill active={filters.availableDates} onClick={() => setFilters((f) => ({ ...f, availableDates: !f.availableDates }))}>
                Ledig på förfrågans datum
              </FilterPill>
              <FilterPill active={filters.furnished} onClick={() => setFilters((f) => ({ ...f, furnished: !f.furnished }))}>
                Möblerat
              </FilterPill>
              <FilterPill active={filters.garage} onClick={() => setFilters((f) => ({ ...f, garage: !f.garage }))}>
                Garage
              </FilterPill>
              <FilterPill active={filters.hideSuggested} onClick={() => setFilters((f) => ({ ...f, hideSuggested: !f.hideSuggested }))}>
                Dölj föreslagna
              </FilterPill>
              <FilterPill active={filters.showWeak} onClick={() => setFilters((f) => ({ ...f, showWeak: !f.showWeak }))}>
                Visa svaga träffar
              </FilterPill>
              {isFiltered && (
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 rounded-full border border-input px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted"
                >
                  <X className="h-3 w-3" /> Rensa
                </button>
              )}
            </div>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Letar boenden…
              </div>
              {[0, 1, 2].map((i) => (
                <div key={i} className="bg-white rounded-xl border p-4 animate-pulse space-y-2">
                  <div className="h-4 w-2/3 rounded bg-nordic-100" />
                  <div className="h-3 w-1/2 rounded bg-nordic-100" />
                  <div className="h-3 w-1/3 rounded bg-nordic-100" />
                </div>
              ))}
            </div>
          ) : scored.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              {isFiltered ? "Inga bostäder matchar filtren — justera eller rensa." : "Inga bostäder inlagda ännu."}
            </p>
          ) : (
            scored.map(({ property, score, chips }) => {
              const already = suggestedIds.has(property.id);
              return (
                <div key={property.id} className="bg-white rounded-xl border p-4 hover:border-nordic-300 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <button
                        onClick={() => setDetailProperty(property)}
                        className="font-medium text-sm text-left hover:text-primary-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded"
                        title="Visa alla detaljer"
                      >
                        {property.address}
                      </button>
                      <div className="text-xs text-muted-foreground">
                        {[property.city, property.beds && `${property.beds} bäddar`, property.bedrooms && `${property.bedrooms} sovrum`]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                      {distances[property.id] && (
                        <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary-700">
                          <Navigation className="h-3 w-3" />
                          {distances[property.id].distanceText} · {distances[property.id].durationText} till arbetsplatsen
                        </div>
                      )}
                      {property.status && PROP_UNAVAILABLE[property.status] && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-100 text-red-800">
                          ⚠️ {PROP_UNAVAILABLE[property.status]}
                        </span>
                      )}
                    </div>
                    <MatchScore score={score} />
                  </div>
                  {chips.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {chips.map((c, i) => (
                        <Chip key={i} chip={c} />
                      ))}
                    </div>
                  )}
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-3">
                    <Row label="Uthyrare" value={property.ownerName} />
                    <Row label="Hyra ut" value={property.rentOut ? `${property.rentOut} kr/mån` : undefined} />
                    <Row label="Tillgänglig" value={property.moveInFrom} />
                    <Row label="Status" value={property.status} />
                  </dl>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className="text-xs" onClick={() => setDetailProperty(property)}>
                      Detaljer
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      disabled={already}
                      onClick={() => addSuggestion(property.id, score)}
                    >
                      {already ? "✓ Redan föreslagen" : "Lägg till som förslag"}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <PropertyDetailModal property={detailProperty} onClose={() => setDetailProperty(null)} />

      <Dialog
        open={!!confirmAccept}
        onOpenChange={(o) => {
          if (!o && !accepting) {
            setConfirmAccept(null);
            setAcceptError(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Acceptera objekt</DialogTitle>
          </DialogHeader>

          <div className="rounded-md border bg-muted/40 p-3 text-sm space-y-1">
            <div className="font-medium">{confirmAccept?.propertyAddress ?? "(bostad)"}</div>
            {confirmAccept?.propertyCity && (
              <div className="text-xs text-muted-foreground">{confirmAccept.propertyCity}</div>
            )}
            <div className="text-xs text-muted-foreground">
              Kund: {companyName}
              <> · Projekt-id: <span className="text-nordic-800">{request.billingProjectId ?? request.requestNumber}</span></>
              {companyInvoiceEmail ? (
                <> · Faktura: <span className="text-nordic-800">{companyInvoiceEmail}</span></>
              ) : (
                <span className="text-amber-700"> · saknar fakturamail</span>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="wonval">Månadsvärde (kr) — affärsvärde att fakturera</Label>
            <Input
              id="wonval"
              type="number"
              placeholder="T.ex. 24500"
              value={wonValue}
              onChange={(e) => setWonValue(e.target.value)}
            />
          </div>

          <p className="text-sm text-muted-foreground">
            Affären flyttas till <strong>Att fakturera</strong>.
            {(() => {
              const others = matches.filter((x) => x.id !== confirmAccept?.id && x.status !== "accepted" && x.status !== "rejected").length;
              return others > 0
                ? ` ${others} övriga förslag stängs (hyrde annat objekt) och slutar jagas.`
                : "";
            })()}
          </p>

          {acceptError && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {acceptError}
            </p>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmAccept(null)} disabled={accepting}>
              Avbryt
            </Button>
            <Button onClick={() => confirmAccept && acceptMatch(confirmAccept)} disabled={accepting}>
              {accepting ? "Stänger affären…" : "Bekräfta — vunnen affär"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-2">
      <dt className="text-muted-foreground shrink-0">{label}:</dt>
      <dd>{value}</dd>
    </div>
  );
}

const CHIP_CLS: Record<MatchChip["tone"], string> = {
  good: "bg-green-100 text-green-800 border-green-200",
  warn: "bg-amber-100 text-amber-800 border-amber-200",
  bad: "bg-red-100 text-red-800 border-red-200",
};

function Chip({ chip }: { chip: MatchChip }) {
  return (
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${CHIP_CLS[chip.tone]}`}>
      {chip.label}
    </span>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-2.5 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 ${
        active
          ? "border-primary-300 bg-primary-50 text-primary-800"
          : "border-input bg-white text-muted-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}
