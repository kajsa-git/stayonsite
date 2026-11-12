// POST { criteria, offset } → söker i Qasas index efter bostäder som matchar ett uppdrag.
// SKRIVER INGET — import sker via /api/crm/import-listing när Kajsa väljer en träff.
// Svaret markerar träffar som redan finns som objekt i CRM:et (via Qasa-länken i links[])
// och anger `widerCity` när orten är en tätort inom en kommun vi har en stadssida för.
import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { detectListing } from "@/lib/crm/import";
import { QasaUnknownAreaError, type QasaSearchCriteria } from "@/lib/crm/import/qasa-search";
import { searchQasa } from "@/lib/crm/import/qasa-search-fetch";
import { properties } from "@/lib/crm/schema";
import { getCityForLocality } from "@/data/cities";
import { like } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v > 0 ? Math.round(v) : null);
const date = (v: unknown) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);

function parseCriteria(raw: unknown): QasaSearchCriteria | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const city = typeof r.city === "string" ? r.city.trim().slice(0, 80) : "";
  if (!city) return null;
  return {
    city,
    persons: num(r.persons),
    minBedrooms: num(r.minBedrooms),
    moveInLatest: date(r.moveInLatest),
    availableUntil: date(r.availableUntil),
    maxRent: num(r.maxRent),
    furnished: r.furnished === true,
    privateOnly: r.privateOnly !== false,
  };
}

export async function POST(req: NextRequest) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const criteria = parseCriteria(body.criteria);
  if (!criteria) return NextResponse.json({ error: "Ange en ort att söka i" }, { status: 400 });
  const offset = Math.min(Math.max(0, num(body.offset) ?? 0), 600);

  try {
    const result = await searchQasa(criteria, offset);

    // Qasa-id → befintligt objekt. Best-effort: ett fel här får inte stoppa sökningen.
    const inCrm: Record<string, string> = {};
    try {
      const rows = await db
        .select({ id: properties.id, links: properties.links })
        .from(properties)
        .where(like(properties.links, "%qasa.%"));
      for (const row of rows) {
        for (const link of row.links ?? []) {
          const d = detectListing(link);
          if (d?.source === "qasa") inCrm[d.id] = row.id;
        }
      }
    } catch (e) {
      console.error("qasa-search inCrm:", e);
    }

    // Tätort inom en större kommun (Figeholm → Oskarshamn): låt UI:t erbjuda en vidgad sökning.
    const parent = getCityForLocality(criteria.city)?.name ?? null;
    const widerCity = parent && parent.trim().toLowerCase() !== criteria.city.toLowerCase() ? parent : null;

    return NextResponse.json({ ...result, offset, inCrm, widerCity });
  } catch (e) {
    if (e instanceof QasaUnknownAreaError) return NextResponse.json({ error: e.message }, { status: 400 });
    console.error("qasa-search:", e);
    return NextResponse.json({ error: "Qasa-sökningen misslyckades — försök igen om en stund." }, { status: 502 });
  }
}
