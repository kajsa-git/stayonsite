import { GetObjectCommand } from "@aws-sdk/client-s3"
import { NextRequest, NextResponse } from "next/server"
import { resolvePublicPropertyImageKey } from "@/lib/crm/public-images"
import { R2_BUCKET, r2 } from "@/lib/crm/r2"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const CONTENT_TYPES: Record<string, string> = {
  webp: "image/webp",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  avif: "image/avif",
  gif: "image/gif",
}

// Kort CDN-cache: ett avpublicerat objekts bilder slutar visas inom några timmar.
const CACHE_CONTROL = "public, max-age=3600, s-maxage=3600, stale-while-revalidate=3600"

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string; index: string }> }) {
  const { slug, index } = await params
  const position = /^\d{1,3}$/.test(index) ? Number(index) : NaN
  const size = req.nextUrl.searchParams.get("w") === "800" ? "thumb" : "display"

  const key = await resolvePublicPropertyImageKey(slug, position, size)
  if (!key) return new NextResponse("Not found", { status: 404, headers: { "Cache-Control": "public, max-age=300, s-maxage=300" } })

  try {
    const object = await r2.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }))
    if (!object.Body) return new NextResponse("Not found", { status: 404 })
    const ext = key.split(".").pop()?.toLowerCase() ?? ""
    const headers: Record<string, string> = {
      "Content-Type": object.ContentType && object.ContentType.startsWith("image/") ? object.ContentType : (CONTENT_TYPES[ext] ?? "application/octet-stream"),
      "Cache-Control": CACHE_CONTROL,
      "X-Content-Type-Options": "nosniff",
    }
    if (object.ContentLength != null) headers["Content-Length"] = String(object.ContentLength)
    return new NextResponse(object.Body.transformToWebStream(), { status: 200, headers })
  } catch {
    return new NextResponse("Not found", { status: 404 })
  }
}
