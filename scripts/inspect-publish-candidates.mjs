// Läser (read-only) ut objekt för ja-svaren + Arsim + KM Group/Rent Invest.
import { createClient } from "@libsql/client";
import fs from "node:fs";

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const YES_PHONES = [
  ["+46733545728", "Bettan Johansson"],
  ["+46722616545", "Sylvia"],
  ["+46722006676", "Elin Rubin"],
  ["+46705640122", "Johsn Henriksson"],
  ["+46762215951", "Surjit Shergill"],
  ["+46702233829", "Andreas Waaranperä"],
  ["+46735930246", "Per Wennberg"],
  ["+46705804416", "Martina"],
  ["+46706092839", "Gustav"],
  ["+46734185822", "Morgan Gustafsson"],
];
const ARSIM = "+46733169964";

async function propsForOwner(ownerId) {
  const r = await client.execute({
    sql: `SELECT id, address, city, postal_code, slug, public_name, published, status,
                 public_description IS NOT NULL AND length(public_description)>0 AS has_desc,
                 (SELECT COUNT(*) FROM crm_property_images pi WHERE pi.property_id = crm_properties.id) AS img_count
          FROM crm_properties WHERE owner_id = ? ORDER BY created_at`,
    args: [ownerId],
  });
  return r.rows;
}

const out = { yes: [], arsim: [], byName: [] };

for (const [phone, label] of YES_PHONES) {
  const o = await client.execute({
    sql: "SELECT id, name, phone FROM crm_owners WHERE phone = ?",
    args: [phone],
  });
  for (const owner of o.rows) {
    out.yes.push({ label, phone, owner: { id: owner.id, name: owner.name }, props: await propsForOwner(owner.id) });
  }
  if (o.rows.length === 0) out.yes.push({ label, phone, owner: null, props: [] });
}

const ao = await client.execute({ sql: "SELECT id, name FROM crm_owners WHERE phone = ?", args: [ARSIM] });
for (const owner of ao.rows) {
  out.arsim.push({ owner: { id: owner.id, name: owner.name }, props: await propsForOwner(owner.id) });
}

const named = await client.execute({
  sql: `SELECT id, name, phone FROM crm_owners
        WHERE name LIKE '%KM Group%' OR name LIKE '%KMGroup%' OR name LIKE '%Rent Invest%' OR name LIKE '%RentInvest%'`,
  args: [],
});
for (const owner of named.rows) {
  out.byName.push({ owner: { id: owner.id, name: owner.name, phone: owner.phone }, props: await propsForOwner(owner.id) });
}

console.log(JSON.stringify(out, null, 2));
