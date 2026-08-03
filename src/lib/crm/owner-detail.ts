// Uthyrarkortet: ägaren + kompakt objektlista i ett svar (Min dag-dialogen).
// Delas av /api/crm/owners/[id] GET och MCP-verktyget crm_get_owner.
import { eq } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { db as defaultDb } from "./db";
import * as schema from "./schema";
import { owners, properties, type Owner } from "./schema";

type DB = LibSQLDatabase<typeof schema>;

export interface OwnerPropertySummary {
  id: string;
  address: string | null;
  city: string | null;
  status: string | null;
  published: boolean | null;
  prospektPublished: boolean | null;
  slug: string | null;
  bedrooms: number | null;
  beds: number | null;
  rentIn: number | null;
  rentOut: number | null;
}

export type OwnerDetail = Owner & { properties: OwnerPropertySummary[] };

export async function getOwnerDetail(id: string, opts?: { db?: DB }): Promise<OwnerDetail | null> {
  const db = opts?.db ?? defaultDb;

  const [owner] = await db.select().from(owners).where(eq(owners.id, id));
  if (!owner) return null;

  const props = await db
    .select({
      id: properties.id,
      address: properties.address,
      city: properties.city,
      status: properties.status,
      published: properties.published,
      prospektPublished: properties.prospektPublished,
      slug: properties.slug,
      bedrooms: properties.bedrooms,
      beds: properties.beds,
      rentIn: properties.rentIn,
      rentOut: properties.rentOut,
    })
    .from(properties)
    .where(eq(properties.ownerId, id));
  return { ...owner, properties: props };
}
