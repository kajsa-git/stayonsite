"use client";

// Snabb vinstkalkylator — dras upp mitt i ett samtal för att svara på "tjänar
// jag på det här?". Hyra in vs hyra ut minus valfria kostnadsantaganden ger
// månadsvinst, marginal, per 3-mån kontrakt och år. Nollpunkten visar lägsta
// hyra ut innan affären går back = förhandlingsutrymmet. Kostnadsantagandena
// sparas i localStorage (dina standardvärden sitter kvar); hyrorna nollställs
// vid varje öppning eftersom de är per affär. Sparar inget i databasen.
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState } from "react";

const COST_KEY = "crm_calc_costs";
const kr = (n: number) => `${Math.round(n).toLocaleString("sv-SE")} kr`;
const num = (s: string) => {
  const n = parseFloat(s.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

interface Costs {
  cleaning: string;
  furnishing: string;
  utilities: string;
  other: string;
}
const EMPTY_COSTS: Costs = { cleaning: "", furnishing: "", utilities: "", other: "" };

const COST_FIELDS: { key: keyof Costs; label: string; hint: string }[] = [
  { key: "cleaning", label: "Städning", hint: "in-/utflytt, löpande" },
  { key: "furnishing", label: "Möblering", hint: "avskrivning per mån" },
  { key: "utilities", label: "Förbrukning", hint: "el/vatten/wifi om ej inkl." },
  { key: "other", label: "Övrigt", hint: "försäkring, slitage m.m." },
];

export function ProfitCalculatorDialog({
  open,
  onOpenChange,
  initialRentIn,
  initialRentOut,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialRentIn?: number | null;
  initialRentOut?: number | null;
}) {
  const [rentIn, setRentIn] = useState("");
  const [rentOut, setRentOut] = useState("");
  const [costs, setCosts] = useState<Costs>(EMPTY_COSTS);

  // Ladda sparade kostnadsantaganden + förifyll hyror när dialogen öppnas.
  useEffect(() => {
    if (!open) return;
    try {
      const saved = localStorage.getItem(COST_KEY);
      if (saved) setCosts({ ...EMPTY_COSTS, ...JSON.parse(saved) });
    } catch {
      /* privat läge */
    }
    setRentIn(initialRentIn != null ? String(initialRentIn) : "");
    setRentOut(initialRentOut != null ? String(initialRentOut) : "");
  }, [open, initialRentIn, initialRentOut]);

  function setCost(key: keyof Costs, value: string) {
    const next = { ...costs, [key]: value };
    setCosts(next);
    try {
      localStorage.setItem(COST_KEY, JSON.stringify(next));
    } catch {
      /* privat läge */
    }
  }

  const inn = num(rentIn);
  const out = num(rentOut);
  const totalCosts = COST_FIELDS.reduce((s, f) => s + num(costs[f.key]), 0);
  const profit = out - inn - totalCosts;
  const margin = out > 0 ? (profit / out) * 100 : 0;
  const breakEven = inn + totalCosts; // lägsta hyra ut innan förlust
  const hasInput = out > 0 || inn > 0;

  const profitCls = profit > 0 ? "text-green-700" : profit < 0 ? "text-rose-600" : "text-nordic-700";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Vinstkalkylator</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Hyror */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Hyra ut / mån" hint="kunden betalar" value={rentOut} onChange={setRentOut} accent />
            <Field label="Hyra in / mån" hint="du betalar ägaren" value={rentIn} onChange={setRentIn} />
          </div>

          {/* Kostnadsantaganden */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
              Kostnader (valfritt — sparas)
            </p>
            <div className="grid grid-cols-2 gap-2">
              {COST_FIELDS.map((f) => (
                <Field key={f.key} label={f.label} hint={f.hint} value={costs[f.key]} onChange={(v) => setCost(f.key, v)} small />
              ))}
            </div>
          </div>

          {/* Resultat */}
          <div className="rounded-xl border bg-nordic-50 p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Vinst / mån</span>
              <span className={`text-2xl font-bold tabular-nums ${profitCls}`}>{hasInput ? kr(profit) : "–"}</span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xs text-muted-foreground">Marginal</span>
              <span className={`text-sm font-semibold tabular-nums ${profitCls}`}>
                {hasInput && out > 0 ? `${margin.toFixed(0)} %` : "–"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-nordic-200 text-center">
              <div>
                <div className="text-[11px] text-muted-foreground">Per 3-mån kontrakt</div>
                <div className={`text-sm font-semibold tabular-nums ${profitCls}`}>{hasInput ? kr(profit * 3) : "–"}</div>
              </div>
              <div>
                <div className="text-[11px] text-muted-foreground">Per år</div>
                <div className={`text-sm font-semibold tabular-nums ${profitCls}`}>{hasInput ? kr(profit * 12) : "–"}</div>
              </div>
            </div>
          </div>

          {/* Nollpunkt = förhandlingsutrymme */}
          {hasInput && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2.5 text-sm">
              <span className="text-amber-900">
                Nollpunkt: <b className="tabular-nums">{kr(breakEven)}</b> / mån.
              </span>
              <span className="text-amber-800/90">
                {" "}Under det går affären back — så lågt kan du gå i en förhandling.
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  accent,
  small,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  accent?: boolean;
  small?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-medium text-nordic-700">{label}</span>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className={`mt-0.5 w-full border rounded-md pl-2 pr-7 py-1.5 tabular-nums focus:outline-none focus:ring-1 ${
            accent ? "text-base font-semibold focus:ring-green-400" : small ? "text-sm focus:ring-primary-400" : "text-base focus:ring-primary-400"
          }`}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground pointer-events-none">kr</span>
      </div>
      {hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}
    </label>
  );
}
