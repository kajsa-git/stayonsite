// Förslag på ny avsändare: koppla som kontakt på ett företag, eller ignorera.
import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { SuggestionError, ignoreSenderSuggestion, linkSenderSuggestion } from "@/lib/crm/email-sync";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const raw = await req.json().catch(() => ({}) as Record<string, unknown>);
  const user = session.user as typeof session.user & { id: string };

  try {
    if (raw.action === "ignore") {
      await ignoreSenderSuggestion(db, id);
      return NextResponse.json({ ok: true });
    }
    if (raw.action === "link") {
      if (typeof raw.companyId !== "string" || !raw.companyId) {
        return NextResponse.json({ error: "companyId krävs" }, { status: 400 });
      }
      const result = await linkSenderSuggestion(db, id, raw.companyId, { userId: user.id });
      return NextResponse.json({ ok: true, ...result });
    }
    return NextResponse.json({ error: "action måste vara 'link' eller 'ignore'" }, { status: 400 });
  } catch (error) {
    if (error instanceof SuggestionError) return NextResponse.json({ error: error.message }, { status: error.status });
    throw error;
  }
}
