/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireApprovedSession } from "@/lib/crm/auth";
import { NextRequest, NextResponse } from "next/server";

// Enkel uppslagning av företagsuppgifter via org.nr (publika registerdata).
// Låg volym (ett fåtal/dag, intern användning). Robust fallback: { found: false }.
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

function find(o: any, pred: (x: any) => boolean): any {
  if (o && typeof o === "object") {
    if (!Array.isArray(o) && pred(o)) return o;
    for (const k in o) {
      const r = find(o[k], pred);
      if (r) return r;
    }
  }
  return null;
}

const titleCase = (s: string) =>
  s.toLowerCase().replace(/(^|\s|-)([a-zåäö])/g, (_m, a, b) => a + b.toUpperCase());

// Allabolag har två adressformat: dels separata fält (zipCode/postPlace), dels
// hela adressen i addressLine ("Gatan 1, 123 45 Ort") med zipCode/postPlace = null
// (formatbytet upptäckt 2026-07-13 — då försvann adressen ur uppslaget helt).
function parseAddress(a: any): { street: string | null; postalCode: string | null; city: string | null } {
  if (!a) return { street: null, postalCode: null, city: null };
  if (a.zipCode && a.postPlace) {
    return { street: a.addressLine || null, postalCode: String(a.zipCode), city: titleCase(String(a.postPlace)) };
  }
  const line = String(a.addressLine ?? "").trim();
  if (!line) return { street: null, postalCode: null, city: null };
  const m = line.match(/^(.*?),\s*(\d{3}\s?\d{2})\s+(.+)$/);
  if (m) {
    return {
      street: m[1].trim(),
      postalCode: m[2].replace(/\s+/g, "").replace(/^(\d{3})(\d{2})$/, "$1 $2"),
      city: titleCase(m[3].trim()),
    };
  }
  return { street: line, postalCode: null, city: null };
}

export async function GET(req: NextRequest) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let orgnr = (req.nextUrl.searchParams.get("orgnr") || "").replace(/\D/g, "");
  // Acceptera även 12-siffrigt format (med sekel-prefix, t.ex. 16XXXXXXXXXX) → dra bort prefixet.
  if (orgnr.length === 12) orgnr = orgnr.slice(2);
  if (orgnr.length !== 10) return NextResponse.json({ found: false, error: "Ange ett 10- eller 12-siffrigt org.nr" });

  try {
    const res = await fetch(`https://www.allabolag.se/${orgnr}`, {
      headers: { "User-Agent": UA, "Accept-Language": "sv", Accept: "text/html" },
    });
    if (!res.ok) return NextResponse.json({ found: false });
    const html = await res.text();
    const m = html.match(/id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (!m) return NextResponse.json({ found: false });
    const data = JSON.parse(m[1]);

    const c = find(data, (o: any) => o.orgnr === orgnr && (o.businessUnitType === "MAIN" || o.legalName || o.name));
    // Adressen ligger numera som fält direkt på företagsobjektet; trädsökningen
    // på zipCode/postPlace behålls som fallback för äldre sidvarianter.
    const rawAddr =
      c?.visitorAddress ??
      c?.postalAddress ??
      c?.legalVisitorAddress ??
      c?.legalPostalAddress ??
      find(data, (o: any) => o.zipCode && o.postPlace && o.addressLine !== undefined);
    const addr = parseAddress(rawAddr);
    if (!c && !addr.street) return NextResponse.json({ found: false });

    return NextResponse.json({
      found: true,
      name: c?.legalName || c?.name || null,
      orgnr,
      phone: c?.phone || c?.legalPhone || c?.mobile || null,
      street: addr.street,
      postalCode: addr.postalCode,
      city: addr.city,
      country: "Sverige",
    });
  } catch {
    return NextResponse.json({ found: false });
  }
}
