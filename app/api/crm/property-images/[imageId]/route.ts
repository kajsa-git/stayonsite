import { auth } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { propertyImages } from "@/lib/crm/schema";
import { R2_BUCKET, r2 } from "@/lib/crm/r2";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ imageId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { imageId } = await params;
  const [row] = await db.select().from(propertyImages).where(eq(propertyImages.id, imageId));
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Remove from R2, then the DB row (best-effort on R2 — still delete the row)
  try {
    await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: row.key }));
  } catch {
    // ignore R2 errors; the DB row should still be removed
  }
  await db.delete(propertyImages).where(eq(propertyImages.id, imageId));

  return NextResponse.json({ ok: true });
}
