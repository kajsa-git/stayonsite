import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { propertyImages } from "@/lib/crm/schema";
import { R2_BUCKET, r2 } from "@/lib/crm/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { asc, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MODEL = "claude-sonnet-4-6";

const yesNo = (v: unknown) => (v ? "ja" : null);

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY saknas i miljön (lägg till i Vercel)." }, { status: 503 });
  }

  const { id } = await params;
  const b = await req.json().catch(() => ({} as Record<string, unknown>));

  // Faktarader från objektets data (frivilligt — använder formulärets aktuella värden).
  const facts: string[] = [
    b.city && `Ort: ${b.city}`,
    b.postalCode && `Postnummer: ${b.postalCode}`,
    b.squareMeters && `Yta: ${b.squareMeters} m²`,
    b.bedrooms && `Sovrum: ${b.bedrooms}`,
    b.beds && `Bäddar: ${b.beds}`,
    b.bathrooms && `Badrum: ${b.bathrooms}`,
    yesNo(b.furnished) && "Möblerat",
    yesNo(b.kitchen) && "Eget kök",
    yesNo(b.garage) && "Garage",
    yesNo(b.broadband) && "Bredband ingår",
    yesNo(b.egetBoende) && "Eget boende (ej delat)",
    b.parkingSpaces && `Parkering: ${b.parkingSpaces} platser`,
    b.washingMachines && `Tvättmaskin: ${b.washingMachines}`,
    b.dryers && `Tumlare: ${b.dryers}`,
    b.skick && `Skick: ${b.skick}`,
    b.moveInFrom && `Tillgänglig från: ${b.moveInFrom}`,
    b.availableTo && `Tillgänglig till: ${b.availableTo}`,
  ].filter(Boolean) as string[];

  // Bilder för vision: hämtas från R2 och konverteras server-side till JPEG
  // (max 1024 px, base64). URL-läget föll på verkligheten: många uppladdningar
  // är AVIF (stöds inte av vision-API:t) eller mobilfoton > 5 MB — båda gav
  // "Claude API 400" och stoppade JA-flödet. sharp normaliserar allt.
  const imgRows = await db
    .select({ key: propertyImages.key })
    .from(propertyImages)
    .where(eq(propertyImages.propertyId, id))
    .orderBy(desc(propertyImages.isPrimary), asc(propertyImages.sortOrder), asc(propertyImages.createdAt))
    .limit(6);
  const imageBlocks = (
    await Promise.all(
      imgRows.map(async (im) => {
        try {
          const obj = await r2.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: im.key }));
          const raw = Buffer.from(await obj.Body!.transformToByteArray());
          const jpeg = await sharp(raw).rotate().resize({ width: 1024, withoutEnlargement: true }).jpeg({ quality: 72 }).toBuffer();
          return { type: "image", source: { type: "base64", media_type: "image/jpeg", data: jpeg.toString("base64") } };
        } catch (e) {
          console.error(`describe: hoppar över bild ${im.key}:`, e);
          return null; // en trasig bild ska inte stoppa hela beskrivningen
        }
      }),
    )
  ).filter((b): b is NonNullable<typeof b> => b !== null);

  if (facts.length === 0 && imageBlocks.length === 0) {
    return NextResponse.json({ error: "Fyll i lite data eller ladda upp bilder först." }, { status: 400 });
  }

  const instructions = `Du skriver en extern bostadsbeskrivning för ett seriöst svenskt corporate housing-bolag (StayOnSite). Beskrivningen visas publikt för företag som söker boende åt personal.

Skriv på svenska, 2–4 meningar, saklig och förtroendeingivande B2B-ton. Beskriv det som faktiskt syns på bilderna och framgår av datan (standard, ljus, möblering, läge-känsla).

Förbjudet: hitta inte på fakta, ingen reklamfluff, inga superlativ-staplar, och nämn ALDRIG exakt gatuadress, hyresvärd/ägare eller pris. Svara ENBART med beskrivningstexten, inget annat.

Objektdata:
${facts.length ? facts.map((f) => `- ${f}`).join("\n") : "(ingen strukturerad data angiven)"}`;

  const content: unknown[] = [{ type: "text", text: instructions }, ...imageBlocks];

  let data: { content?: { type: string; text?: string }[] };
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({ model: MODEL, max_tokens: 600, thinking: { type: "disabled" }, messages: [{ role: "user", content }] }),
    });
    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `Claude API ${res.status}`, detail: err.slice(0, 300) }, { status: 502 });
    }
    data = await res.json();
  } catch (e) {
    return NextResponse.json({ error: "Generering misslyckades", detail: String(e).slice(0, 200) }, { status: 502 });
  }

  const description = (data.content ?? [])
    .filter((blk) => blk.type === "text")
    .map((blk) => blk.text ?? "")
    .join("")
    .trim()
    .replace(/^["“”]|["“”]$/g, "");

  if (!description) return NextResponse.json({ error: "Tom beskrivning från modellen." }, { status: 502 });
  return NextResponse.json({ description });
}
