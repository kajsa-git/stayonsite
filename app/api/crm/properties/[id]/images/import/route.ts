// POST { urls: string[] } → laddar ner annonsens bilder server-side och lägger dem i R2 +
// crm_property_images. Anropas efter att objektet skapats vid import (Qasa/Airbnb).
// Bara bild-CDN:er på allowlist tillåts (SSRF-skydd) och varje fil magic-byte-valideras.
import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { propertyImages, properties } from "@/lib/crm/schema";
import { R2_BUCKET, r2 } from "@/lib/crm/r2";
import { existingImageHashes, imageContentHash } from "@/lib/crm/image-dedup";
import { sniffImageType } from "@/lib/crm/image-type";
import { safeFetchPublic } from "@/lib/crm/safe-fetch";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_IMAGES = 20;
const MAX_BYTES = 15 * 1024 * 1024;

// Defense-in-depth: nedladdningen går via safeFetchPublic (blockerar privata IP:n,
// molnmetadata, redirects-till-internt). Allowlistan här snävar dessutom in till de
// förväntade bild-CDN:erna så endpointen inte kan användas som generell proxy.
function isAllowedImageHost(raw: string): boolean {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return false;
  }
  if (u.protocol !== "https:") return false;
  const h = u.hostname.toLowerCase();
  return (
    h === "muscache.com" ||
    h.endsWith(".muscache.com") || // Airbnb (a0.muscache.com m.fl.)
    h === "qasa.com" ||
    h.endsWith(".qasa.com") ||
    (h.startsWith("qasa-") && h.endsWith(".amazonaws.com")) // qasa-static-prod.s3-eu-west-1.amazonaws.com
  );
}

function fileNameFromUrl(raw: string): string {
  try {
    const p = new URL(raw).pathname;
    const base = p.split("/").filter(Boolean).pop() ?? "bild";
    return decodeURIComponent(base).slice(0, 120) || "bild";
  } catch {
    return "bild";
  }
}

async function downloadImage(url: string): Promise<Buffer | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await safeFetchPublic(url, {
      headers: { "user-agent": "Mozilla/5.0 (compatible; StayOnSite-CRM/1.0)" },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    // Avvisa tidigt på Content-Length så vi inte buffrar en gigantisk kropp i minnet.
    const declared = Number(res.headers.get("content-length"));
    if (Number.isFinite(declared) && declared > MAX_BYTES) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength === 0 || buf.byteLength > MAX_BYTES) return null;
    return buf;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const [prop] = await db.select({ id: properties.id }).from(properties).where(eq(properties.id, id));
  if (!prop) return NextResponse.json({ error: "Objektet finns inte" }, { status: 404 });

  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const urls = Array.isArray(body.urls) ? (body.urls as unknown[]).filter((u): u is string => typeof u === "string") : [];
  if (!urls.length) return NextResponse.json({ error: "Inga bild-URL:er" }, { status: 400 });

  // Sätt huvudbild på första importerade endast om objektet saknar bilder sedan tidigare.
  const existing = await db
    .select({ id: propertyImages.id })
    .from(propertyImages)
    .where(eq(propertyImages.propertyId, id));
  let hasPrimary = existing.length > 0;

  // Innehålls-dedup: hoppa över bilder som redan finns på objektet (t.ex. vid
  // om-import av samma annons) och dubbletter inom samma anrop.
  const seenHashes = await existingImageHashes(id);

  let created = 0;
  let skipped = 0;
  const failed: string[] = [];

  const slice = urls.slice(0, MAX_IMAGES);
  for (let i = 0; i < slice.length; i++) {
    const url = slice[i];
    if (!isAllowedImageHost(url)) {
      failed.push(url);
      continue;
    }
    const bytes = await downloadImage(url);
    if (!bytes) {
      failed.push(url);
      continue;
    }
    const sniffed = sniffImageType(bytes);
    if (!sniffed) {
      failed.push(url);
      continue;
    }
    const hash = imageContentHash(bytes);
    if (seenHashes.has(hash)) {
      skipped++;
      continue;
    }
    seenHashes.add(hash);
    const key = `properties/${id}/${nanoid()}.${sniffed.ext}`;
    try {
      await r2.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: bytes, ContentType: sniffed.mime }));
      await db.insert(propertyImages).values({
        id: nanoid(),
        propertyId: id,
        key,
        fileName: fileNameFromUrl(url),
        sortOrder: existing.length + i, // behåll annonsens ordning även om någon bild fallerar
        isPrimary: !hasPrimary, // första lyckade bilden blir huvudbild i prospektet
      });
      if (!hasPrimary) hasPrimary = true;
      created++;
    } catch {
      failed.push(url);
    }
  }

  return NextResponse.json({ created, failed: failed.length, skipped });
}
