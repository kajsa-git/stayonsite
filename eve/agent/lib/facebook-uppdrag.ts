// Uppdrag till Facebook-datorn på Kajsas Mac (söka grupper, gå med, svara på
// medlemsfrågor) och de grupper den har gått med i. Sparas som en fil per post i
// agentens privata Blob-butik, i en egen mapp bredvid minnet. Datorn hämtar öppna
// uppdrag med GET /mac/uppdrag och lämnar resultat med POST /mac/facebook.
import { createHash, randomUUID } from "node:crypto";

export type GruppKandidat = { namn: string; url: string };
export type Svar = { fraga: string; svar: string };

type Bas = { id: string; skapad: string; ort: string };
export type Uppdrag =
  | (Bas & { typ: "sok_grupper"; sokord: string[] })
  | (Bas & { typ: "ga_med"; grupper: GruppKandidat[] })
  | (Bas & { typ: "svara"; grupp: GruppKandidat; svar: Svar[]; godkannRegler: boolean });
export type NyttUppdrag = Uppdrag extends infer U ? (U extends Uppdrag ? Omit<U, "id" | "skapad"> : never) : never;

export type NyGrupp = { namn: string; url: string; ort: string; status: "medlem" | "vantar"; datum: string };

export interface Lagring {
  spara(sokvag: string, data: unknown): Promise<void>;
  las(sokvag: string): Promise<unknown | null>;
  lista(prefix: string): Promise<string[]>;
  taBort(sokvag: string): Promise<void>;
}

const UPPDRAG = "facebook-datorn/uppdrag/";
const GRUPPER = "facebook-datorn/grupper/";
const ID = /^[a-f0-9]{12}$/;

export function blobLagring(): Lagring {
  return {
    async spara(sokvag, data) {
      const { put } = await import("@vercel/blob");
      await put(sokvag, JSON.stringify(data), {
        access: "private",
        allowOverwrite: true,
        addRandomSuffix: false,
        contentType: "application/json",
      });
    },
    async las(sokvag) {
      const { get } = await import("@vercel/blob");
      const res = await get(sokvag, { access: "private", useCache: false });
      if (!res?.stream) return null;
      return JSON.parse(await new Response(res.stream).text());
    },
    async lista(prefix) {
      const { list } = await import("@vercel/blob");
      const ut: string[] = [];
      let cursor: string | undefined;
      do {
        const r = await list({ prefix, cursor, limit: 1000 });
        ut.push(...r.blobs.map((b) => b.pathname));
        cursor = r.hasMore ? r.cursor : undefined;
      } while (cursor);
      return ut;
    },
    async taBort(sokvag) {
      const { del } = await import("@vercel/blob");
      await del(sokvag);
    },
  };
}

/** För tester. */
export function minnesLagring(): Lagring & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    async spara(s, d) {
      data.set(s, JSON.stringify(d));
    },
    async las(s) {
      const v = data.get(s);
      return v === undefined ? null : JSON.parse(v);
    },
    async lista(p) {
      return [...data.keys()].filter((k) => k.startsWith(p));
    },
    async taBort(s) {
      data.delete(s);
    },
  };
}

/** Kanonisk grupplänk, eller null om det inte är en Facebook-grupp. */
export function gruppUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (!/^(www\.|m\.|web\.)?facebook\.com$/.test(u.hostname)) return null;
    const m = /^\/groups\/([A-Za-z0-9._-]{2,100})\/?/.exec(u.pathname);
    return m ? `https://www.facebook.com/groups/${m[1]}` : null;
  } catch {
    return null;
  }
}

export function standardSokord(ort: string): string[] {
  const o = ort.trim();
  return [`bostad ${o}`, `uthyrning ${o}`, `lägenheter ${o}`, `${o} köp och sälj`];
}

export async function skapaUppdrag(l: Lagring, nytt: NyttUppdrag, nu = new Date()): Promise<Uppdrag> {
  const uppdrag = { ...nytt, id: randomUUID().replace(/-/g, "").slice(0, 12), skapad: nu.toISOString() } as Uppdrag;
  await l.spara(`${UPPDRAG}${uppdrag.id}.json`, uppdrag);
  return uppdrag;
}

export async function oppnaUppdrag(l: Lagring): Promise<Uppdrag[]> {
  const sokvagar = (await l.lista(UPPDRAG)).slice(0, 50);
  const alla = await Promise.all(sokvagar.map((s) => l.las(s)));
  return (alla.filter(Boolean) as Uppdrag[]).sort((a, b) => a.skapad.localeCompare(b.skapad)).slice(0, 20);
}

export async function hamtaUppdrag(l: Lagring, id: string): Promise<Uppdrag | null> {
  if (!ID.test(id)) return null;
  return (await l.las(`${UPPDRAG}${id}.json`)) as Uppdrag | null;
}

export async function avslutaUppdrag(l: Lagring, id: string): Promise<void> {
  if (ID.test(id)) await l.taBort(`${UPPDRAG}${id}.json`);
}

export async function sparaGrupp(l: Lagring, g: NyGrupp): Promise<void> {
  const nyckel = createHash("sha256").update(g.url).digest("hex").slice(0, 16);
  await l.spara(`${GRUPPER}${nyckel}.json`, g);
}

export async function nyaGrupper(l: Lagring): Promise<NyGrupp[]> {
  const sokvagar = (await l.lista(GRUPPER)).slice(0, 300);
  return (await Promise.all(sokvagar.map((s) => l.las(s)))).filter(Boolean) as NyGrupp[];
}
