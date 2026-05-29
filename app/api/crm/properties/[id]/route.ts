import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { deletePropertyDeep } from "@/lib/crm/cascade-delete";
import { indexOwner, indexProperty, removeFromIndex } from "@/lib/crm/search-index";
import { isValidPropertyStatus, mergeOwnerIntoProperty, normalizePropertyWriteBody } from "@/lib/crm/owners";
import { owners, properties, propertyImages } from "@/lib/crm/schema";
import { R2_BUCKET, r2 } from "@/lib/crm/r2";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  if (body.status != null && !isValidPropertyStatus(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const [existing] = await db.select().from(properties).where(eq(properties.id, id));
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const values = await normalizePropertyWriteBody(body, existing);
  const [row] = await db
    .update(properties)
    .set({ ...values, updatedAt: new Date().toISOString() })
    .where(eq(properties.id, id))
    .returning();
  await indexProperty(id).catch((e) => console.error("search-index property:", e));
  if (row?.ownerId) {
    await indexOwner(row.ownerId).catch((e) => console.error("search-index owner:", e));
  }
  const [owner] = row?.ownerId
    ? await db.select().from(owners).where(eq(owners.id, row.ownerId))
    : [null];
  return NextResponse.json(mergeOwnerIntoProperty({ property: row, owner: owner ?? null }));
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const [existing] = await db.select({ ownerId: properties.ownerId }).from(properties).where(eq(properties.id, id));
  // Hämta R2-nycklarna INNAN raderingen (bildraderna försvinner i transaktionen).
  const imageKeys = (
    await db.select({ key: propertyImages.key }).from(propertyImages).where(eq(propertyImages.propertyId, id))
  ).map((r) => r.key);

  await db.transaction((tx) => deletePropertyDeep(tx, id));

  // Städa bildobjekten i R2 (best-effort — DB-raderingen har redan lyckats).
  await Promise.all(
    imageKeys.map((key) =>
      r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key })).catch((e) => console.error("R2 delete:", e)),
    ),
  );

  await removeFromIndex("property", id).catch((e) => console.error("search-index property delete:", e));
  if (existing?.ownerId) {
    await indexOwner(existing.ownerId).catch((e) => console.error("search-index owner:", e));
  }
  return NextResponse.json({ ok: true });
}
