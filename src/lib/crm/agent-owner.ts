// Ny uthyrare från agenten (t.ex. ett svar på ett Facebook-inlägg). Samma fält som när
// Kajsa lägger upp en uthyrare i CRM:et, plus spärrar mot dubbletter: finns telefon-
// numret eller mejladressen redan skapas ingen ny uthyrare, och ett namn som redan
// finns kräver createAnyway. Sökorter skrivs som raden "Sökorter: ..." så att
// matchningen (owner-search-leads.ts) hittar uthyraren.
import { eq, or, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db as defaultDb } from "./db";
import type { DB } from "./mcp/shape";
import { normalizePhoneForStorage } from "./phone-links";
import { owners } from "./schema";
import { indexOwner as defaultIndexOwner } from "./search-index";

export interface AgentOwnerInput {
  name: string;
  phone?: string;
  email?: string;
  ownerType?: "privatperson" | "foretag";
  source: string;
  offer?: string;
  searchCities?: string[];
  followUpDate?: string;
  followUpReason?: string;
  createAnyway?: boolean;
}

type OwnerHit = { id: string; name: string; phone: string | null; email: string | null };

export type AgentOwnerResult =
  | { status: "created"; owner: OwnerHit }
  | { status: "exists"; owner: OwnerHit; matchedOn: "phone" | "email" }
  | { status: "possible_duplicates"; candidates: OwnerHit[] }
  | { status: "invalid"; message: string };

const YMD = /^\d{4}-\d{2}-\d{2}$/;

export function buildOwnerNotes(input: Pick<AgentOwnerInput, "source" | "offer" | "searchCities">, today: string): string {
  const rows = [`Källa: ${input.source.trim()} (via agenten ${today})`];
  if (input.offer?.trim()) rows.push(`Erbjuder: ${input.offer.trim()}`);
  const cities = [...new Set((input.searchCities ?? []).map((c) => c.trim()).filter(Boolean))];
  if (cities.length) rows.push(`Sökorter: ${cities.join(", ")}`);
  return rows.join("\n");
}

export async function createAgentOwner(
  input: AgentOwnerInput,
  deps: { db?: DB; indexOwner?: (id: string) => Promise<unknown>; now?: () => Date } = {},
): Promise<AgentOwnerResult> {
  const db = deps.db ?? defaultDb;
  const name = input.name.trim();
  if (!name) return { status: "invalid", message: "Namn krävs." };
  if (!input.source?.trim()) return { status: "invalid", message: "Ange källan, t.ex. 'Facebook: Lägenheter i Gävle'." };
  if (input.followUpDate && !YMD.test(input.followUpDate)) return { status: "invalid", message: "followUpDate ska vara YYYY-MM-DD." };

  const phone = normalizePhoneForStorage(input.phone);
  const email = input.email?.trim().toLowerCase() || null;
  const pick = { id: owners.id, name: owners.name, phone: owners.phone, email: owners.email };

  if (phone || email) {
    const conditions = [];
    if (phone) conditions.push(eq(owners.phone, phone));
    if (email) conditions.push(sql`lower(${owners.email}) = ${email}`);
    const [hit] = await db.select(pick).from(owners).where(or(...conditions)).limit(1);
    if (hit) return { status: "exists", owner: hit, matchedOn: phone && hit.phone === phone ? "phone" : "email" };
  }
  if (!input.createAnyway) {
    const candidates = await db.select(pick).from(owners).where(sql`lower(${owners.name}) = ${name.toLowerCase()}`).limit(5);
    if (candidates.length) return { status: "possible_duplicates", candidates };
  }

  const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm" }).format((deps.now ?? (() => new Date()))());
  const id = nanoid();
  const [row] = await db
    .insert(owners)
    .values({
      id,
      ownerType: input.ownerType ?? "privatperson",
      ownerArrangement: "direkt",
      name,
      phone,
      email,
      followUpDate: input.followUpDate ?? null,
      followUpReason: input.followUpDate ? (input.followUpReason?.trim() || "Följ upp svar från agenten") : null,
      notes: buildOwnerNotes(input, today),
    })
    .returning(pick);
  await (deps.indexOwner ?? defaultIndexOwner)(id).catch((e) => console.error("search-index owner:", e));
  return { status: "created", owner: row };
}
