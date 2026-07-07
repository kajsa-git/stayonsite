import { requireApprovedSession } from "@/lib/crm/auth";
import { autoSuggestMatches } from "@/lib/crm/auto-suggest";
import { db } from "@/lib/crm/db";
import { indexRequest } from "@/lib/crm/search-index";
import { requests } from "@/lib/crm/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const companyId = req.nextUrl.searchParams.get("companyId");
  let rows;
  if (companyId) {
    rows = await db.select().from(requests).where(eq(requests.companyId, companyId));
  } else {
    rows = await db.select().from(requests);
  }
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const id = nanoid();

  const now = new Date().toISOString();

  // Auto-increment request number via transaction
  const result = await db.transaction(async (tx) => {
    const existing = await tx.select().from(requests);
    const maxNum = existing.reduce((max, r) => Math.max(max, r.requestNumber ?? 0), 0);
    const requestNumber = maxNum + 1;
    // Server-genererade fält (id/requestNumber/statusChangedAt) sätts EFTER spreaden
    // så att klienten inte kan skriva över dem.
    const [row] = await tx
      .insert(requests)
      .values({
        ...body,
        id,
        requestNumber,
        statusChangedAt: now,
        billingProjectId: body.billingProjectId ?? String(requestNumber),
      })
      .returning();
    return row;
  });

  await indexRequest(id).catch((e) => console.error("search-index request:", e));
  // Auto-förslag direkt vid skapande (interna suggested-rader, inga utskick) —
  // ny förfrågan ska aldrig ligga dagar utan ett enda förslag.
  await autoSuggestMatches(id).catch((e) => console.error("auto-suggest:", e));
  return NextResponse.json(result, { status: 201 });
}
