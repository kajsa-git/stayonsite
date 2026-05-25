import { auth } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { indexNote } from "@/lib/crm/search-index";
import { notes } from "@/lib/crm/schema";
import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const companyId = req.nextUrl.searchParams.get("companyId");
  if (!companyId) return NextResponse.json({ error: "companyId required" }, { status: 400 });

  const rows = await db
    .select()
    .from(notes)
    .where(eq(notes.companyId, companyId))
    .orderBy(desc(notes.createdAt));

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body.companyId || !body.channel || !body.content) {
    return NextResponse.json({ error: "companyId, channel, content required" }, { status: 400 });
  }

  const id = nanoid();
  const user = session.user as typeof session.user & { id: string };
  const [row] = await db
    .insert(notes)
    .values({ id, authorId: user.id, ...body })
    .returning();

  await indexNote(id).catch((e) => console.error("search-index note:", e));
  return NextResponse.json(row, { status: 201 });
}
