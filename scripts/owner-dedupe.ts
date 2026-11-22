// Provkörning: visar vilka uthyrare som skulle slås ihop. Med --apply slås de ihop.
//   pnpm dlx tsx scripts/owner-dedupe.ts          (bara visa)
//   pnpm dlx tsx scripts/owner-dedupe.ts --apply  (slå ihop)
// Läser TURSO_DATABASE_URL och TURSO_AUTH_TOKEN från .env.local.
import fs from "node:fs";

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}

const { runOwnerDedupe } = await import("../src/lib/crm/owner-dedupe");
const apply = process.argv.includes("--apply");
const result = await runOwnerDedupe({ apply });
for (const group of result.groups) {
  console.log(group.map((o) => `${o.name} | ${o.phone ?? "-"} | ${o.email ?? "-"} [${o.id}]`).join("\n  = "));
  console.log("");
}
console.log(`${result.groups.length} grupper${apply ? `, ${result.merged.length} sammanslagna` : " (inget ändrat, kör med --apply för att slå ihop)"}`);
process.exit(0);
