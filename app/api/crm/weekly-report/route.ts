import { requireApprovedSession } from "@/lib/crm/auth";
import { computeWeeklyReport } from "@/lib/crm/weekly-report";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const includeCurrent = new URL(request.url).searchParams.get("includeCurrent") ?? "1";
  if (includeCurrent !== "0" && includeCurrent !== "1") {
    return NextResponse.json({ error: "includeCurrent måste vara 0 eller 1" }, { status: 400 });
  }
  try {
    const report = await computeWeeklyReport({ includeCurrent: includeCurrent === "1" });
    return NextResponse.json(report, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("CRM weekly report failed", error);
    return NextResponse.json({ error: "Kunde inte hämta veckorapporten. Försök igen." }, { status: 500 });
  }
}
