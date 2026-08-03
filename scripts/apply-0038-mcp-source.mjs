// Engångsapplicering: source på crm_notes, crm_property_notes och
// crm_outbox_messages — spårar om raden skapades i CRM-UI:t ('crm') eller av en
// AI-agent via MCP-servern ('mcp'). Idempotent.
import { createClient } from "@libsql/client";
import fs from "node:fs";

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}
const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

for (const table of ["crm_notes", "crm_property_notes", "crm_outbox_messages"]) {
  const cols = await client.execute(`PRAGMA table_info(\`${table}\`)`);
  if (!cols.rows.some((r) => r.name === "source")) {
    await client.execute(`ALTER TABLE \`${table}\` ADD COLUMN \`source\` text NOT NULL DEFAULT 'crm'`);
    console.log(`apply-0038: source tillagd på ${table}`);
  } else {
    console.log(`apply-0038: source fanns redan på ${table}`);
  }
}
console.log("apply-0038: klar");
process.exit(0);
