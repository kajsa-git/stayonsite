import { requireApprovedSession } from "@/lib/crm/auth";
import { fetchQueueItems, isValidQueue } from "@/lib/crm/queue";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const queue = req.nextUrl.searchParams.get("queue");
  if (!isValidQueue(queue)) {
    return NextResponse.json({ error: "Invalid queue. Use followups, incoming, matching or won." }, { status: 400 });
  }

  return NextResponse.json(await fetchQueueItems(queue));
}
