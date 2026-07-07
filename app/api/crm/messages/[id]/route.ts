// Hantera ett enskilt utkorgs-meddelande. Bara UTKAST får röras härifrån:
// PATCH { action: "approve" }        → utkast blir köat (agenten skickar inom ~30 s,
//                                      dock aldrig under tysta timmar 21–08).
// PATCH { action: "update", body }   → redigera utkastets text.
// DELETE                             → släng utkastet.
// Köade/skickade rader är avsiktligt oåtkomliga — historiken ska inte gå att ändra.
import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { outboxMessages } from "@/lib/crm/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MAX_BODY_CHARS = 1600;

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const raw = await req.json().catch(() => ({}) as Record<string, unknown>);
  const action = typeof raw.action === "string" ? raw.action : "";

  if (action === "approve") {
    const [row] = await db
      .update(outboxMessages)
      .set({ status: "queued" })
      .where(and(eq(outboxMessages.id, id), eq(outboxMessages.status, "draft")))
      .returning();
    if (!row) return NextResponse.json({ error: "Utkastet finns inte (eller är redan godkänt)" }, { status: 409 });
    return NextResponse.json(row);
  }

  if (action === "update") {
    const body = typeof raw.body === "string" ? raw.body.trim() : "";
    if (!body) return NextResponse.json({ error: "Meddelandet är tomt" }, { status: 400 });
    if (body.length > MAX_BODY_CHARS) return NextResponse.json({ error: `Max ${MAX_BODY_CHARS} tecken` }, { status: 400 });
    const [row] = await db
      .update(outboxMessages)
      .set({ body })
      .where(and(eq(outboxMessages.id, id), eq(outboxMessages.status, "draft")))
      .returning();
    if (!row) return NextResponse.json({ error: "Utkastet finns inte (eller är redan godkänt)" }, { status: 409 });
    return NextResponse.json(row);
  }

  return NextResponse.json({ error: "Ogiltig action. Använd approve eller update." }, { status: 400 });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const [row] = await db
    .delete(outboxMessages)
    .where(and(eq(outboxMessages.id, id), eq(outboxMessages.status, "draft")))
    .returning();
  if (!row) return NextResponse.json({ error: "Utkastet finns inte (bara utkast kan tas bort)" }, { status: 409 });
  return NextResponse.json({ ok: true });
}
