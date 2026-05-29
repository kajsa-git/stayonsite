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

export async function GET(req: NextRequest) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgnr = (req.nextUrl.searchParams.get("orgnr") || "").replace(/\D/g, "");
  if (orgnr.length !== 10) return NextResponse.json({ found: false, error: "Ange ett 10-siffrigt org.nr" });

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
    const a = find(data, (o: any) => o.zipCode && o.postPlace && o.addressLine !== undefined);
    if (!c && !a) return NextResponse.json({ found: false });

    return NextResponse.json({
      found: true,
      name: c?.legalName || c?.name || null,
      orgnr,
      phone: c?.phone || null,
      street: a?.addressLine || null,
      postalCode: a?.zipCode || null,
      city: a?.postPlace ? titleCase(a.postPlace) : null,
      country: "Sverige",
    });
  } catch {
    return NextResponse.json({ found: false });
  }
}
