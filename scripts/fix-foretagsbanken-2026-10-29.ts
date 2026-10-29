// Engångsstädning av företagsbanken 2026-10-29 (del 3 efter 2026-08-01). Idempotent.
// Samma regler som nya poster nu får (src/lib/crm/company-name.ts):
//   1. Namn: skrapade webbplatstitlar och HTML-entities → bolagsnamnet; versalskrik
//      och bolagsform skrivs rätt. Bara där domän/webbplats styrker namnet.
//   2. "Privat", "Nej", "000" … → "Privatperson · <namn/mejl>". Det ursprungliga
//      svaret sparas som anteckning på företaget.
//   3. "Webbförfrågan · gmail.com" (bara domänen) → hela mejladressen, som nya
//      poster redan får — annars går sex olika personer inte att skilja åt.
//   4. Org-nr → NNNNNN-NNNN; webbplats → https://…; saknad webbplats fylls från
//      kontaktens bolagsdomän när domänen liknar bolagsnamnet.
// Dubbletter, testposter och skräp ändras INTE här — de listas för beslut.
//
// Kör:   pnpm exec tsx --env-file=.env.local scripts/fix-foretagsbanken-2026-10-29.ts          (torrkörning)
//        pnpm exec tsx --env-file=.env.local scripts/fix-foretagsbanken-2026-10-29.ts --apply  (skriver + backup)
import fs from "node:fs";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../src/lib/crm/db";
import { companies, contacts, notes } from "../src/lib/crm/schema";
import { indexCompany } from "../src/lib/crm/search-index";
import { isFreemailDomain } from "../src/lib/crm/contact-intake";
import {
  isGeneratedCompanyLabel,
  isPlaceholderCompanyName,
  normalizeOrgNr,
  normalizeWebsite,
  privatePersonLabel,
} from "../src/lib/crm/company-name";

const apply = process.argv.includes("--apply");

// Domäner som aldrig ska bli webbplats (skräpförfrågan med påhittad adress).
const JUNK_DOMAINS = new Set(["googel.com"]);

// Verifierade namnrättningar. Kommentaren anger belägget.
const NAME_FIXES: Record<string, string> = {
  "ei0E3EeYJOc3XtD32g0Uw": "Sveda & Värk",                  // <title> på sveda-vark.se, entities + slogan
  "ysEHP4uYTdUau7Hw3_Vea": "SN Byggservice AB",             // "X &#8211; X"
  "1ah3uW7aA1JADleCsKYbq": "Prepipe",                       // "Etusivu | Prepipe" (Etusivu = Startsida)
  "a1pHOuJ18B65dNVQ6aARr": "Insolva Oy Ab",                 // slogan bort
  "743fB7GQLNrYubgFgZmrL": "Region Skåne",                  // "Access Denied" = felsida; kontakt @skane.se
  "DjxDjrqgXIQs4Gq5JK_Jd": "JAS Worldwide",                 // "jas"; kontakt @jas.com
  "9xlI5jqhmynRrQShd8MFa": "Peab",                          // "PeaB"
  "lrIOBVSKQR6oZ0gjg9hJr": "Nordic Apartrent",              // versalskrik; og:site_name Nordicapartrent
  "Bfwk79EapMZCViEm_ahBt": "Skonto Prefab",                 // versalskrik; skontoprefab.lv
  "lBZ7p_58VhRWqDO3y4Tug": "SB VA Anläggning AB",           // og:site_name på sbva-anlaggning.se
  "q-feX5H6uDed7uYiBNvCm": "Grandvia AB",                   // "ab"
  "WEIC3JiIQSw9fcI4VekJn": "Faisalus AB",                   // "Ab"
  "nvgVvgT2wr7Wwj6lEDaiG": "J2 Flytt & Transport AB",       // versal i namnled
  "V8C7tnGXQgPZ9L-11HvPB": "Lokala Hantverkarna i Sverige", // "i sverige"
};

// Platshållare i fältet "Företag" → privatperson. Listan är explicit och
// kontrolleras mot isPlaceholderCompanyName nedan.
const PRIVATE_IDS = [
  "3a936gSQQm9Qpl1iPP-yn", "pOgSQncMl0iHya-hEnqq-", "FThhuENOPpgAkQ0yrIhCV", "c9LF0mVuW5FkhepXMZf0V",
  "0BEhVMh9CqS_6C89P-rPK", "XU3zAI9HBnr_E20Srny8S", "gXDpgDuzDgTvFhxG_P-O7", "dUNA1ewVH2ZmATMuqbFlk",
  "7i2r2zBQhNog-XsspdaGV", "r92XFHOgzhGm9lMgqdXsp", "AtouxJNa0xeVl9lrVy1s_", "GniQA_VvbQYCMO8-7YRz2",
  "2Ow-Vtlp51WZWMusfb_aj", "wLQg4smvBDtmA8LuWYlmL", "1fSDwBHBq2_13DH7DoBGH", "w7HVmuGq92eNjZ0LJX2Rj",
  "Fy3w2VeasGrRE2IPL2dC2", "L922Blx5w_1GXt9JUKVij", "Qzc5J52nyhUkP0ejI-vMC",
];

function compact(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/\b(aktiebolag|ab|hb|kb|oy|uab|sia|ltd|limited|filial|sverige|sweden|group|gruppen)\b/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function domainMatchesName(domain: string, name: string): boolean {
  const label = compact(domain.split(".").slice(0, -1).join(""));
  const n = compact(name);
  if (label.length < 3 || n.length < 3) return false;
  return n.includes(label) || label.includes(n);
}

const allCompanies = await db.select().from(companies);
const allContacts = await db.select().from(contacts);
const contactsByCompany = new Map<string, typeof allContacts>();
for (const c of allContacts) {
  const list = contactsByCompany.get(c.companyId) ?? [];
  list.push(c);
  contactsByCompany.set(c.companyId, list);
}

type Change = { id: string; before: Partial<typeof companies.$inferSelect>; after: Record<string, string | null>; note?: string; why: string[] };
const changes: Change[] = [];

for (const company of allCompanies) {
  const cts = (contactsByCompany.get(company.id) ?? []).sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
  const primary = cts[0];
  const after: Record<string, string | null> = {};
  const why: string[] = [];
  let note: string | undefined;

  if (NAME_FIXES[company.id] && NAME_FIXES[company.id] !== company.name) {
    after.name = NAME_FIXES[company.id];
    why.push("namn");
  } else if (PRIVATE_IDS.includes(company.id) && !isGeneratedCompanyLabel(company.name)) {
    if (!isPlaceholderCompanyName(company.name)) throw new Error(`${company.id} "${company.name}" är ingen platshållare`);
    after.name = privatePersonLabel({ name: primary?.name, email: primary?.email, phone: primary?.phone });
    note = `Datastädning 2026-10-29: angivet i fältet Företag var "${company.name}". Namnet ändrat till "${after.name}".`;
    why.push("privatperson");
  } else {
    const m = company.name.match(/^Webbförfrågan · ([^@\s]+)$/);
    if (m && isFreemailDomain(m[1]) && primary?.email?.toLowerCase().endsWith(`@${m[1]}`)) {
      after.name = `Webbförfrågan · ${primary.email}`;
      why.push("platshållare med mejl");
    }
  }

  const orgNr = normalizeOrgNr(company.orgNr);
  if (orgNr !== (company.orgNr ?? null)) { after.orgNr = orgNr; why.push("org-nr"); }

  let website = normalizeWebsite(company.website);
  if (!website) {
    const domains = [...new Set(cts.map((c) => c.email?.split("@")[1]?.toLowerCase()).filter((d): d is string => !!d && !isFreemailDomain(d) && !JUNK_DOMAINS.has(d)))];
    const name = after.name ?? company.name;
    if (domains.length === 1 && domainMatchesName(domains[0], name)) {
      website = `https://${domains[0]}`;
      why.push("webbplats från mejldomän");
    }
  } else if (website !== company.website) {
    why.push("webbplats-format");
  }
  if (website !== (company.website ?? null)) after.website = website;

  if (Object.keys(after).length) {
    const before = Object.fromEntries(Object.keys(after).map((k) => [k, company[k as keyof typeof company]]));
    changes.push({ id: company.id, before, after, note, why });
  }
}

for (const c of changes) {
  const fields = Object.keys(c.after).map((k) => `${k}: ${JSON.stringify(c.before[k as keyof typeof c.before])} → ${JSON.stringify(c.after[k])}`);
  console.log(`${c.id}  [${c.why.join(", ")}]\n    ${fields.join("\n    ")}`);
}
const count = (w: string) => changes.filter((c) => c.why.includes(w)).length;
console.log(`\n${changes.length} företag ändras: namn ${count("namn")}, privatperson ${count("privatperson")}, platshållare ${count("platshållare med mejl")}, org-nr ${count("org-nr")}, webbplats ${count("webbplats från mejldomän")} nya + ${count("webbplats-format")} format.`);

if (!apply) {
  console.log("Torrkörning — inget skrivet. Lägg till --apply för att skriva.");
  process.exit(0);
}

const backupPath = "scripts/foretagsbanken-fix-2026-10-29-backup.json";
fs.writeFileSync(backupPath, JSON.stringify({ when: new Date().toISOString(), changes }, null, 2));
console.log(`Backup: ${backupPath}`);

const now = new Date().toISOString();
for (const c of changes) {
  await db.update(companies).set({ ...c.after, updatedAt: now }).where(eq(companies.id, c.id));
  if (c.note) await db.insert(notes).values({ id: nanoid(), companyId: c.id, channel: "anteckning", content: c.note, source: "crm" });
  await indexCompany(c.id);
}
console.log(`Klart: ${changes.length} företag uppdaterade och omindexerade.`);
process.exit(0);
