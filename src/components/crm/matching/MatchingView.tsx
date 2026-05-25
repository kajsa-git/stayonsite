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
import { matchScore } from "@/lib/crm/matching";
import type { Property, Request } from "@/lib/crm/schema";
import { Check, Send, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import { MatchScore } from "./MatchScore";
import { PropertyDetailModal } from "../property/PropertyDetailModal";

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

function plusDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

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
  const [detailProperty, setDetailProperty] = useState<Property | null>(null);
  const [confirmAccept, setConfirmAccept] = useState<MatchRow | null>(null);
  const [wonValue, setWonValue] = useState("");
  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const { data: properties = [], isLoading } = useSWR<Property[]>(`/api/crm/properties?q=`, fetcher);
  const { data: matches = [], mutate: mutateMatches } = useSWR<MatchRow[]>(
    `/api/crm/matches?requestId=${request.id}`,
    fetcher
  );

  const suggestedIds = new Set(matches.map((m) => m.propertyId));

  const scored = properties
    .map((p) => ({ property: p, score: matchScore(request, p) }))
    .sort((a, b) => b.score - a.score);

  async function addSuggestion(propertyId: string, score: number) {
    await fetch("/api/crm/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: request.id, propertyId, matchScore: score }),
    });
    mutateMatches();
  }

  // Endast Skickad/Avböjd här — accept hanteras av acceptMatch (vinst-kaskaden).
  async function setMatchStatus(id: string, status: string) {
    // Skickad → default jaga-datum (+3 dagar). Avböjd → sluta jaga.
    const extra: Record<string, unknown> =
      status === "sent" ? { followUpDate: plusDays(3) } : status === "rejected" ? { followUpDate: null } : {};
    await fetch(`/api/crm/matches/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, ...extra }),
    });
    mutateMatches();
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
  }

  async function setMatchReason(id: string, reason: string) {
    await fetch(`/api/crm/matches/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followUpReason: reason || null }),
    });
    mutateMatches();
  }

  async function removeMatch(id: string) {
    await fetch(`/api/crm/matches/${id}`, { method: "DELETE" });
    mutateMatches();
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
            request.city,
            request.persons && `${request.persons} pers.`,
            request.budgetMax && `≤ ${request.budgetMax.toLocaleString("sv-SE")} kr`,
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
              <Row label="Antal personer" value={request.persons?.toString()} />
              <Row label="Budget (max)" value={request.budgetMax ? `${request.budgetMax.toLocaleString("sv-SE")} kr/mån` : undefined} />
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
                      <span className="font-medium truncate">{m.propertyAddress ?? "(bostad)"}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${MATCH_STATUS_CLS[m.status]}`}>
                        {MATCH_STATUS_LABEL[m.status]}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      {[m.propertyCity, m.propertyRentOut && `${m.propertyRentOut.toLocaleString("sv-SE")} kr`, m.sentAt && `skickad ${m.sentAt.slice(0, 10)}`]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
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
                          <Check className="h-3 w-3" /> Kund valde detta
                        </button>
                      )}
                      {m.status !== "rejected" && (
                        <button onClick={() => setMatchStatus(m.id, "rejected")} className="text-xs px-2 py-1 rounded border border-red-200 bg-red-50 text-red-700 hover:bg-red-100">
                          Avböjd
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
          <h2 className="text-sm font-semibold">Tillgängliga bostäder ({properties.length})</h2>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Laddar…</p>
          ) : scored.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Inga bostäder inlagda ännu.</p>
          ) : (
            scored.map(({ property, score }) => {
              const already = suggestedIds.has(property.id);
              return (
                <div key={property.id} className="bg-white rounded-xl border p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <button
                        onClick={() => setDetailProperty(property)}
                        className="font-medium text-sm text-left hover:text-primary-600 hover:underline"
                        title="Visa alla detaljer"
                      >
                        {property.address}
                      </button>
                      <div className="text-xs text-muted-foreground">
                        {[property.city, property.beds && `${property.beds} bäddar`, property.bedrooms && `${property.bedrooms} sovrum`]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                      {property.status && PROP_UNAVAILABLE[property.status] && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-100 text-red-800">
                          ⚠️ {PROP_UNAVAILABLE[property.status]}
                        </span>
                      )}
                    </div>
                    <MatchScore score={score} />
                  </div>
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
            <DialogTitle>Kund valde detta objekt</DialogTitle>
          </DialogHeader>

          <div className="rounded-md border bg-muted/40 p-3 text-sm space-y-1">
            <div className="font-medium">{confirmAccept?.propertyAddress ?? "(bostad)"}</div>
            {confirmAccept?.propertyCity && (
              <div className="text-xs text-muted-foreground">{confirmAccept.propertyCity}</div>
            )}
            <div className="text-xs text-muted-foreground">
              Kund: {companyName}
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
