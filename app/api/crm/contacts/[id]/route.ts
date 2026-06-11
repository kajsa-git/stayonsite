import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { deleteContactDeep } from "@/lib/crm/cascade-delete";
import { indexContact, removeFromIndex } from "@/lib/crm/search-index";
import { contacts } from "@/lib/crm/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  // If marking as primary, clear others first
  if (body.isPrimary) {
    const [existing] = await db.select().from(contacts).where(eq(contacts.id, id));
    if (existing) {
      await db
        .update(contacts)
        .set({ isPrimary: false })
        .where(eq(contacts.companyId, existing.companyId));
    }
  }

  // Whitelist redigerbara fält — klienten får aldrig flytta kontakten till ett annat
  // företag (companyId) eller byta id.
  const ALLOWED = ["name", "phone", "email", "isPrimary"] as const;
  const data: Record<string, unknown> = {};
  for (const key of ALLOWED) if (key in body) data[key] = body[key];

  const [row] = await db.update(contacts).set(data).where(eq(contacts.id, id)).returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await indexContact(id).catch((e) => console.error("search-index contact:", e));
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.transaction((tx) => deleteContactDeep(tx, id));
  await removeFromIndex("contact", id).catch((e) => console.error("search-index contact delete:", e));
  return NextResponse.json({ ok: true });
}
