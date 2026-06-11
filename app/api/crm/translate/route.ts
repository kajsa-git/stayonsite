import { requireApprovedSession } from "@/lib/crm/auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MODEL = "claude-sonnet-4-6";

type Translated = {
  publicDescription_en: string;
  publicDescription_pl: string;
  skick_en: string;
  skick_pl: string;
  inclusions_en: string[];
  inclusions_pl: string[];
};

function extractJson(text: string): Translated | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

// Översätter ett objekts beskrivning/skick (sv → en/pl). Ren funktion: skriver INTE till DB —
// klienten persisterar resultatet via vanlig spara. Använd på begäran (knapp i CRM).
export async function POST(req: NextRequest) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY saknas i miljön (lägg till i Vercel)." },
      { status: 503 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const publicDescription = (body.publicDescription as string | undefined)?.trim() ?? "";
  const skick = (body.skick as string | undefined)?.trim() ?? "";
  const inclusions: string[] = Array.isArray(body.inclusions)
    ? body.inclusions.map((s: unknown) => String(s).trim()).filter(Boolean)
    : [];
  if (!publicDescription && !skick && inclusions.length === 0) {
    return NextResponse.json({ error: "Inget att översätta — fyll i beskrivning, skick eller 'vad ingår' först." }, { status: 400 });
  }

  const prompt = `Du översätter text för ett seriöst svenskt corporate housing-bolag (StayOnSite). Översätt fälten nedan från svenska till engelska (en) och polska (pl).

Regler:
- Översätt troget och professionellt i en saklig B2B-ton. Lägg INTE till information, hitta inte på, ingen reklamfluff.
- Behåll radbrytningar och struktur.
- Är ett källfält tomt → returnera tom sträng för det språket.
- Svara ENBART med giltig JSON, inga kodstaket, ingen extra text.

JSON-format exakt (inclusions_* är arrayer med samma antal element och ordning som källan):
{"publicDescription_en":"","publicDescription_pl":"","skick_en":"","skick_pl":"","inclusions_en":[],"inclusions_pl":[]}

Källtext (svenska):
publicDescription:
"""${publicDescription}"""

skick:
"""${skick}"""

inclusions (en per rad):
${inclusions.length ? inclusions.map((x) => `- ${x}`).join("\n") : "(inga)"}`;

  let data: { content?: { type: string; text?: string }[] };
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2000,
        thinking: { type: "disabled" },
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `Claude API ${res.status}`, detail: err.slice(0, 300) }, { status: 502 });
    }
    data = await res.json();
  } catch (e) {
    return NextResponse.json({ error: "Översättning misslyckades", detail: String(e).slice(0, 200) }, { status: 502 });
  }

  const textOut = (data.content ?? []).filter((b) => b.type === "text").map((b) => b.text ?? "").join("");
  const t = extractJson(textOut);
  if (!t) return NextResponse.json({ error: "Kunde inte tolka översättningen." }, { status: 502 });

  const cleanArr = (a: unknown): string[] =>
    Array.isArray(a) ? a.map((x) => String(x).trim()).filter(Boolean) : [];

  return NextResponse.json({
    publicDescriptionEn: publicDescription ? t.publicDescription_en?.trim() ?? "" : "",
    publicDescriptionPl: publicDescription ? t.publicDescription_pl?.trim() ?? "" : "",
    skickEn: skick ? t.skick_en?.trim() ?? "" : "",
    skickPl: skick ? t.skick_pl?.trim() ?? "" : "",
    inclusionsEn: inclusions.length ? cleanArr(t.inclusions_en) : [],
    inclusionsPl: inclusions.length ? cleanArr(t.inclusions_pl) : [],
  });
}
