import { PutObjectCommand } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import { loadLandlordStanding } from "@/lib/crm/deal-projection";
import { appendPropertyIntakeImageSummary, createPropertyIntake, propertyIntakeSchema } from "@/lib/crm/property-intake";
import { db } from "@/lib/crm/db";
import { imageContentHash } from "@/lib/crm/image-dedup";
import { sniffImageType } from "@/lib/crm/image-type";
import { R2_BUCKET, r2 } from "@/lib/crm/r2";
import { propertyImages } from "@/lib/crm/schema";
import { ensureShareLink } from "@/lib/crm/share-links";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MAX_IMAGES = 10;
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const MAX_TOTAL_IMAGE_BYTES = 60 * 1024 * 1024;

function fail(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status });
}

function filesFrom(formData: FormData) {
  return formData.getAll("images").filter((value): value is File => value instanceof File && value.size > 0);
}

async function uploadImage(propertyId: string, file: File, sortOrder: number, isPrimary: boolean, seenHashes: Set<string>) {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("image_too_large");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const sniffed = sniffImageType(bytes);
  if (!sniffed) {
    throw new Error("invalid_image_type");
  }

  // Innehålls-dedup: samma foto bifogat två gånger i samma inskick lagras en gång.
  const hash = imageContentHash(bytes);
  if (seenHashes.has(hash)) {
    throw new Error("duplicate_image");
  }
  seenHashes.add(hash);

  const key = `properties/${propertyId}/${nanoid()}.${sniffed.ext}`;
  await r2.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: bytes, ContentType: sniffed.mime }));

  const [row] = await db
    .insert(propertyImages)
    .values({
      id: nanoid(),
      propertyId,
      key,
      fileName: file.name,
      sortOrder,
      isPrimary,
    })
    .returning();

  return row;
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      return fail("expected_multipart_form_data", 415);
    }

    const formData = await req.formData();
    const rawPayload = formData.get("payload");
    if (typeof rawPayload !== "string") {
      return fail("missing_payload");
    }

    let parsedPayload: unknown;
    try {
      parsedPayload = JSON.parse(rawPayload);
    } catch {
      return fail("invalid_payload_json");
    }

    const parsed = propertyIntakeSchema.safeParse(parsedPayload);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "invalid_property_intake", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    if (parsed.data.website?.trim()) {
      return NextResponse.json({ success: true, skipped: true });
    }

    const files = filesFrom(formData);
    if (files.length > MAX_IMAGES) {
      return fail("too_many_images");
    }
    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    if (totalBytes > MAX_TOTAL_IMAGE_BYTES) {
      return fail("images_too_large");
    }

    const { property, owner } = await createPropertyIntake(parsed.data);

    let imageCount = 0;
    const imageErrors: string[] = [];
    const seenHashes = new Set<string>();
    for (const [index, file] of files.entries()) {
      try {
        await uploadImage(property.id, file, index, imageCount === 0, seenHashes);
        imageCount += 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : "image_upload_failed";
        imageErrors.push(`${file.name || `bild ${index + 1}`}: ${message}`);
      }
    }

    await appendPropertyIntakeImageSummary(property.id, imageCount, imageErrors.length);

    // Del 2 av registreringen: privatpersoner får uthyrningsuppdraget direkt efter
    // inskicket. Fristående uthyrarlänk (ownerId, createdBy null = intagsflödet) —
    // samma länk återanvänds i påminnelsemejlen tills uppdraget är signerat.
    // Får aldrig fälla intaget — bostaden är redan sparad.
    const ownerId = owner?.id ?? property.ownerId ?? null;
    let agreement: { token: string; alreadySigned: boolean } | null = null;
    if (parsed.data.ownerType === "privatperson" && ownerId) {
      try {
        const [standing, link] = await Promise.all([
          loadLandlordStanding(ownerId),
          ensureShareLink({ audience: "landlord", ownerId }),
        ]);
        agreement = { token: link.token, alreadySigned: standing?.agreementAccepted ?? false };
      } catch (error) {
        console.error("Intake agreement link failed", error);
      }
    }

    return NextResponse.json({
      success: true,
      propertyId: property.id,
      ownerId,
      imageCount,
      imageErrors,
      agreement,
    }, { status: 201 });
  } catch (error) {
    console.error("Property intake failed", error);
    return NextResponse.json({ success: false, error: "property_intake_failed" }, { status: 500 });
  }
}
