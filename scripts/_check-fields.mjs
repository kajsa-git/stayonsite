import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
try {
  const envContent = readFileSync(resolve(ROOT, ".env"), "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
} catch {}
const res = await fetch("https://api.notion.com/v1/databases/2f6e0171-c36c-80cc-b90c-d9973b7c1d42", {
  headers: {
    Authorization: "Bearer " + process.env.NOTION_TOKEN,
    "Notion-Version": "2022-06-28",
  },
});
const db = await res.json();
console.log(Object.keys(db.properties).join("\n"));
