// Länk-SMS till ja-svaren från kampanjen 2026-07-06 (efter publicering).
// Kör i FÖRGRUNDEN från repo-roten (osascript kräver Automation-behörighet):
//   node scripts/send-link-sms-2026-07-06.mjs
// Stoppar vid första fel. Loggar varje utskick i crm_property_notes (kanal "sms").
import { createClient } from "@libsql/client";
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}
const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const RECIPIENTS = [
  { firstName: "Bettan", phone: "+46733545728", propertyId: "ba5_qzJAJnhSJsXLR35rV", slug: "foretagsboende-monsteras-4-sovrum" },
  { firstName: "Sylvia", phone: "+46722616545", propertyId: "0x4utFbFl66htdAreLs5h", slug: "foretagsboende-vasteras-4-sovrum-2" },
  { firstName: "Elin", phone: "+46722006676", propertyId: "Lqa4mBpClik5A_xZxWomC", slug: "foretagsboende-boden-6-sovrum-6" },
  { firstName: "Johan", phone: "+46705640122", propertyId: "OpsqfLecrFiZFJacyfwi8", slug: "foretagsboende-lulea-5-sovrum" },
  { firstName: "Surjit", phone: "+46762215951", propertyId: "cj5H6tCcjZUfIr8WIB__R", slug: "foretagsboende-vasterhaninge-1-sovrum" },
  { firstName: "Andreas", phone: "+46702233829", propertyId: "K9v_DxCgKpgXafdukfhGG", slug: "foretagsboende-lulea-4-sovrum-3" },
  { firstName: "Per", phone: "+46735930246", propertyId: "5BfA_eQN_l_jSn3tLzPzg", slug: "foretagsboende-stockholm-4-sovrum" },
  { firstName: "Martina", phone: "+46705804416", propertyId: "tqwTMiHCQYXRX_rEYSKKr", slug: "foretagsboende-staffanstorp-4-sovrum" },
  { firstName: "Gustav", phone: "+46706092839", propertyId: "rtBVXOHqd3Y9m-YkwLreq", slug: "foretagsboende-kiruna-4-sovrum-5" },
  { firstName: "Morgan", phone: "+46734185822", propertyId: "2g3fOkFZthr_4-OBlV2rO", slug: "foretagsboende-linkoping-4-sovrum" },
];

const buildBody = (r) =>
  `Hej ${r.firstName}! Tack för ditt svar 😊 Nu ligger ditt boende ute på vår hemsida: https://www.stayonsite.se/boenden/${r.slug}\nExakt adress visas inte publikt. Hör av dig om du vill ändra eller lägga till något. /Kajsa, StayOnSite`;

// Samma sändlogik som scripts/imessage-agent.mjs
function sendViaMessages(toPhone, body) {
  const esc = (s) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const script = `
tell application "Messages"
  set msgText to "${esc(body)}"
  try
    set svc to 1st account whose service type = iMessage and enabled is true
    send msgText to participant "${esc(toPhone)}" of svc
    return "iMessage"
  on error
    set smsSvc to 1st account whose service type = SMS and enabled is true
    send msgText to participant "${esc(toPhone)}" of smsSvc
    return "SMS"
  end try
end tell`;
  return execFileSync("osascript", ["-e", script], { encoding: "utf8", timeout: 120_000 }).trim();
}

const nanoid = () =>
  crypto.randomBytes(21).toString("base64url").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 21);

let sent = 0;
for (const r of RECIPIENTS) {
  const body = buildBody(r);
  let via;
  try {
    via = sendViaMessages(r.phone, body);
  } catch (e) {
    console.error(`STOPP efter ${sent} skickade — fel vid ${r.firstName} (${r.phone}): ${e?.message ?? e}`);
    process.exit(1);
  }
  await client.execute({
    sql: `INSERT INTO crm_property_notes (id, property_id, channel, content, created_at)
          VALUES (?, ?, 'sms', ?, datetime('now'))`,
    args: [nanoid(), r.propertyId, `Länk-SMS efter ja-svar (publicering): "${body}" — skickat via ${via}.`],
  });
  sent++;
  console.log(`${sent}/${RECIPIENTS.length} ${r.firstName} (${r.phone}) → skickat via ${via}`);
  await new Promise((res) => setTimeout(res, 1500));
}
console.log(`Klart: ${sent}/${RECIPIENTS.length} länk-SMS skickade och loggade.`);
