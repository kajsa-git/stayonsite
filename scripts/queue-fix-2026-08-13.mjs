// "Följ upp uthyrare"-fixen 2026-08-13: skapa saknade fristående uthyrarlänkar
// (idempotent — befintlig aktiv länk återanvänds) + lägg SMS-UTKAST per ägare
// med din sida-länken och bildförfrågan där bilder saknas. INGET skickas —
// utkasten godkänns i Utkast-panelen. Dubblett-ägare (Hübel) får ETT utkast.
// Backup av skapade rader → scripts/queue-fix-2026-08-13-log.json
import { createClient } from "@libsql/client";
import { nanoid } from "nanoid";
import fs from "node:fs";

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}
const c = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Stockholm" });

const rows = (await c.execute({
  sql: `SELECT DISTINCT ow.id AS ownerId, ow.name, ow.phone,
        (SELECT count(*) FROM crm_agreement_acceptances a WHERE a.owner_id = ow.id AND a.agreement_type = 'uthyrningsuppdrag' AND a.version = '2026-07-16.8') AS signed,
        (SELECT max(CASE WHEN (SELECT count(*) FROM crm_property_images i WHERE i.property_id = p2.id) > 0 THEN 1 ELSE 0 END)
          FROM crm_owner_outreach o2 JOIN crm_properties p2 ON p2.id = o2.property_id
          WHERE p2.owner_id = ow.id AND o2.concluded_at IS NULL) AS hasImages
        FROM crm_owner_outreach o
        JOIN crm_properties p ON p.id = o.property_id
        JOIN crm_owners ow ON ow.id = p.owner_id
        WHERE o.concluded_at IS NULL AND o.next_follow_up_date <= ? AND ow.phone IS NOT NULL`,
  args: [today],
})).rows;

const firstName = (n) => {
  const f = (n ?? "").trim().split(/\s+/)[0] ?? "";
  return f.length >= 2 ? f[0].toUpperCase() + f.slice(1) : null;
};
const greet = (n) => (firstName(n) ? `Hej ${firstName(n)}!` : "Hej!");

const log = { createdLinks: [], drafts: [], skipped: [] };

for (const r of rows) {
  // 1) Säkerställ fristående uthyrarlänk (idempotent).
  let token;
  const existing = await c.execute({
    sql: "SELECT token FROM crm_share_links WHERE owner_id = ? AND audience = 'landlord' AND match_id IS NULL AND revoked_at IS NULL LIMIT 1",
    args: [r.ownerId],
  });
  if (existing.rows.length) {
    token = existing.rows[0].token;
  } else {
    token = nanoid(32);
    const id = nanoid();
    await c.execute({
      sql: "INSERT INTO crm_share_links (id, token, audience, owner_id, created_by) VALUES (?, ?, 'landlord', ?, NULL)",
      args: [id, token, r.ownerId],
    });
    log.createdLinks.push({ id, ownerId: r.ownerId, name: r.name });
  }

  // 2) Bygg SMS-texten utifrån vad som saknas. Länk utan https:// (smishing-filtren).
  const url = `www.stayonsite.se/uthyrare/${token}`;
  const needsPhotos = !r.hasImages;
  const needsSign = !r.signed;
  const steg = needsSign
    ? `På din sida kan du godkänna att annonsen visas online och signera uppdraget (kostnadsfritt, inte exklusivt): ${url}`
    : `Det enda som saknas är ditt ok att visa annonsen online — ett klick här: ${url}`;
  const bilder = needsPhotos
    ? " Svara gärna med 3–5 bilder på boendet (vardagsrum, kök, sovrum, badrum) direkt i den här tråden."
    : "";
  const body = `${greet(r.name)} Tack för din registrering hos StayOnSite 😊 ${steg}${bilder}\n/Kajsa, StayOnSite`;

  // 3) Utkast — dubblettskydd: hoppa om ett oskickat utkast till numret redan finns.
  const pending = await c.execute({
    sql: "SELECT id FROM crm_outbox_messages WHERE to_phone = ? AND status IN ('draft','queued') LIMIT 1",
    args: [r.phone],
  });
  if (pending.rows.length) {
    log.skipped.push({ name: r.name, phone: r.phone, reason: "oskickat meddelande finns redan" });
    continue;
  }
  const draftId = nanoid();
  await c.execute({
    sql: "INSERT INTO crm_outbox_messages (id, to_phone, body, status, owner_id, source) VALUES (?, ?, ?, 'draft', ?, 'crm')",
    args: [draftId, r.phone, body, r.ownerId],
  });
  log.drafts.push({ id: draftId, name: r.name, phone: r.phone, needsPhotos, needsSign, body });
}

fs.writeFileSync("scripts/queue-fix-2026-08-13-log.json", JSON.stringify(log, null, 2));
console.log(`Länkar skapade: ${log.createdLinks.length}`);
console.log(`Utkast skapade: ${log.drafts.length}`);
console.log(`Hoppade över: ${log.skipped.length}${log.skipped.length ? " — " + log.skipped.map((s) => `${s.name} (${s.reason})`).join(", ") : ""}`);
for (const d of log.drafts) console.log(`\n--- ${d.name} (${d.phone})${d.needsPhotos ? " +bilder" : ""}${d.needsSign ? " +signering" : ""}\n${d.body}`);
process.exit(0);
