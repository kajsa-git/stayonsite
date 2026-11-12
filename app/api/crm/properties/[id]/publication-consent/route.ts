import { requireApprovedSession } from "@/lib/crm/auth";
import { PublicationConsentScopeError, recordPublishConsent, withdrawPublishConsent } from "@/lib/crm/publish-consent";
import { schedulePropertyReview } from "@/lib/crm/schedule-property-review";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const inputSchema = z.object({
  action: z.enum(["grant", "withdraw"]),
  source: z.enum(["sms", "mejl", "chatt", "samtal", "övrigt"]),
  name: z.string().trim().min(2).max(120),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  evidence: z.string().trim().min(8).max(5000),
  autoPublish: z.boolean().optional(),
}).strict();

function validDate(value: string) {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Stockholm" });
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value && value <= today;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const parsed = inputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success || !validDate(parsed.data.date)) {
    return NextResponse.json({ error: "Fyll i kanal, namn, datum och underlag för beskedet." }, { status: 400 });
  }
  const { action, source, name, date, evidence, autoPublish } = parsed.data;
  const authorId = (session.user as { id?: string } | undefined)?.id ?? null;
  try {
    if (action === "withdraw") {
      const withdrawn = await withdrawPublishConsent({ propertyId: id, source, name, evidence: `${date}: ${evidence}`, authorId });
      return withdrawn ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Ingen aktiv publicering eller registrerat medgivande finns." }, { status: 409 });
    }
    const stamped = await recordPublishConsent({ propertyIds: [id], source, name, acceptedAt: date, evidence, authorId, autoPublishEnabled: autoPublish });
    if (!stamped.length) return NextResponse.json({ error: "Ett medgivande finns redan registrerat för bostaden." }, { status: 409 });
    schedulePropertyReview(id);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof PublicationConsentScopeError) return NextResponse.json({ error: "Bostaden finns inte." }, { status: 404 });
    throw error;
  }
}

export const maxDuration = 300;
