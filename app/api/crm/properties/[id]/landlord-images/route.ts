import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { and, asc, eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { pendingContentReview } from "@/lib/crm/invalidate-property-review";
import { R2_BUCKET, r2 } from "@/lib/crm/r2";
import { landlordImageCandidates, properties, propertyImages } from "@/lib/crm/schema";
import { schedulePropertyReview } from "@/lib/crm/schedule-property-review";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireApprovedSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const rows = await db.select().from(landlordImageCandidates).where(and(eq(landlordImageCandidates.propertyId, id),
    inArray(landlordImageCandidates.status, ["pending", "processing", "needs_review"]))).orderBy(asc(landlordImageCandidates.createdAt));
  const candidates = await Promise.all(rows.map(async (row) => ({ id: row.id, fileName: row.fileName, status: row.status, error: row.error,
    gmailMessageId: row.gmailMessageId, url: row.objectKey ? await getSignedUrl(r2, new GetObjectCommand({ Bucket: R2_BUCKET, Key: row.objectKey }), { expiresIn: 3600 }) : null,
  })));
  return NextResponse.json({ candidates });
}

const importSchema = z.object({ candidateId: z.string().min(1), acceptedPublicImpact: z.literal(true) }).strict();

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireApprovedSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const parsed = importSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Bekräfta bildkontrollen först." }, { status: 400 });
  const result = await db.transaction(async (tx) => {
    const [property] = await tx.select().from(properties).where(eq(properties.id, id)).limit(1);
    const [candidate] = await tx.select().from(landlordImageCandidates).where(and(eq(landlordImageCandidates.id, parsed.data.candidateId),
      eq(landlordImageCandidates.propertyId, id), eq(landlordImageCandidates.status, "needs_review"))).limit(1);
    if (!property || !candidate?.objectKey || !candidate.objectKey.startsWith(`properties/${id}/landlord-candidates/${candidate.id}.`)) return null;
    const current = await tx.select({ id: propertyImages.id }).from(propertyImages).where(eq(propertyImages.propertyId, id));
    const imageId = `landlord-image:${candidate.id}`;
    await tx.insert(propertyImages).values({ id: imageId, propertyId: id, key: candidate.objectKey, fileName: candidate.fileName,
      sortOrder: current.length, isPrimary: current.length === 0 }).onConflictDoNothing();
    await tx.update(properties).set({ ...pendingContentReview(), updatedAt: new Date().toISOString() }).where(eq(properties.id, id));
    await tx.update(landlordImageCandidates).set({ status: "imported", error: null, updatedAt: new Date().toISOString() })
      .where(and(eq(landlordImageCandidates.id, candidate.id), eq(landlordImageCandidates.status, "needs_review")));
    return { imageId };
  });
  if (!result) return NextResponse.json({ error: "Bilden är inte tillgänglig för import." }, { status: 409 });
  schedulePropertyReview(id);
  return NextResponse.json(result);
}
