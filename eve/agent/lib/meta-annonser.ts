// Kajsas Meta-annonser via Marketing API, med systemanvändarens nyckel (META_ADS_TOKEN).
// Agenten kan läsa kostnad och leads, pausa, starta och ändra dagsbudget. Den skapar
// aldrig annonser. Kajsas gräns är ett tak per ort och vecka (standard 1 000 kr, se
// META_ADS.md), summerat över alla kampanjer och annonsuppsättningar för orten. Taket
// hålls i koden här, inte av modellen: en start eller höjning som skulle dra en ort över
// taket nekas, och vakten (schedules/annonsvakt.ts) pausar ortens annonser när taket nås.
// Ovanpå det har Meta-kontot ett eget månadstak (5 000 kr) som Meta själv håller.

export const GRAPH = () => `https://graph.facebook.com/${process.env.META_ADS_GRAPH_VERSION || "v27.0"}`;
const NOLLDECIMAL = new Set(["JPY", "KRW", "CLP", "VND", "ISK", "HUF", "TWD", "COP", "IDR", "PYG"]);

export type Fetch = typeof fetch;
export type Konto = { id: string; namn: string; valuta: string; status: number; kontotakKr?: number | null; spenderatMotKontotakKr?: number | null };
export type Objekt = {
  id: string;
  namn: string;
  niva: "kampanj" | "annonsgrupp";
  kampanjId?: string;
  status: string; // ACTIVE, PAUSED, ...
  effektivStatus: string;
  dagsbudgetKr: number | null;
  livstidsbudgetKr: number | null;
  /** Orten annonsuppsättningen riktar sig till (ur målgruppen). Null för kampanjer och okänd ort. */
  ort: string | null;
};
export type Resultat = { id: string; spendKr: number; leads: number };

export function minorFaktor(valuta: string): number {
  return NOLLDECIMAL.has(valuta.toUpperCase()) ? 1 : 100;
}

export class MetaFel extends Error {}

async function anrop(
  metod: "GET" | "POST",
  sokvag: string,
  params: Record<string, string>,
  { token = process.env.META_ADS_TOKEN, fetchImpl = fetch }: { token?: string; fetchImpl?: Fetch } = {},
): Promise<any> {
  if (!token) throw new MetaFel("META_ADS_TOKEN saknas i agentens Vercel-projekt.");
  const url = new URL(`${GRAPH()}/${sokvag.replace(/^\//, "")}`);
  let body: URLSearchParams | undefined;
  if (metod === "GET") for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  else body = new URLSearchParams(params);
  const res = await fetchImpl(url, {
    method: metod,
    headers: { authorization: `Bearer ${token}`, ...(body ? { "content-type": "application/x-www-form-urlencoded" } : {}) },
    body,
    signal: AbortSignal.timeout(20_000),
  });
  const json = (await res.json().catch(() => ({}))) as { error?: { message?: string; error_user_msg?: string } };
  if (!res.ok || json.error) {
    throw new MetaFel(`Meta svarade ${res.status}: ${json.error?.error_user_msg ?? json.error?.message ?? "okänt fel"}`);
  }
  return json;
}

export type MetaOpts = { token?: string; fetchImpl?: Fetch };

export async function annonskonton(o: MetaOpts = {}): Promise<Konto[]> {
  const r = await anrop("GET", "me/adaccounts", { fields: "id,name,currency,account_status,spend_cap,amount_spent", limit: "50" }, o);
  return (r.data ?? []).map((a: any) => ({
    id: a.id,
    namn: a.name,
    valuta: a.currency,
    status: a.account_status,
    kontotakKr: a.spend_cap ? Number(a.spend_cap) / minorFaktor(a.currency) : null,
    spenderatMotKontotakKr: a.amount_spent != null ? Number(a.amount_spent) / minorFaktor(a.currency) : null,
  }));
}

/** Orten ur en annonsuppsättnings målgrupp: första staden, platsen eller regionen. */
export function ortFranMalgrupp(t: any): string | null {
  const g = t?.geo_locations ?? {};
  const namn =
    g.cities?.[0]?.name ?? g.custom_locations?.[0]?.name ?? g.custom_locations?.[0]?.address_string ?? g.regions?.[0]?.name ?? null;
  if (!namn) return null;
  return String(namn).split(",")[0].trim() || null;
}

export const ortNyckel = (ort: string | null) => (ort ? ort.toLocaleLowerCase("sv-SE").trim() : "?");

/** Kontot som agenten styr: META_AD_ACCOUNT_ID, annars det enda aktiva kontot. */
export async function valtKonto(o: MetaOpts = {}, onskat = process.env.META_AD_ACCOUNT_ID): Promise<Konto> {
  const konton = await annonskonton(o);
  if (onskat) {
    const id = onskat.startsWith("act_") ? onskat : `act_${onskat}`;
    const k = konton.find((x) => x.id === id);
    if (!k) throw new MetaFel(`Nyckeln har inte tillgång till annonskontot ${id}.`);
    return k;
  }
  const aktiva = konton.filter((k) => k.status === 1);
  if (aktiva.length === 1) return aktiva[0];
  if (!konton.length) throw new MetaFel("Nyckeln har inte tillgång till något annonskonto. Lägg till kontot på systemanvändaren.");
  throw new MetaFel(
    `Nyckeln ser flera annonskonton (${konton.map((k) => `${k.namn} ${k.id}`).join(", ")}). Sätt META_AD_ACCOUNT_ID i Vercel.`,
  );
}

const kr = (minor: unknown, valuta: string) =>
  minor == null || minor === "" || Number(minor) === 0 ? null : Number(minor) / minorFaktor(valuta);

export async function kampanjerOchGrupper(konto: Konto, o: MetaOpts = {}): Promise<Objekt[]> {
  const falt = "id,name,status,effective_status,daily_budget,lifetime_budget";
  const [k, g] = await Promise.all([
    anrop("GET", `${konto.id}/campaigns`, { fields: falt, limit: "100" }, o),
    anrop("GET", `${konto.id}/adsets`, { fields: `${falt},campaign_id,targeting{geo_locations}`, limit: "200" }, o),
  ]);
  const map = (niva: Objekt["niva"]) => (x: any): Objekt => ({
    id: x.id,
    namn: x.name,
    niva,
    kampanjId: x.campaign_id,
    status: x.status,
    effektivStatus: x.effective_status,
    dagsbudgetKr: kr(x.daily_budget, konto.valuta),
    livstidsbudgetKr: kr(x.lifetime_budget, konto.valuta),
    ort: niva === "annonsgrupp" ? ortFranMalgrupp(x.targeting) : null,
  });
  return [...(k.data ?? []).map(map("kampanj")), ...(g.data ?? []).map(map("annonsgrupp"))];
}

const LEAD = new Set(["lead", "onsite_conversion.lead_grouped", "offsite_conversion.fb_pixel_lead", "leadgen_grouped"]);

export type Period = "today" | "last_7d" | "this_month" | "this_week_mon_today";

export async function resultat(
  konto: Konto,
  period: Period,
  o: MetaOpts = {},
  niva: "campaign" | "adset" = "campaign",
): Promise<{ totaltKr: number; perKampanj: Resultat[] }> {
  const r = await anrop(
    "GET",
    `${konto.id}/insights`,
    { level: niva, date_preset: period, fields: `${niva}_id,spend,actions`, limit: "500" },
    o,
  );
  const perKampanj: Resultat[] = (r.data ?? []).map((x: any) => {
    const leadRader = (x.actions ?? []).filter((a: any) => LEAD.has(a.action_type));
    // Samma lead räknas under flera typer; ta den största i stället för summan.
    const leads = leadRader.reduce((m: number, a: any) => Math.max(m, Number(a.value) || 0), 0);
    return { id: niva === "adset" ? x.adset_id : x.campaign_id, spendKr: Number(x.spend) || 0, leads };
  });
  return { totaltKr: Math.round(perKampanj.reduce((s, x) => s + x.spendKr, 0) * 100) / 100, perKampanj };
}

export async function sattStatus(id: string, status: "ACTIVE" | "PAUSED", o: MetaOpts = {}) {
  await anrop("POST", id, { status }, o);
}

export async function sattDagsbudget(id: string, kronor: number, konto: Konto, o: MetaOpts = {}) {
  await anrop("POST", id, { daily_budget: String(Math.round(kronor * minorFaktor(konto.valuta))) }, o);
}

// ─── Budgetregler per ort och vecka (rena, testade) ─────────────────────────────

const STHLM = "Europe/Stockholm";

/** Dagar kvar av veckan (måndag-söndag) i svensk tid, inklusive i dag. */
export function dagarKvarIVeckan(nu = new Date()): number {
  const dag = new Intl.DateTimeFormat("en-US", { timeZone: STHLM, weekday: "short" }).format(nu);
  return { Mon: 7, Tue: 6, Wed: 5, Thu: 4, Fri: 3, Sat: 2, Sun: 1 }[dag] ?? 7;
}

/** ISO-vecka i svensk tid, t.ex. "2026-W47". */
export function vecka(nu = new Date()): string {
  const [ar, man, dag] = new Intl.DateTimeFormat("sv-SE", { timeZone: STHLM, year: "numeric", month: "2-digit", day: "2-digit" })
    .format(nu)
    .split("-")
    .map(Number);
  const d = new Date(Date.UTC(ar, man - 1, dag));
  const veckodag = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - veckodag);
  const forsta = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const nr = Math.ceil(((d.getTime() - forsta.getTime()) / 86_400_000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(nr).padStart(2, "0")}`;
}

/**
 * Dagsbudget som löper per ort just nu. En annonsuppsättning räknas om den och dess
 * kampanj är aktiva. Har kampanjen egen dagsbudget (kampanjbudget) räknas hela den
 * budgeten mot varje ort som kampanjen når, eftersom Meta kan lägga allt på en ort.
 */
export function lopandePerOrt(objekt: Objekt[]): Map<string, number> {
  const ut = new Map<string, number>();
  const kampanjer = new Map(objekt.filter((o) => o.niva === "kampanj").map((o) => [o.id, o]));
  const lagg = (ort: string, kr: number) => ut.set(ort, (ut.get(ort) ?? 0) + kr);
  const kampanjOrter = new Map<string, Set<string>>();
  for (const g of objekt) {
    if (g.niva !== "annonsgrupp" || g.status !== "ACTIVE") continue;
    const k = g.kampanjId ? kampanjer.get(g.kampanjId) : undefined;
    if (!k || k.status !== "ACTIVE") continue;
    if (k.dagsbudgetKr) {
      if (!kampanjOrter.has(k.id)) kampanjOrter.set(k.id, new Set());
      kampanjOrter.get(k.id)!.add(ortNyckel(g.ort));
    } else if (g.dagsbudgetKr) lagg(ortNyckel(g.ort), g.dagsbudgetKr);
  }
  for (const [id, orter] of kampanjOrter) for (const ort of orter) lagg(ort, kampanjer.get(id)!.dagsbudgetKr!);
  return ut;
}

/** Veckans kostnad per ort, ur kostnad per annonsuppsättning. */
export function kostnadPerOrt(objekt: Objekt[], perGrupp: Resultat[]): Map<string, number> {
  const ort = new Map(objekt.filter((o) => o.niva === "annonsgrupp").map((o) => [o.id, ortNyckel(o.ort)]));
  const ut = new Map<string, number>();
  for (const r of perGrupp) {
    const k = ort.get(r.id) ?? "?";
    ut.set(k, Math.round(((ut.get(k) ?? 0) + r.spendKr) * 100) / 100);
  }
  return ut;
}

/** Objekten som de blir efter en ändring, för att räkna på före och efter. */
export function simulera(objekt: Objekt[], id: string, andring: { status?: string; dagsbudgetKr?: number }): Objekt[] {
  return objekt.map((o) => (o.id === id ? { ...o, ...andring } : o));
}

export type Bedomning = { ok: true; prognos: Record<string, number> } | { ok: false; skal: string };

/**
 * Får ändringen göras? Varje ort vars löpande dagsbudget ökar måste klara taket för
 * veckan: veckans kostnad + löpande dagsbudget × dagar kvar. En ökning på en okänd ort,
 * eller på en annonsuppsättning med livstidsbudget, nekas.
 */
export function bedomAndring(a: {
  takKr: number;
  kostnadPerOrt: Map<string, number>;
  fore: Objekt[];
  efter: Objekt[];
  dagar: number;
  visaOrt?: (nyckel: string) => string;
}): Bedomning {
  const visa = a.visaOrt ?? ((k: string) => k);
  const fore = lopandePerOrt(a.fore);
  const efter = lopandePerOrt(a.efter);
  const nyaLivstid = a.efter.filter((o) => o.status === "ACTIVE" && o.livstidsbudgetKr && a.fore.find((f) => f.id === o.id)?.status !== "ACTIVE");
  if (nyaLivstid.length) return { ok: false, skal: `${nyaLivstid[0].namn} har livstidsbudget. Starta den i Ads Manager.` };
  const prognos: Record<string, number> = {};
  for (const [ort, perDag] of efter) {
    if (perDag <= (fore.get(ort) ?? 0)) continue;
    if (ort === "?") return { ok: false, skal: "Jag kan inte se vilken ort annonsen gäller. Lägg in staden i målgruppen i Ads Manager." };
    const kostnad = a.kostnadPerOrt.get(ort) ?? 0;
    const p = Math.round(kostnad + perDag * a.dagar);
    if (kostnad >= a.takKr) return { ok: false, skal: `${visa(ort)} har redan nått ${a.takKr} kr den här veckan.` };
    if (p > a.takKr) {
      const max = Math.max(0, Math.floor((a.takKr - kostnad) / a.dagar));
      return { ok: false, skal: `${visa(ort)} skulle landa på cirka ${p} kr den här veckan, över ${a.takKr} kr. Högst ${max} kr/dag för ${visa(ort)} ryms.` };
    }
    prognos[visa(ort)] = p;
  }
  return { ok: true, prognos };
}

// ─── Vakten (ren, testad) ────────────────────────────────────────────────────────
export type VaktLage = { vecka: string; varnade: string[]; pausade: { id: string; namn: string; ort: string }[] };

/**
 * Vad vakten ska göra den här timmen. Når en ort taket pausas ortens aktiva
 * annonsuppsättningar. Varning vid 90 % en gång per ort och vecka. Meddelandena är korta.
 */
export function vaktBeslut(a: {
  takKr: number;
  kostnadPerOrt: Map<string, number>;
  aktivaPerOrt: Map<string, { id: string; namn: string }[]>;
  visaOrt: (nyckel: string) => string;
  lage: VaktLage;
}): { pausa: { id: string; namn: string; ort: string }[]; meddelande?: string; lage: VaktLage } {
  const lage: VaktLage = { ...a.lage, varnade: [...a.lage.varnade], pausade: [...a.lage.pausade] };
  const pausa: { id: string; namn: string; ort: string }[] = [];
  const rader: string[] = [];
  for (const [ort, kostnad] of a.kostnadPerOrt) {
    if (ort === "?") continue;
    const aktiva = a.aktivaPerOrt.get(ort) ?? [];
    if (kostnad >= a.takKr) {
      if (!aktiva.length) continue;
      pausa.push(...aktiva.map((g) => ({ ...g, ort })));
      rader.push(`${a.visaOrt(ort)} har nått ${a.takKr} kr den här veckan. Jag har pausat annonserna där.`);
      if (!lage.varnade.includes(ort)) lage.varnade.push(ort);
    } else if (kostnad >= a.takKr * 0.9 && !lage.varnade.includes(ort) && aktiva.length) {
      lage.varnade.push(ort);
      rader.push(`${a.visaOrt(ort)}: ${Math.round(kostnad)} av ${a.takKr} kr den här veckan.`);
    }
  }
  lage.pausade.push(...pausa.filter((p) => !lage.pausade.some((x) => x.id === p.id)));
  return { pausa, lage, meddelande: rader.length ? rader.join("\n") : undefined };
}

/** Namnet på orten som den står i målgruppen, för en nyckel. */
export function ortNamn(objekt: Objekt[]): (nyckel: string) => string {
  const m = new Map<string, string>();
  for (const o of objekt) if (o.ort && !m.has(ortNyckel(o.ort))) m.set(ortNyckel(o.ort), o.ort);
  return (k) => (k === "?" ? "okänd ort" : (m.get(k) ?? k));
}

/** Aktiva annonsuppsättningar (i aktiva kampanjer) per ort. */
export function aktivaPerOrt(objekt: Objekt[]): Map<string, { id: string; namn: string }[]> {
  const aktivaKampanjer = new Set(objekt.filter((o) => o.niva === "kampanj" && o.status === "ACTIVE").map((o) => o.id));
  const ut = new Map<string, { id: string; namn: string }[]>();
  for (const g of objekt) {
    if (g.niva !== "annonsgrupp" || g.status !== "ACTIVE" || !g.kampanjId || !aktivaKampanjer.has(g.kampanjId)) continue;
    const k = ortNyckel(g.ort);
    ut.set(k, [...(ut.get(k) ?? []), { id: g.id, namn: g.namn }]);
  }
  return ut;
}

/** Allt som behövs för att räkna på veckan: objekt, kostnad per ort, löpande budget per ort. */
export async function veckolage(konto: Konto, o: MetaOpts = {}) {
  const [objekt, perGrupp] = await Promise.all([kampanjerOchGrupper(konto, o), resultat(konto, "this_week_mon_today", o, "adset")]);
  return { objekt, kostnad: kostnadPerOrt(objekt, perGrupp.perKampanj), lopande: lopandePerOrt(objekt), dagar: dagarKvarIVeckan(), visa: ortNamn(objekt) };
}
