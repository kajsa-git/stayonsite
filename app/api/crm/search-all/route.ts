import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { searchIndex } from "@/lib/crm/schema";
import { and, like, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Normalisera: gemener, trimma, kollapsa whitespace
  const q = (req.nextUrl.searchParams.get("q") ?? "").toLowerCase().trim().replace(/\s+/g, " ");
  if (q.length < 2) return NextResponse.json([]);

  // Flera ord → alla måste matcha (AND av LIKE). Cappa antal termer.
  const terms = q.split(" ").slice(0, 5);

  const rows = await db
    .select({
      id: searchIndex.id,
      entityType: searchIndex.entityType,
      entityId: searchIndex.entityId,
      companyId: searchIndex.companyId,
      title: searchIndex.title,
      subtitle: searchIndex.subtitle,
      route: searchIndex.route,
    })
    .from(searchIndex)
    .where(and(...terms.map((t) => like(searchIndex.keywords, `%${t}%`))))
    // Prioritera primära entiteter så de inte trängs ut av många anteckningar
    .orderBy(
      sql`CASE ${searchIndex.entityType} WHEN 'company' THEN 0 WHEN 'request' THEN 1 WHEN 'property' THEN 2 WHEN 'owner' THEN 3 WHEN 'contact' THEN 4 ELSE 5 END`,
    )
    .limit(20);

  return NextResponse.json(rows);
}
