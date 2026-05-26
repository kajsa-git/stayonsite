import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { db } from "@/lib/crm/db";
import { properties, propertyImages } from "@/lib/crm/schema";
import { R2_BUCKET, r2 } from "@/lib/crm/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { asc, eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "StayOnSite – Bostadsförslag";

const NAVY = "#0a2f4f";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Tenant-safe fields only — never address, owner or price.
  const [p] = await db
    .select({
      published: properties.published,
      postalCode: properties.postalCode,
      city: properties.city,
      squareMeters: properties.squareMeters,
      bedrooms: properties.bedrooms,
      beds: properties.beds,
      furnished: properties.furnished,
      kitchen: properties.kitchen,
      garage: properties.garage,
      broadband: properties.broadband,
      egetBoende: properties.egetBoende,
    })
    .from(properties)
    .where(eq(properties.id, id));

  const logoBytes = await readFile(join(process.cwd(), "public/stayonsite-logo-white.png"));
  const logoSrc = `data:image/png;base64,${logoBytes.toString("base64")}`;
  const logoH = 60;
  const logoW = Math.round((logoH * 1820) / 480);

  // Not published / not found → generic branded card (no private data).
  if (!p || !p.published) {
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: NAVY }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={logoW * 2} height={logoH * 2} alt="" />
          <div style={{ marginTop: 28, fontSize: 34, color: "rgba(255,255,255,0.85)" }}>Corporate housing i hela Sverige</div>
        </div>
      ),
      { ...size }
    );
  }

  const [img] = await db
    .select({ key: propertyImages.key })
    .from(propertyImages)
    .where(eq(propertyImages.propertyId, id))
    .orderBy(asc(propertyImages.sortOrder), asc(propertyImages.createdAt))
    .limit(1);

  let bg: string | null = null;
  if (img) {
    bg = await getSignedUrl(r2, new GetObjectCommand({ Bucket: R2_BUCKET, Key: img.key }), { expiresIn: 60 * 10 });
  }

  const features = [
    p.furnished && "Möblerat",
    p.kitchen && "Eget kök",
    p.garage && "Garage",
    p.broadband && "Bredband",
    p.egetBoende && "Eget boende",
  ].filter(Boolean).slice(0, 4) as string[];

  const factParts = [
    p.squareMeters != null && `${p.squareMeters} m²`,
    p.bedrooms != null && `${p.bedrooms} sovrum`,
    p.beds != null && `${p.beds} bäddar`,
  ].filter(Boolean) as string[];

  const title = p.city ? `Boende i ${p.city}` : "Bostadsförslag";
  const place = [p.postalCode, p.city].filter(Boolean).join(" ");

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", fontFamily: "sans-serif" }}>
        {bg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={bg} width={1200} height={630} alt="" style={{ position: "absolute", inset: 0, width: 1200, height: 630, objectFit: "cover" }} />
        ) : (
          <div style={{ position: "absolute", inset: 0, background: NAVY, display: "flex" }} />
        )}
        <div style={{ position: "absolute", inset: 0, display: "flex", background: "linear-gradient(180deg, rgba(8,28,46,0.30) 0%, rgba(8,28,46,0.55) 50%, rgba(8,28,46,0.92) 100%)" }} />

        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, width: "100%" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={logoW} height={logoH} alt="" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))" }} />

          <div style={{ display: "flex", flexDirection: "column" }}>
            {features.length > 0 && (
              <div style={{ display: "flex", marginBottom: 20 }}>
                {features.map((f) => (
                  <div
                    key={f}
                    style={{
                      display: "flex",
                      padding: "8px 18px",
                      marginRight: 12,
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.16)",
                      border: "1px solid rgba(255,255,255,0.35)",
                      color: "white",
                      fontSize: 26,
                    }}
                  >
                    {f}
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: "flex", fontSize: 76, fontWeight: 700, color: "white", lineHeight: 1.05 }}>{title}</div>
            <div style={{ display: "flex", marginTop: 14, fontSize: 30, color: "rgba(255,255,255,0.9)" }}>
              {[place, factParts.join("  ·  ")].filter(Boolean).join("   —   ")}
            </div>
          </div>
        </div>

        {/* accent-list i underkant */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 8, display: "flex", background: "#ff6300" }} />
      </div>
    ),
    { ...size }
  );
}
