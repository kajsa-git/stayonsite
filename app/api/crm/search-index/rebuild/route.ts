import { auth } from "@/lib/crm/auth";
import { rebuildSearchIndex } from "@/lib/crm/search-index";
import { NextResponse } from "next/server";

// Bygg om hela sökindexet från källtabellerna. Säkerhetsnät mot drift om en
// mutationsväg någon gång missar att uppdatera indexet.
export async function POST() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const count = await rebuildSearchIndex();
  return NextResponse.json({ ok: true, indexed: count });
}
