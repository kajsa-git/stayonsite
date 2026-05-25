import { auth } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { indexRequest } from "@/lib/crm/search-index";
import { requests } from "@/lib/crm/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
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
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const id = nanoid();

  const now = new Date().toISOString();

  // Auto-increment request number via transaction
  const result = await db.transaction(async (tx) => {
    const existing = await tx.select().from(requests);
    const maxNum = existing.reduce((max, r) => Math.max(max, r.requestNumber ?? 0), 0);
    const [row] = await tx
      .insert(requests)
      .values({ id, requestNumber: maxNum + 1, statusChangedAt: now, ...body })
      .returning();
    return row;
  });

  await indexRequest(id).catch((e) => console.error("search-index request:", e));
  return NextResponse.json(result, { status: 201 });
}
