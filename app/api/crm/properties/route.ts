import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { indexOwner, indexProperty } from "@/lib/crm/search-index";
import { isValidPropertyStatus, mergeOwnerIntoProperty, normalizePropertyWriteBody } from "@/lib/crm/owners";
import { owners, properties, propertyImages } from "@/lib/crm/schema";
import { R2_BUCKET, r2 } from "@/lib/crm/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { and, asc, desc, eq, inArray, like, or, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import { shouldValidatePublication, validatePublicationSeo } from "@/lib/crm/publication-seo";

export async function GET(req: NextRequest) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q");
  const ownerId = req.nextUrl.searchParams.get("ownerId");
  let query = db
    .select({ property: properties, owner: owners })
    .from(properties)
    .leftJoin(owners, eq(properties.ownerId, owners.id));

  const conditions = [];
  if (ownerId) conditions.push(eq(properties.ownerId, ownerId));
  if (q) {
    const pat = `%${q}%`;
    conditions.push(
      or(
        like(properties.address, pat),
        like(properties.postalCode, pat),
        like(properties.city, pat),
        like(properties.notes, pat),
        like(owners.name, pat),
        like(owners.phone, pat),
        like(owners.email, pat),
        like(owners.contactPerson, pat)
      )
    );
  }
  if (conditions.length) {
    query = query.where(and(...conditions)) as typeof query;
  }

  const rows = await query;
  const merged = rows.map(mergeOwnerIntoProperty);

  // Bifoga en liten presignerad thumbnail (första bilden) per objekt för listvyn.
  const ids = merged.map((p) => p.id);
  const firstKeyByProp = new Map<string, string>();
  if (ids.length) {
    const imgs = await db
      .select({ propertyId: propertyImages.propertyId, key: propertyImages.key })
      .from(propertyImages)
      .where(inArray(propertyImages.propertyId, ids))
      .orderBy(desc(propertyImages.isPrimary), asc(propertyImages.sortOrder), asc(propertyImages.createdAt));
    for (const im of imgs) if (!firstKeyByProp.has(im.propertyId)) firstKeyByProp.set(im.propertyId, im.key);
  }
  const withThumbs = await Promise.all(
    merged.map(async (p) => {
      const key = firstKeyByProp.get(p.id);
      return {
        ...p,
        thumbnailUrl: key
          ? await getSignedUrl(r2, new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }), { expiresIn: 3600 })
          : null,
      };
    })
  );
  return NextResponse.json(withThumbs);
}

export async function POST(req: NextRequest) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (body.status != null && !isValidPropertyStatus(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // Dubblettspärr: samma adress + ort (case-/whitespace-okänsligt) som ett befintligt
  // objekt avvisas med 409 + det befintliga, så klienten kan visa "Öppna befintligt /
  // Spara ändå". forceDuplicate=true kör över (och filtreras bort av stripForPropertyWrite).
  const dupAddress = String(body.address ?? "").trim().toLowerCase();
  if (dupAddress && body.forceDuplicate !== true) {
    const dupCity = String(body.city ?? "").trim().toLowerCase();
    const candidates = await db
      .select({ id: properties.id, address: properties.address, city: properties.city })
      .from(properties)
      .where(sql`lower(trim(${properties.address})) = ${dupAddress}`);
    const existing = candidates.find((c) => String(c.city ?? "").trim().toLowerCase() === dupCity);
    if (existing) {
      return NextResponse.json(
        { error: `Objektet verkar redan finnas: ${existing.address}${existing.city ? `, ${existing.city}` : ""}`, existing },
        { status: 409 },
      );
    }
  }

  const id = nanoid();
  const values = await normalizePropertyWriteBody(body);
  const candidate = {
    id,
    published: false,
    status: "available",
    publicName: null,
    slug: null,
    publicDescription: null,
    city: null,
    postalCode: null,
    squareMeters: null,
    bedrooms: null,
    beds: null,
    ...values,
  };
  if (shouldValidatePublication(undefined, body, candidate)) {
    const problem = await validatePublicationSeo(candidate);
    if (problem) return NextResponse.json({ error: problem }, { status: 422 });
  }
  const [row] = await db.insert(properties).values({ id, ...values }).returning();
  await indexProperty(id).catch((e) => console.error("search-index property:", e));
  if (row?.ownerId) await indexOwner(row.ownerId).catch((e) => console.error("search-index owner:", e));
  const [owner] = row?.ownerId ? await db.select().from(owners).where(eq(owners.id, row.ownerId)) : [null];
  return NextResponse.json(mergeOwnerIntoProperty({ property: row, owner: owner ?? null }), { status: 201 });
}
