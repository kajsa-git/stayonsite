// Taket per ort och vecka och vaktens läge, i agentens privata Blob-butik.
import type { Lagring } from "./facebook-uppdrag.ts";
import type { VaktLage } from "./meta-annonser.ts";

const INST = "annonser/installningar.json";
const VAKT = "annonser/vakt.json";

/** Kajsas gräns (META_ADS.md): 1 000 kr per ort och vecka om inget annat är sparat. */
export const STANDARD_KR_PER_ORT_OCH_VECKA = 1000;

export type Installningar = { krPerOrtOchVecka: number; andrad?: string };
export type Vakt = VaktLage & { felDatum?: string; paminnelseVecka?: string };

export async function lasInstallningar(l: Lagring): Promise<Installningar> {
  const v = (await l.las(INST)) as Installningar | null;
  if (v && typeof v.krPerOrtOchVecka === "number" && v.krPerOrtOchVecka > 0) return v;
  const env = Number(process.env.ANNONS_KR_PER_ORT_OCH_VECKA);
  return { krPerOrtOchVecka: env > 0 ? env : STANDARD_KR_PER_ORT_OCH_VECKA };
}

export async function sparaInstallningar(l: Lagring, v: Installningar) {
  await l.spara(INST, v);
}

export async function lasVakt(l: Lagring): Promise<Vakt | null> {
  return (await l.las(VAKT)) as Vakt | null;
}

export async function sparaVakt(l: Lagring, v: Vakt) {
  await l.spara(VAKT, v);
}
