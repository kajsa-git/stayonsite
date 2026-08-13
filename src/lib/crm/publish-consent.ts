// Uthyrarens publiceringsgodkännande — att annonsen FÅR visas online. Bevisfält
// på objektet (at/name/source/ip), skrivs aldrig om när satt. Publicering är
// fortfarande Kajsas manuella steg efter granskning (ägare↔bilder-läxan 2026-07-31).
import { and, eq, isNull } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { db as defaultDb } from "./db";
import * as schema from "./schema";
import { properties } from "./schema";

type DB = LibSQLDatabase<typeof schema>;

export interface ConsentableProperty {
  id: string;
  address: string | null;
  city: string | null;
}

export interface PublishConsentState {
  pending: ConsentableProperty[]; // opublicerade utan godkännande — de vi frågar om
  consented: ConsentableProperty[]; // godkända (eller redan publicerade = implicit ok)
}

// Redan publicerade objekt räknas som godkända (t.ex. via SMS-kampanjen 2026-07-06)
// och frågas aldrig om igen.
export async function loadPublishConsentState(ownerId: string, opts?: { db?: DB }): Promise<PublishConsentState> {
  const db = opts?.db ?? defaultDb;
  const rows = await db
    .select({
      id: properties.id,
      address: properties.address,
      city: properties.city,
      published: properties.published,
      publishConsentAt: properties.publishConsentAt,
    })
    .from(properties)
    .where(eq(properties.ownerId, ownerId));

  const pending: ConsentableProperty[] = [];
  const consented: ConsentableProperty[] = [];
  for (const r of rows) {
    const target = r.publishConsentAt || r.published ? consented : pending;
    target.push({ id: r.id, address: r.address, city: r.city });
  }
  return { pending, consented };
}

// Stämplar godkännandet på ägarens alla väntande objekt. Idempotent — redan
// stämplade rader rörs aldrig (bevis skrivs inte om).
export async function recordPublishConsent(
  args: { ownerId: string; name?: string | null; source: "web" | "sms" | "crm"; ip?: string | null },
  opts?: { db?: DB },
): Promise<ConsentableProperty[]> {
  const db = opts?.db ?? defaultDb;
  const now = new Date().toISOString();
  const stamped = await db
    .update(properties)
    .set({
      publishConsentAt: now,
      publishConsentName: args.name?.trim() || null,
      publishConsentSource: args.source,
      publishConsentIp: args.ip ?? null,
      updatedAt: now,
    })
    .where(
      and(
        eq(properties.ownerId, args.ownerId),
        eq(properties.published, false),
        isNull(properties.publishConsentAt),
      ),
    )
    .returning({ id: properties.id, address: properties.address, city: properties.city });
  return stamped;
}
