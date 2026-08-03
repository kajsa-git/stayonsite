import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { deleteRequestDeep } from "@/lib/crm/cascade-delete";
import { applyRequestUpdate } from "@/lib/crm/request-update";
import { removeFromIndex } from "@/lib/crm/search-index";
import { NextRequest, NextResponse } from "next/server";

// Uppdateringslogiken (whitelist, grindar, sidoeffekter) bor i
// src/lib/crm/request-update.ts — delas med MCP-verktyget crm_update_request_status.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const result = await applyRequestUpdate(id, body);
  // === false: tsconfig kör utan strictNullChecks, där narrowar inte !result.ok
  if (result.ok === false) return NextResponse.json(result.body, { status: result.status });
  return NextResponse.json(result.row);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.transaction((tx) => deleteRequestDeep(tx, id));
  await removeFromIndex("request", id).catch((e) => console.error("search-index request delete:", e));
  return NextResponse.json({ ok: true });
}
