import { requireApprovedSession } from "@/lib/crm/auth";
import { queueMoveOutSms } from "@/lib/crm/queue-move-out-sms";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!await requireApprovedSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const result = await queueMoveOutSms(id, {
    toPhone: body.toPhone,
    body: body.body,
    contactId: body.contactId,
    ownerId: body.ownerId,
    recipient: body.recipient,
    submissionId: body.submissionId,
  });
  if (result.ok === false) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result.message, { status: 201 });
}
