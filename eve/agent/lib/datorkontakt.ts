// Senaste kontakten från Facebook-datorn på Kajsas Mac, och larmet när den tystnar.
import type { Lagring } from "./facebook-uppdrag.ts";

const KONTAKT = "facebook-datorn/kontakt.json";
export type Kontakt = {
  senast: string;
  version?: string;
  larmat?: boolean;
  krasch?: { version: string; tid: string };
  uppdateringsfel?: { tid: string; orsak: string };
};

const ANTECKNA_VAR_MINUT = 10;

/** Antecknar att datorn hörde av sig. Skriver högst var 10:e minut, utom när ett larm ska nollställas. */
export async function antecknaKontakt(l: Lagring, version: string | undefined, nu = new Date()): Promise<{ varLarmad: boolean }> {
  const k = (await l.las(KONTAKT)) as Kontakt | null;
  const gammal = !k || nu.getTime() - new Date(k.senast).getTime() > ANTECKNA_VAR_MINUT * 60_000;
  if (gammal || k?.larmat || (version && k?.version !== version)) {
    await l.spara(KONTAKT, { ...k, senast: nu.toISOString(), version: version ?? k?.version, larmat: false });
  }
  return { varLarmad: Boolean(k?.larmat) };
}

export async function lasKontakt(l: Lagring): Promise<Kontakt | null> {
  return (await l.las(KONTAKT)) as Kontakt | null;
}

export async function sparaKontakt(l: Lagring, k: Kontakt) {
  await l.spara(KONTAKT, k);
}

/** Versionen ur datorns user-agent, "stayonsite-facebook-agent/<commit>". */
export function versionUrHeader(ua: string | null): string | undefined {
  const m = /stayonsite-facebook-agent\/([A-Za-z0-9._-]{1,40})/.exec(ua ?? "");
  return m?.[1];
}

/** Ska vakten larma nu? Dagtid 10-20 i Sverige, tyst i minst tre timmar, en gång per tystnad. */
export function borLarma(k: Kontakt | null, nu = new Date()): boolean {
  if (!k || k.larmat) return false;
  const timme = Number(new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm", hour: "2-digit", hour12: false }).format(nu));
  if (timme < 10 || timme >= 20) return false;
  return nu.getTime() - new Date(k.senast).getTime() >= 3 * 60 * 60_000;
}

export function tidSverige(iso: string): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm", weekday: "long", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}
