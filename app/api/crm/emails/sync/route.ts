import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { syncEntityEmails } from "@/lib/crm/email-sync";
import { GmailAuthError } from "@/lib/crm/gmail";
import { NextRequest, NextResponse } from "next/server";

// ↻ Synka på ett företags- eller uthyrarkort: hämtar trådarna för kortets adresser
// direkt från Gmail. Bakgrundssynken (/api/cron/email-sync) gör samma sak löpande för
// hela brevlådan; den här vägen finns för "visa det senaste nu".
export async function POST(req: NextRequest) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { companyId, ownerId } = await req.json();
  if (!companyId && !ownerId) {
    return NextResponse.json({ error: "companyId or ownerId required" }, { status: 400 });
  }

  const user = session.user as typeof session.user & { id: string };
  try {
    const { synced } = await syncEntityEmails(db, user.id, companyId ? { companyId } : { ownerId });
    return NextResponse.json({ synced });
  } catch (err) {
    if (err instanceof GmailAuthError) {
      return NextResponse.json({ error: "gmail_auth", message: err.message }, { status: 403 });
    }
    throw err;
  }
}
