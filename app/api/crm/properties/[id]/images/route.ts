import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { propertyImages } from "@/lib/crm/schema";
import { R2_BUCKET, r2 } from "@/lib/crm/r2";
import { sniffImageType } from "@/lib/crm/image-type";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { asc, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

// GET — list a property's images with short-lived presigned view URLs
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const rows = await db
    .select()
    .from(propertyImages)
    .where(eq(propertyImages.propertyId, id))
    .orderBy(desc(propertyImages.isPrimary), asc(propertyImages.sortOrder), asc(propertyImages.createdAt));

  const withUrls = await Promise.all(
    rows.map(async (r) => ({
      id: r.id,
      fileName: r.fileName,
      isPrimary: !!r.isPrimary,
      url: await getSignedUrl(r2, new GetObjectCommand({ Bucket: R2_BUCKET, Key: r.key }), { expiresIn: 3600 }),
    }))
  );

  return NextResponse.json(withUrls);
}

// POST — upload an image (multipart form-data, field "file")
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Ingen fil" }, { status: 400 });
  }
  if (file.size > 15 * 1024 * 1024) {
    return NextResponse.json({ error: "Max 15 MB" }, { status: 400 });
  }

  // Validera mot magic bytes — lita aldrig på klientens Content-Type. Avvisar bl.a.
  // SVG och spoofade payloads. Lagrar sniffad MIME/ext, inte filändelsen.
  const bytes = Buffer.from(await file.arrayBuffer());
  const sniffed = sniffImageType(bytes);
  if (!sniffed) {
    return NextResponse.json(
      { error: "Filen är inte en giltig bild (jpg, png, webp, gif eller avif)" },
      { status: 400 },
    );
  }

  const key = `properties/${id}/${nanoid()}.${sniffed.ext}`;

  await r2.send(
    new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: bytes, ContentType: sniffed.mime })
  );

  const imageId = nanoid();
  const [row] = await db
    .insert(propertyImages)
    .values({ id: imageId, propertyId: id, key, fileName: file.name })
    .returning();

  return NextResponse.json(row, { status: 201 });
}
