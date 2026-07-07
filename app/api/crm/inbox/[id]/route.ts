// Markera inkommande svar som läst/oläst.
import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { inboxMessages } from "@/lib/crm/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const raw = await req.json().catch(() => ({}) as Record<string, unknown>);
  if (typeof raw.isRead !== "boolean") {
    return NextResponse.json({ error: "isRead (boolean) krävs" }, { status: 400 });
  }

  const [row] = await db.update(inboxMessages).set({ isRead: raw.isRead }).where(eq(inboxMessages.id, id)).returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}
