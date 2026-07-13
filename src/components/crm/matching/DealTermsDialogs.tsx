"use client";

// Stämplade affärsvillkor per match (fas 1 av "delad sanning"):
//   SendOfferDialog    — erbjudandet till kund (offer_*). Stämplas när det skickas;
//                        objektets rentOut kan ändras efteråt utan att röra affären.
//   PromiseTermsDialog — löftet till uthyraren (promised_*). Servern stämplar
//                        promised_at; en öppen outreach-runda för paret flippas
//                        till bekräftad.
// Kundens erbjudandelänk (fas 2) visar ENDAST offer_*-fälten — aldrig promised_*.

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { swrFetcher } from "@/lib/crm/fetcher";
import type { KalkylScenario } from "@/lib/crm/kalkyl";
import type { MatchEvent, Request } from "@/lib/crm/schema";
import { useState } from "react";
import useSWR from "swr";

// Det matchdialogerna behöver veta — delmängd av MatchingViews MatchRow.
export interface DealTermsMatch {
  id: string;
  propertyId: string;
  status: string;
  propertyAddress: string | null;
  propertyCity: string | null;
  propertyRentIn: number | null;
  propertyRentOut: number | null;
  kalkyl: KalkylScenario[] | null;
  offerRentOut: number | null;
  offerStartDate: string | null;
  offerEndDate: string | null;
  offerOngoing: boolean | null;
  offerNote: string | null;
  promisedRentIn: number | null;
  promisedStartDate: string | null;
  promisedEndDate: string | null;
  promisedConditions: string | null;
  promisedAt: string | null;
}

export function formatKr(v: number | null | undefined): string | null {
  return v == null ? null : `${v.toLocaleString("sv-SE")} kr/mån`;
}

export function formatPeriod(start: string | null, end: string | null, ongoing: boolean | null): string | null {
  if (!start && !end && !ongoing) return null;
  const from = start ?? "?";
  return ongoing ? `${from} → tills vidare` : `${from} → ${end ?? "?"}`;
}

async function patchMatch(id: string, body: Record<string, unknown>): Promise<boolean> {
  const res = await fetch(`/api/crm/matches/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.ok;
}

// Förhandlingshistorik i dialogerna: tidigare stämplingar av samma villkorsgrupp,
// nyast först. Priser/löptid snurrar mellan visning och slutgiltigt avtal —
// här syns vad som erbjöds/lovades när.
function TermsHistory({ matchId, type }: { matchId: string; type: "offer_terms" | "promised_terms" }) {
  const { data: events } = useSWR<MatchEvent[]>(`/api/crm/matches/${matchId}/events`, swrFetcher);
  const rows = (events ?? []).filter((e) => e.type === type);
  if (rows.length === 0) return null;

  const line = (e: MatchEvent): string => {
    const d = (e.data ?? {}) as Record<string, unknown>;
    const kr = typeof d.rentOut === "number" ? d.rentOut : typeof d.rentIn === "number" ? d.rentIn : null;
    const period = d.ongoing
      ? `${d.startDate ?? "?"} → tills vidare`
      : d.startDate || d.endDate
        ? `${d.startDate ?? "?"} → ${d.endDate ?? "?"}`
        : null;
    const extra = (d.note ?? d.conditions) as string | null;
    return [kr != null ? `${kr.toLocaleString("sv-SE")} kr/mån` : "—", period, extra].filter(Boolean).join(" · ");
  };

  return (
    <div className="rounded-md border bg-muted/30 px-3 py-2">
      <p className="text-xs font-medium text-muted-foreground mb-1">
        Historik ({rows.length} {rows.length === 1 ? "stämpling" : "stämplingar"})
      </p>
      <ul className="space-y-0.5 max-h-28 overflow-y-auto">
        {rows.slice(0, 8).map((e) => (
          <li key={e.id} className="text-xs text-muted-foreground">
            <span className="tabular-nums text-nordic-500">{(e.createdAt ?? "").slice(0, 16)}</span> — {line(e)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SendOfferDialog({
  match,
  request,
  onClose,
  onSaved,
}: {
  match: DealTermsMatch | null;
  request: Request;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  // Nycklad på match-id så fälten förifylls om när en annan match öppnas.
  return (
    <Dialog open={!!match} onOpenChange={(o) => !o && !saving && onClose()}>
      {match && (
        <SendOfferForm
          key={match.id}
          match={match}
          request={request}
          saving={saving}
          setSaving={setSaving}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}
    </Dialog>
  );
}

function SendOfferForm({
  match,
  request,
  saving,
  setSaving,
  onClose,
  onSaved,
}: {
  match: DealTermsMatch;
  request: Request;
  saving: boolean;
  setSaving: (v: boolean) => void;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isUpdate = match.status !== "suggested" && match.offerRentOut != null;
  // Kalkylens Bas-scenario vinner över objektets listpris — samma regel som vinn-flödet.
  const [rentOut, setRentOut] = useState(
    (match.offerRentOut ?? match.kalkyl?.[0]?.rentOut ?? match.propertyRentOut)?.toString() ?? ""
  );
  const [startDate, setStartDate] = useState(match.offerStartDate ?? request.startDate ?? "");
  const [ongoing, setOngoing] = useState(match.offerOngoing ?? !!request.endDateOngoing);
  const [endDate, setEndDate] = useState(match.offerEndDate ?? request.endDate ?? "");
  const [note, setNote] = useState(match.offerNote ?? "");

  async function save() {
    const parsed = parseFloat(rentOut.replace(/\s/g, "").replace(",", "."));
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast({ title: "Ange pris till kund (kr/mån)", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const ok = await patchMatch(match.id, {
        ...(match.status === "suggested" ? { status: "sent" } : {}),
        offerRentOut: parsed,
        offerStartDate: startDate || null,
        offerEndDate: ongoing ? null : endDate || null,
        offerOngoing: ongoing,
        offerNote: note.trim() || null,
      });
      if (!ok) {
        toast({ title: "Kunde inte spara erbjudandet", variant: "destructive" });
        return;
      }
      toast({ title: isUpdate ? "Erbjudandet uppdaterat" : "Erbjudande skickat — villkoren stämplade" });
      onSaved();
      onClose();
    } catch {
      toast({ title: "Kunde inte spara erbjudandet", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{isUpdate ? "Ändra erbjudande till kund" : "Skicka erbjudande till kund"}</DialogTitle>
      </DialogHeader>

      <div className="rounded-md border bg-muted/40 p-3 text-sm">
        <div className="font-medium">{match.propertyAddress ?? "(bostad)"}</div>
        {match.propertyCity && <div className="text-xs text-muted-foreground">{match.propertyCity}</div>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="offer-rent">Pris till kund (kr/mån)</Label>
        <Input
          id="offer-rent"
          type="number"
          value={rentOut}
          onChange={(e) => setRentOut(e.target.value)}
          placeholder="T.ex. 24500"
        />
        {match.propertyRentOut != null && (
          <p className="text-xs text-muted-foreground">
            Objektets listpris: {formatKr(match.propertyRentOut)} — villkoret här låses på affären och påverkas inte
            av senare objektändringar.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="offer-start">Inflytt</Label>
          <Input id="offer-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="offer-end">Utflytt</Label>
          <Input
            id="offer-end"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={ongoing}
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox checked={ongoing} onCheckedChange={(v) => setOngoing(v === true)} />
        Löpande — tills vidare
      </label>

      <div className="space-y-1">
        <Label htmlFor="offer-note">Notis till kund — t.ex. vad som ingår i just den här affären</Label>
        <Textarea
          id="offer-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="T.ex. städning varannan vecka ingår"
          rows={2}
        />
      </div>

      <TermsHistory matchId={match.id} type="offer_terms" />

      <DialogFooter>
        <Button variant="ghost" onClick={onClose} disabled={saving}>
          Avbryt
        </Button>
        <Button onClick={save} disabled={saving}>
          {saving ? "Sparar…" : isUpdate ? "Spara ändringar" : "Skicka erbjudande"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

const OUTREACH_OPEN = ["ej_kontaktad", "kontaktad", "i_dialog"];

export function PromiseTermsDialog({
  match,
  request,
  onClose,
  onSaved,
}: {
  match: DealTermsMatch | null;
  request: Request;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  return (
    <Dialog open={!!match} onOpenChange={(o) => !o && !saving && onClose()}>
      {match && (
        <PromiseTermsForm
          key={match.id}
          match={match}
          request={request}
          saving={saving}
          setSaving={setSaving}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}
    </Dialog>
  );
}

function PromiseTermsForm({
  match,
  request,
  saving,
  setSaving,
  onClose,
  onSaved,
}: {
  match: DealTermsMatch;
  request: Request;
  saving: boolean;
  setSaving: (v: boolean) => void;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isUpdate = match.promisedAt != null;
  const [rentIn, setRentIn] = useState(
    (match.promisedRentIn ?? match.kalkyl?.[0]?.rentIn ?? match.propertyRentIn)?.toString() ?? ""
  );
  const [startDate, setStartDate] = useState(match.promisedStartDate ?? match.offerStartDate ?? request.startDate ?? "");
  const [endDate, setEndDate] = useState(match.promisedEndDate ?? match.offerEndDate ?? request.endDate ?? "");
  const [conditions, setConditions] = useState(match.promisedConditions ?? "");

  async function save() {
    const parsed = parseFloat(rentIn.replace(/\s/g, "").replace(",", "."));
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast({ title: "Ange hyra till uthyraren (kr/mån)", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const ok = await patchMatch(match.id, {
        promisedRentIn: parsed,
        promisedStartDate: startDate || null,
        promisedEndDate: endDate || null,
        promisedConditions: conditions.trim() || null,
      });
      if (!ok) {
        toast({ title: "Kunde inte spara villkoren", variant: "destructive" });
        return;
      }
      // Bekräftade villkor avslutar en öppen jaga-runda för paret objekt × förfrågan.
      // Inte kritiskt om det fallerar — löftet är redan stämplat på affären.
      try {
        const res = await fetch(`/api/crm/properties/${match.propertyId}/outreach`);
        if (res.ok) {
          const rounds: { id: string; requestId: string | null; status: string }[] = await res.json();
          const open = rounds.find((r) => r.requestId === request.id && OUTREACH_OPEN.includes(r.status));
          if (open) {
            await fetch(`/api/crm/outreach/${open.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "bekraftad" }),
            });
          }
        }
      } catch (err) {
        console.error("outreach-bekräftelse misslyckades:", err);
      }
      toast({ title: isUpdate ? "Löftet uppdaterat" : "Villkor bekräftade med uthyraren" });
      onSaved();
      onClose();
    } catch {
      toast({ title: "Kunde inte spara villkoren", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{isUpdate ? "Ändra löfte till uthyraren" : "Bekräfta villkor med uthyraren"}</DialogTitle>
      </DialogHeader>

      <div className="rounded-md border bg-muted/40 p-3 text-sm">
        <div className="font-medium">{match.propertyAddress ?? "(bostad)"}</div>
        {match.propertyCity && <div className="text-xs text-muted-foreground">{match.propertyCity}</div>}
        {match.promisedAt && (
          <div className="text-xs text-muted-foreground mt-1">
            Senast bekräftat {match.promisedAt.slice(0, 10)}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="promise-rent">Hyra till uthyraren (kr/mån)</Label>
        <Input
          id="promise-rent"
          type="number"
          value={rentIn}
          onChange={(e) => setRentIn(e.target.value)}
          placeholder="T.ex. 18000"
        />
        {match.propertyRentIn != null && (
          <p className="text-xs text-muted-foreground">
            Objektets listade inpris: {formatKr(match.propertyRentIn)} — det du bekräftar här är vad uthyraren
            faktiskt lovats för den här affären.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="promise-start">Från</Label>
          <Input id="promise-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="promise-end">Till</Label>
          <Input id="promise-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="promise-cond">Villkor (uppsägning, städ, möblering …)</Label>
        <Textarea
          id="promise-cond"
          value={conditions}
          onChange={(e) => setConditions(e.target.value)}
          placeholder="T.ex. 1 mån uppsägning, slutstäd ingår, hyra betalas i förskott"
          rows={3}
        />
      </div>

      <p className="text-sm text-muted-foreground">
        Villkoren stämplas på affären och en öppen jaga-runda för objektet markeras som bekräftad.
      </p>

      <TermsHistory matchId={match.id} type="promised_terms" />

      <DialogFooter>
        <Button variant="ghost" onClick={onClose} disabled={saving}>
          Avbryt
        </Button>
        <Button onClick={save} disabled={saving}>
          {saving ? "Sparar…" : isUpdate ? "Spara ändringar" : "Bekräfta villkor"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
