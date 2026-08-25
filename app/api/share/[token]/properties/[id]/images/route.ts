import { PutObjectCommand } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/crm/db";
import { existingImageHashes, imageContentHash } from "@/lib/crm/image-dedup";
import { sniffImageType } from "@/lib/crm/image-type";
import { appendPropertyIntakeImageSummary } from "@/lib/crm/property-intake";
import { R2_BUCKET, r2 } from "@/lib/crm/r2";
import { properties, propertyImages } from "@/lib/crm/schema";
import { resolveShareLink } from "@/lib/crm/share-links";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

async function authorize(token: string, propertyId: string) {
  const link = await resolveShareLink(token, { trackView: false });
  if (!link || link.audience !== "landlord" || !link.ownerId) return null;

  const [property] = await db
    .select({ id: properties.id, ownerId: properties.ownerId })
    .from(properties)
    .where(eq(properties.id, propertyId))
    .limit(1);

  if (!property || property.ownerId !== link.ownerId) return null;
  return { link, property };
}

function errorMessage(error: string) {
  if (error === "image_too_large") return "Bilden är för stor. Prova en mindre bild.";
  if (error === "invalid_image_type") return "Filen är inte en giltig bild.";
  if (error === "duplicate_image") return "Bilden finns redan på objektet.";
  return "Bilden kunde inte laddas upp.";
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string; id: string }> }) {
  const { token, id } = await params;
  const authorized = await authorize(token, id);
  if (!authorized) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Ingen bild bifogades." }, { status: 400 });
  }

  const sortOrderValue = Number(formData.get("sortOrder") ?? 0);
  const sortOrder = Number.isInteger(sortOrderValue) && sortOrderValue >= 0 ? sortOrderValue : 0;

  try {
    if (file.size > MAX_IMAGE_BYTES) throw new Error("image_too_large");

    const bytes = Buffer.from(await file.arrayBuffer());
    const sniffed = sniffImageType(bytes);
    if (!sniffed) throw new Error("invalid_image_type");

    const hash = imageContentHash(bytes);
    const hashes = await existingImageHashes(id);
    if (hashes.has(hash)) throw new Error("duplicate_image");

    const existing = await db
      .select({ id: propertyImages.id })
      .from(propertyImages)
      .where(eq(propertyImages.propertyId, id))
      .limit(1);
    const isPrimary = existing.length === 0;
    const key = `properties/${id}/${nanoid()}.${sniffed.ext}`;

    await r2.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: bytes, ContentType: sniffed.mime }));

    const [row] = await db
      .insert(propertyImages)
      .values({
        id: nanoid(),
        propertyId: id,
        key,
        fileName: file.name,
        sortOrder,
        isPrimary,
      })
      .returning();

    return NextResponse.json({ id: row.id, fileName: row.fileName, sortOrder: row.sortOrder }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "image_upload_failed";
    return NextResponse.json({ error: errorMessage(message) }, { status: message === "duplicate_image" ? 409 : 400 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ token: string; id: string }> }) {
  const { token, id } = await params;
  const authorized = await authorize(token, id);
  if (!authorized) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const created = Number(body.created ?? 0);
  const failed = Number(body.failed ?? 0);
  if (!Number.isInteger(created) || created < 0 || !Number.isInteger(failed) || failed < 0) {
    return NextResponse.json({ error: "Invalid image summary" }, { status: 400 });
  }

  await appendPropertyIntakeImageSummary(id, created, failed);
  return NextResponse.json({ ok: true });
}
