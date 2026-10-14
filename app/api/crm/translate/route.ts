import { requireApprovedSession } from "@/lib/crm/auth";
import { PropertyTranslationError, translatePropertyText } from "@/lib/crm/property-translations";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Preview without saving. Ordinary property writes also translate the
// external description automatically, using the same validated translator.
export async function POST(req: NextRequest) {
  if (!(await requireApprovedSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  try {
    return NextResponse.json(await translatePropertyText({ publicDescription: body.publicDescription, skick: body.skick, inclusions: body.inclusions }));
  } catch (error) {
    if (error instanceof PropertyTranslationError) return NextResponse.json({ error: error.message }, { status: error.status });
    throw error;
  }
}
