import { requireApprovedSession } from "@/lib/crm/auth";
import { plusDaysStockholm } from "@/lib/crm/date";
import { db } from "@/lib/crm/db";
import { sanitizeKalkyl } from "@/lib/crm/kalkyl";
import { matches } from "@/lib/crm/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const VALID = ["suggested", "sent", "accepted", "rejected"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  if (body.status && !VALID.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // Whitelist redigerbara fält — klienten får aldrig repeka requestId/propertyId eller byta id.
  const ALLOWED = ["status", "matchScore", "followUpDate", "followUpReason", "notes", "kalkyl"] as const;
  const data: Record<string, unknown> = {};
  for (const key of ALLOWED) {
    if (key in body) data[key] = body[key];
  }
  if ("kalkyl" in data) data.kalkyl = sanitizeKalkyl(data.kalkyl);
  // Stamp sentAt when a suggestion is marked as sent
  if (body.status === "sent") {
    data.sentAt = new Date().toISOString();
    // Skickat förslag utan uppföljningsdatum = garanterat tappad tråd. Sätt +3 dagar
    // automatiskt om klienten inte anger något eget — det var så 10/10 skickade
    // förslag hamnade förfallna utan att synas.
    const [existing] = await db.select({ followUpDate: matches.followUpDate }).from(matches).where(eq(matches.id, id));
    if (!("followUpDate" in body) && !existing?.followUpDate) {
      data.followUpDate = plusDaysStockholm(3);
      data.followUpReason = data.followUpReason ?? "Förslag skickat — väntar svar";
    }
  }

  const [row] = await db.update(matches).set(data).where(eq(matches.id, id)).returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.delete(matches).where(eq(matches.id, id));
  return NextResponse.json({ ok: true });
}
