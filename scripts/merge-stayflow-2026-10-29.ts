// Slår ihop tre Stayflow-poster till Stayflow AB (559506-6035), godkänt av
// Kajsa 2026-10-29. Alla barnrader (kontakter, förfrågningar, anteckningar,
// mejl, inkorg, kvalificeringar, avtal, debitering) flyttas till huvudposten;
// sedan raderas dubbletterna och deras sökindex. Idempotent, backup först.
//
// Kör:   pnpm exec tsx --env-file=.env.local scripts/merge-stayflow-2026-10-29.ts          (torrkörning)
//        pnpm exec tsx --env-file=.env.local scripts/merge-stayflow-2026-10-29.ts --apply
import fs from "node:fs";
import { eq, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../src/lib/crm/db";
import {
  agreementAcceptances, billingPlans, companies, contacts, emails, inboxMessages,
  notes, requestQualifications, requests, searchIndex,
} from "../src/lib/crm/schema";
import { indexCompany } from "../src/lib/crm/search-index";

const apply = process.argv.includes("--apply");
const KEEP = "E3J23pTojRP3jXScOLZHc"; // Stayflow AB, org-nr + Örebro
const DUPES = ["37c-YQKkXXxa0xoF3pUS4", "qTuflFqFLJe-yz6oiGSBX"];

const CHILD_TABLES = [
  ["contacts", contacts], ["requests", requests], ["notes", notes], ["requestQualifications", requestQualifications],
  ["emails", emails], ["inboxMessages", inboxMessages], ["agreementAcceptances", agreementAcceptances], ["billingPlans", billingPlans],
] as const;

const [keep] = await db.select().from(companies).where(eq(companies.id, KEEP));
if (!keep) throw new Error("Huvudposten saknas");
const dupes = await db.select().from(companies).where(inArray(companies.id, DUPES));
if (dupes.length === 0) {
  console.log("Inget att slå ihop — redan gjort.");
  process.exit(0);
}

const backup: Record<string, unknown> = { when: new Date().toISOString(), keep, dupes };
for (const [label, table] of CHILD_TABLES) {
  const rows = await db.select().from(table).where(inArray(table.companyId, DUPES));
  backup[label] = rows;
  console.log(`${label}: ${rows.length} rad(er) flyttas`);
}
console.log(`Huvudpost: ${keep.name} (${keep.orgNr}). Dubbletter: ${dupes.map((d) => `"${d.name}"`).join(", ")}`);

if (!apply) {
  console.log("Torrkörning — inget skrivet. Lägg till --apply för att skriva.");
  process.exit(0);
}

const backupPath = "scripts/merge-stayflow-2026-10-29-backup.json";
fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
console.log(`Backup: ${backupPath}`);

await db.transaction(async (tx) => {
  for (const [, table] of CHILD_TABLES) {
    await tx.update(table).set({ companyId: KEEP }).where(inArray(table.companyId, DUPES));
  }
  await tx.insert(notes).values({
    id: nanoid(),
    companyId: KEEP,
    channel: "anteckning",
    content: `Datastädning 2026-10-29: dubblettposterna ${dupes.map((d) => `"${d.name}"`).join(" och ")} sammanslagna hit (kontakter, förfrågningar och historik flyttade).`,
    source: "crm",
  });
  await tx.delete(searchIndex).where(inArray(searchIndex.entityId, DUPES));
  await tx.delete(companies).where(inArray(companies.id, DUPES));
});
// Barnens index bär company_id + företagsnamn → bygg om allt under huvudposten.
await indexCompany(KEEP);
console.log("Klart: Stayflow sammanslaget.");
process.exit(0);
