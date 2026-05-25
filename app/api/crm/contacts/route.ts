import { auth } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { contacts } from "@/lib/crm/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body.companyId) return NextResponse.json({ error: "companyId required" }, { status: 400 });

  // If marking as primary, clear others first
  if (body.isPrimary) {
    await db
      .update(contacts)
      .set({ isPrimary: false })
      .where(eq(contacts.companyId, body.companyId));
  }

  const id = nanoid();
  const [row] = await db.insert(contacts).values({ id, ...body }).returning();
  return NextResponse.json(row, { status: 201 });
}
