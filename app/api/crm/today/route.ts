import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { companies, notes, propertyNotes, requests } from "@/lib/crm/schema";
import { NextResponse } from "next/server";

// Dagens aktivitet — kompakt sammanfattning för Min dag.
// Räknar det som hänt/gjorts IDAG (svensk tid): loggade noteringar, nya kunder,
// nya förfrågningar samt vunna/förlorade affärer. Samma datum-prefix-jämförelse
// som /api/crm/overview (robust mot UTC vs lokal lagring vid nuvarande skala).
export async function GET() {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [noteRows, companyRows, reqRows, propNoteRows] = await Promise.all([
    db.select({ createdAt: notes.createdAt, channel: notes.channel }).from(notes),
    db.select({ createdAt: companies.createdAt }).from(companies),
    db
      .select({ createdAt: requests.createdAt, status: requests.status, statusChangedAt: requests.statusChangedAt })
      .from(requests),
    db
      .select({ createdAt: propertyNotes.createdAt, channel: propertyNotes.channel, propertyId: propertyNotes.propertyId })
      .from(propertyNotes),
  ]);

  // "Idag" i svensk tid som YYYY-MM-DD.
  const sthlm = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Stockholm" }));
  const today = `${sthlm.getFullYear()}-${String(sthlm.getMonth() + 1).padStart(2, "0")}-${String(sthlm.getDate()).padStart(2, "0")}`;
  const day10 = (ts: string | null | undefined) => (ts ?? "").slice(0, 10);
  const isToday = (ts: string | null | undefined) => day10(ts) === today;

  const notesToday = noteRows.filter((n) => isToday(n.createdAt));
  const calls = notesToday.filter((n) => n.channel === "samtal").length;

  // Uthyrarkontakter loggade idag (crm_property_notes). "owners" = antal distinkta
  // objekt/uthyrare som hörts av; "ownerLogs" = totalt antal loggade kontakter.
  const propNotesToday = propNoteRows.filter((n) => isToday(n.createdAt));
  const owners = new Set(propNotesToday.map((n) => n.propertyId)).size;
  const ownerCalls = propNotesToday.filter((n) => n.channel === "samtal").length;

  return NextResponse.json({
    date: today,
    notes: notesToday.length,
    calls,
    owners,
    ownerLogs: propNotesToday.length,
    ownerCalls,
    newCompanies: companyRows.filter((c) => isToday(c.createdAt)).length,
    newRequests: reqRows.filter((r) => isToday(r.createdAt)).length,
    won: reqRows.filter((r) => (r.status === "won" || r.status === "invoiced") && isToday(r.statusChangedAt)).length,
    lost: reqRows.filter((r) => r.status === "lost" && isToday(r.statusChangedAt)).length,
  });
}
