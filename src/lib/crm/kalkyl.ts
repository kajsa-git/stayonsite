// Scenariokalkyl för paret förfrågan × boende (lagras på crm_matches.kalkyl).
//
// Endast ANTAGANDEN sparas — hyra in/ut, månader, övriga kostnader per scenario.
// Nyckeltalen (vinst/mån, marginal, totalvinst, nollpunkt) räknas alltid ur
// antagandena vid visning, så en sparad kalkyl kan aldrig glida isär från sina
// egna siffror. Samma matematik som ProfitCalculatorDialog, men per scenario
// och beständig per matchning.

export interface KalkylScenario {
  label: string;
  rentIn: number | null; // vi betalar ägaren, kr/mån
  rentOut: number | null; // kunden betalar oss, kr/mån
  months: number | null; // kontraktslängd
  extraCosts: number | null; // städ/möblering/förbrukning m.m., kr/mån
}

export interface KalkylResult {
  profitPerMonth: number;
  marginPct: number | null; // null när hyra ut saknas (division med 0)
  totalProfit: number | null; // null när månader saknas
  breakEven: number; // lägsta hyra ut innan affären går back
}

export const MAX_SCENARIOS = 6;

// Föreslagna namn när scenarier läggs till: Bas först, sedan spannet runt den.
export const SCENARIO_LABELS = ["Bas", "Försiktig", "Bäst"] as const;

export function computeScenario(s: KalkylScenario): KalkylResult {
  const rentIn = s.rentIn ?? 0;
  const rentOut = s.rentOut ?? 0;
  const extra = s.extraCosts ?? 0;
  const profitPerMonth = rentOut - rentIn - extra;
  return {
    profitPerMonth,
    marginPct: rentOut > 0 ? (profitPerMonth / rentOut) * 100 : null,
    totalProfit: s.months != null && s.months > 0 ? profitPerMonth * s.months : null,
    breakEven: rentIn + extra,
  };
}

// Kontraktslängd ur förfrågan: angiven projekttid vinner, annars datumspannet.
// Löpande avtal utan slutdatum ger null — då visas ingen totalvinst.
export function monthsFromRequest(req: {
  projectDurationMonths?: number | null;
  startDate?: string | null;
  endDate?: string | null;
}): number | null {
  if (req.projectDurationMonths && req.projectDurationMonths > 0) return req.projectDurationMonths;
  if (req.startDate && req.endDate) {
    const start = Date.parse(req.startDate);
    const end = Date.parse(req.endDate);
    if (Number.isFinite(start) && Number.isFinite(end) && end > start) {
      const days = (end - start) / 86_400_000;
      return Math.max(1, Math.round(days / 30.44));
    }
  }
  return null;
}

// Startkalkyl när en match saknar sparad kalkyl: ett Bas-scenario förifyllt
// från boendets hyror och förfrågans längd.
export function defaultKalkyl(
  property: { rentIn?: number | null; rentOut?: number | null },
  req: Parameters<typeof monthsFromRequest>[0]
): KalkylScenario[] {
  return [
    {
      label: SCENARIO_LABELS[0],
      rentIn: property.rentIn ?? null,
      rentOut: property.rentOut ?? null,
      months: monthsFromRequest(req),
      extraCosts: null,
    },
  ];
}

function toFiniteOrNull(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v.replace(/\s/g, "").replace(",", "."));
    if (Number.isFinite(n)) return n;
  }
  return null;
}

// Serversidig tvätt av inkommande kalkyl innan skrivning: okända fält kastas,
// siffror koerceras eller blir null, listan cappas. Tom/ogiltig kalkyl → null
// så kolumnen töms i stället för att lagra skräp.
export function sanitizeKalkyl(value: unknown): KalkylScenario[] | null {
  if (value == null) return null;
  if (!Array.isArray(value)) return null;
  const cleaned = value
    .filter((s): s is Record<string, unknown> => typeof s === "object" && s !== null)
    .slice(0, MAX_SCENARIOS)
    .map((s) => ({
      label: typeof s.label === "string" ? s.label.trim().slice(0, 40) : "",
      rentIn: toFiniteOrNull(s.rentIn),
      rentOut: toFiniteOrNull(s.rentOut),
      months: toFiniteOrNull(s.months),
      extraCosts: toFiniteOrNull(s.extraCosts),
    }))
    // Rader helt utan innehåll (varken namn eller siffror) fyller ingen funktion.
    .filter((s) => s.label !== "" || s.rentIn != null || s.rentOut != null || s.months != null || s.extraCosts != null);
  return cleaned.length ? cleaned : null;
}
