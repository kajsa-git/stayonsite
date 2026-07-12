"use client";

// Scenariokalkyl på ett förslag (match) — "vad tjänar vi på det här boendet i
// det här caset?". Utfällbar per förslagsrad: scenarier som kolumner (hyra ut,
// hyra in, månader, övriga kostnader) med live-räknade nyckeltal under. Bara
// antagandena sparas (crm_matches.kalkyl); tas alla scenarier bort och sparas
// töms kalkylen. Ihopfälld visas vinstspannet som snabb signal.
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import {
  computeScenario,
  defaultKalkyl,
  SCENARIO_LABELS,
  type KalkylScenario,
} from "@/lib/crm/kalkyl";
import { Calculator, ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import { useState } from "react";

// Fler än så här får inte plats som kolumner i förslagskortet.
const UI_MAX_SCENARIOS = 4;

const fmt = (n: number) => Math.round(n).toLocaleString("sv-SE");
const signed = (n: number) => (n > 0 ? "+" : "") + fmt(n);
const toneCls = (n: number) => (n > 0 ? "text-green-700" : n < 0 ? "text-rose-600" : "text-nordic-700");

const num = (s: string): number | null => {
  const t = s.replace(/\s/g, "").replace(",", ".");
  if (!t) return null;
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : null;
};

// Inmatningen hålls som strängar (delskrivna tal som "12 0" ska inte studsa);
// parsas först vid beräkning/sparning.
interface Draft {
  label: string;
  rentIn: string;
  rentOut: string;
  months: string;
  extraCosts: string;
}

const toDraft = (s: KalkylScenario): Draft => ({
  label: s.label,
  rentIn: s.rentIn != null ? String(s.rentIn) : "",
  rentOut: s.rentOut != null ? String(s.rentOut) : "",
  months: s.months != null ? String(s.months) : "",
  extraCosts: s.extraCosts != null ? String(s.extraCosts) : "",
});

const fromDraft = (d: Draft): KalkylScenario => ({
  label: d.label.trim(),
  rentIn: num(d.rentIn),
  rentOut: num(d.rentOut),
  months: num(d.months),
  extraCosts: num(d.extraCosts),
});

interface RequestLike {
  budgetMax: number | null;
  projectDurationMonths: number | null;
  startDate: string | null;
  endDate: string | null;
}

export function MatchKalkyl({
  matchId,
  kalkyl,
  propertyRentIn,
  propertyRentOut,
  request,
  onSaved,
}: {
  matchId: string;
  kalkyl: KalkylScenario[] | null;
  propertyRentIn: number | null;
  propertyRentOut: number | null;
  request: RequestLike;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>(() => initDrafts(kalkyl));

  function initDrafts(saved: KalkylScenario[] | null): Draft[] {
    return (
      saved?.length
        ? saved
        : defaultKalkyl({ rentIn: propertyRentIn, rentOut: propertyRentOut }, request)
    ).map(toDraft);
  }

  function edit(i: number, key: keyof Draft, value: string) {
    setDrafts((ds) => ds.map((d, j) => (j === i ? { ...d, [key]: value } : d)));
    setDirty(true);
  }

  function addScenario() {
    setDrafts((ds) => {
      // Kopiera föregående scenario — man justerar oftast en siffra i taget.
      const prev = ds[ds.length - 1];
      const label = SCENARIO_LABELS[ds.length] ?? `Scenario ${ds.length + 1}`;
      return [...ds, prev ? { ...prev, label } : { label, rentIn: "", rentOut: "", months: "", extraCosts: "" }];
    });
    setDirty(true);
  }

  function removeScenario(i: number) {
    setDrafts((ds) => ds.filter((_, j) => j !== i));
    setDirty(true);
  }

  async function save() {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/crm/matches/${matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kalkyl: drafts.map(fromDraft) }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const row = await res.json();
      const savedKalkyl: KalkylScenario[] | null = row.kalkyl ?? null;
      setDrafts(initDrafts(savedKalkyl));
      setDirty(false);
      onSaved();
      toast({ title: savedKalkyl ? "Kalkyl sparad" : "Kalkyl rensad" });
    } catch {
      toast({ title: "Kunde inte spara kalkylen", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  // Ihopfälld sammanfattning räknas på det SPARADE — utkast syns först efter Spara.
  const savedProfits = (kalkyl ?? []).map((s) => computeScenario(s).profitPerMonth);
  const summary = savedProfits.length
    ? {
        text:
          savedProfits.length === 1
            ? `${signed(savedProfits[0])} kr/mån${
                computeScenario(kalkyl![0]).marginPct != null
                  ? ` · ${computeScenario(kalkyl![0]).marginPct!.toFixed(0)} %`
                  : ""
              }`
            : `${signed(Math.min(...savedProfits))} – ${signed(Math.max(...savedProfits))} kr/mån`,
        cls:
          Math.min(...savedProfits) > 0
            ? "text-green-700"
            : Math.max(...savedProfits) < 0
              ? "text-rose-600"
              : "text-amber-700",
      }
    : null;

  const results = drafts.map((d) => computeScenario(fromDraft(d)));
  const budgetMax = request.budgetMax;

  return (
    <div className="mt-2 pt-2 border-t">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-1 text-xs font-medium text-nordic-700 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded"
        >
          <Calculator className="h-3.5 w-3.5" />
          Kalkyl
          {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
        {!open && summary && (
          <span className={`text-[11px] font-semibold tabular-nums ${summary.cls}`}>{summary.text}</span>
        )}
        {!open && !summary && <span className="text-[11px] text-muted-foreground">ej gjord</span>}
      </div>

      {open && (
        <div className="mt-2 space-y-2">
          {budgetMax != null && (
            <p className="text-[11px] text-muted-foreground">
              Kundens budget: ≤ <span className="tabular-nums">{fmt(budgetMax)}</span> kr/mån
            </p>
          )}

          {drafts.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              Inga scenarier — spara för att rensa kalkylen, eller lägg till ett nytt.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <div
                className="grid gap-x-2 gap-y-1 items-center"
                style={{ gridTemplateColumns: `4.5rem repeat(${drafts.length}, minmax(5.5rem, 1fr))` }}
              >
                {/* Scenarionamn + ta bort */}
                <span />
                {drafts.map((d, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <input
                      type="text"
                      value={d.label}
                      onChange={(e) => edit(i, "label", e.target.value)}
                      placeholder={`Scenario ${i + 1}`}
                      className="w-full min-w-0 border rounded px-1.5 py-0.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary-400"
                    />
                    <button
                      type="button"
                      onClick={() => removeScenario(i)}
                      className="text-muted-foreground hover:text-rose-600 shrink-0"
                      title="Ta bort scenario"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                <RowLabel>Hyra ut/mån</RowLabel>
                {drafts.map((d, i) => (
                  <div key={i}>
                    <NumInput value={d.rentOut} onChange={(v) => edit(i, "rentOut", v)} accent />
                    {budgetMax != null && (num(d.rentOut) ?? 0) > budgetMax && (
                      <span className="text-[10px] text-amber-700">över budget</span>
                    )}
                  </div>
                ))}

                <RowLabel>Hyra in/mån</RowLabel>
                {drafts.map((d, i) => (
                  <NumInput key={i} value={d.rentIn} onChange={(v) => edit(i, "rentIn", v)} />
                ))}

                <RowLabel>Månader</RowLabel>
                {drafts.map((d, i) => (
                  <NumInput key={i} value={d.months} onChange={(v) => edit(i, "months", v)} />
                ))}

                <RowLabel>Övrigt/mån</RowLabel>
                {drafts.map((d, i) => (
                  <NumInput key={i} value={d.extraCosts} onChange={(v) => edit(i, "extraCosts", v)} />
                ))}

                <div className="col-span-full border-t my-0.5" />

                <RowLabel>Vinst/mån</RowLabel>
                {results.map((r, i) => (
                  <ResultCell key={i} cls={`font-bold ${toneCls(r.profitPerMonth)}`}>
                    {signed(r.profitPerMonth)}
                  </ResultCell>
                ))}

                <RowLabel>Marginal</RowLabel>
                {results.map((r, i) => (
                  <ResultCell key={i} cls={toneCls(r.profitPerMonth)}>
                    {r.marginPct != null ? `${r.marginPct.toFixed(0)} %` : "–"}
                  </ResultCell>
                ))}

                <RowLabel>Totalt</RowLabel>
                {results.map((r, i) => (
                  <ResultCell key={i} cls={toneCls(r.totalProfit ?? 0)}>
                    {r.totalProfit != null ? signed(r.totalProfit) : "–"}
                  </ResultCell>
                ))}

                <RowLabel title="Lägsta hyra ut innan affären går back">Nollpunkt</RowLabel>
                {results.map((r, i) => (
                  <ResultCell key={i} cls="text-nordic-700">
                    {fmt(r.breakEven)}
                  </ResultCell>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            {drafts.length < UI_MAX_SCENARIOS && (
              <button
                type="button"
                onClick={addScenario}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-3 w-3" /> Scenario
              </button>
            )}
            <Button size="sm" className="ml-auto h-7 text-xs" onClick={save} disabled={!dirty || saving}>
              {saving ? "Sparar…" : "Spara kalkyl"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Snabbval i acceptera-dialogen: klicka ett scenario → dess hyra ut blir månadsvärdet.
export function KalkylScenarioChips({
  kalkyl,
  onPick,
}: {
  kalkyl: KalkylScenario[] | null | undefined;
  onPick: (rentOut: number) => void;
}) {
  const withPrice = (kalkyl ?? []).filter((s) => s.rentOut != null);
  if (!withPrice.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      <span className="text-muted-foreground">Från kalkylen:</span>
      {withPrice.map((s, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onPick(s.rentOut!)}
          className="rounded-full border border-input bg-white px-2 py-0.5 tabular-nums hover:bg-muted"
          title={`Vinst ${signed(computeScenario(s).profitPerMonth)} kr/mån`}
        >
          {s.label || `Scenario ${i + 1}`} · {fmt(s.rentOut!)} kr
        </button>
      ))}
    </div>
  );
}

function RowLabel({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <span className="text-[11px] text-muted-foreground" title={title}>
      {children}
    </span>
  );
}

function ResultCell({ children, cls }: { children: React.ReactNode; cls: string }) {
  return <span className={`text-xs text-right tabular-nums pr-5 ${cls}`}>{children}</span>;
}

function NumInput({
  value,
  onChange,
  accent,
}: {
  value: string;
  onChange: (v: string) => void;
  accent?: boolean;
}) {
  return (
    <input
      type="text"
      inputMode="numeric"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="0"
      className={`w-full min-w-0 border rounded px-1.5 py-0.5 text-xs text-right tabular-nums focus:outline-none focus:ring-1 ${
        accent ? "font-semibold focus:ring-green-400" : "focus:ring-primary-400"
      }`}
    />
  );
}
