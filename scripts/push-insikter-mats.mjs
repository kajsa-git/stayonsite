#!/usr/bin/env node
/**
 * push-insikter-mats.mjs
 * Creates "Insikter, Mats" parent page under Standups,
 * then pushes 3 sub-pages (insikter, pitch, strategisk analys).
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// --- Load .env ---
function loadEnv() {
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
}
loadEnv();

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const STANDUPS_PAGE_ID = process.env.NOTION_STANDUPS_PAGE_ID;

if (!NOTION_TOKEN || !STANDUPS_PAGE_ID) {
  console.error("Missing NOTION_TOKEN or NOTION_STANDUPS_PAGE_ID");
  process.exit(1);
}

const NOTION_API = "https://api.notion.com/v1";
const headers = {
  Authorization: `Bearer ${NOTION_TOKEN}`,
  "Notion-Version": "2022-06-28",
  "Content-Type": "application/json",
};

async function notionRequest(endpoint, body, method = "POST") {
  const res = await fetch(`${NOTION_API}${endpoint}`, { method, headers, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) {
    console.error("Notion API error:", JSON.stringify(data, null, 2));
    process.exit(1);
  }
  return data;
}

async function appendBlocks(pageId, blocks) {
  for (let i = 0; i < blocks.length; i += 100) {
    await notionRequest(`/blocks/${pageId}/children`, { children: blocks.slice(i, i + 100) }, "PATCH");
  }
}

// --- Markdown parser (same as push-to-notion.mjs) ---
function richText(text) {
  if (!text) return [];
  const segments = [];
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[(.+?)\]\((.+?)\)|([^*`\[]+)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match[1]) segments.push({ type: "text", text: { content: match[1] }, annotations: { bold: true } });
    else if (match[2]) segments.push({ type: "text", text: { content: match[2] }, annotations: { italic: true } });
    else if (match[3]) segments.push({ type: "text", text: { content: match[3] }, annotations: { code: true } });
    else if (match[4] && match[5]) segments.push({ type: "text", text: { content: match[4], link: { url: match[5] } } });
    else if (match[6]) segments.push({ type: "text", text: { content: match[6] } });
  }
  return segments.length ? segments : [{ type: "text", text: { content: text } }];
}

function parseTable(lines) {
  const rows = [];
  for (const line of lines) {
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.every((c) => /^[-:]+$/.test(c))) continue;
    rows.push(cells);
  }
  if (rows.length === 0) return [];
  const width = Math.max(...rows.map((r) => r.length));
  return [{
    type: "table",
    table: {
      table_width: width,
      has_column_header: true,
      has_row_header: false,
      children: rows.map((row) => ({
        type: "table_row",
        table_row: { cells: Array.from({ length: width }, (_, i) => richText(row[i] || "")) },
      })),
    },
  }];
}

function markdownToBlocks(md) {
  const lines = md.split("\n");
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") { i++; continue; }
    if (/^---+\s*$/.test(line.trim())) { blocks.push({ type: "divider", divider: {} }); i++; continue; }
    const headingMatch = line.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const type = `heading_${level}`;
      blocks.push({ type, [type]: { rich_text: richText(headingMatch[2].trim()) } });
      i++; continue;
    }
    if (line.trim().startsWith("|")) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) { tableLines.push(lines[i].trim()); i++; }
      blocks.push(...parseTable(tableLines));
      continue;
    }
    if (line.trim().startsWith(">")) {
      const quoteLines = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) { quoteLines.push(lines[i].trim().replace(/^>\s?/, "")); i++; }
      blocks.push({ type: "quote", quote: { rich_text: richText(quoteLines.join("\n")) } });
      continue;
    }
    const todoMatch = line.match(/^-\s+\[([ x])\]\s+(.*)/);
    if (todoMatch) {
      blocks.push({ type: "to_do", to_do: { rich_text: richText(todoMatch[2]), checked: todoMatch[1] === "x" } });
      i++; continue;
    }
    if (line.match(/^[-*]\s+/)) {
      blocks.push({ type: "bulleted_list_item", bulleted_list_item: { rich_text: richText(line.replace(/^[-*]\s+/, "").trim()) } });
      i++; continue;
    }
    const numberedMatch = line.match(/^\d+\.\s+(.*)/);
    if (numberedMatch) {
      blocks.push({ type: "numbered_list_item", numbered_list_item: { rich_text: richText(numberedMatch[1]) } });
      i++; continue;
    }
    blocks.push({ type: "paragraph", paragraph: { rich_text: richText(line.trim()) } });
    i++;
  }
  return blocks;
}

// --- Create a page ---
async function createPage(parentId, title, emoji, mdContent) {
  const page = await notionRequest("/pages", {
    parent: { page_id: parentId },
    icon: { type: "emoji", emoji },
    properties: { title: [{ text: { content: title } }] },
  });
  console.log(`  Created: "${title}" → ${page.url}`);

  const bodyMd = mdContent.replace(/^#\s+.+\n?/, "");
  const blocks = markdownToBlocks(bodyMd);
  if (blocks.length > 0) {
    await appendBlocks(page.id, blocks);
    console.log(`  Added ${blocks.length} blocks`);
  }
  return page;
}

// --- Main ---
async function main() {
  console.log("Creating parent page: Insikter, Mats...\n");

  // 1. Create parent page under Standups
  const parent = await notionRequest("/pages", {
    parent: { page_id: STANDUPS_PAGE_ID },
    icon: { type: "emoji", emoji: "\uD83D\uDCA1" },
    properties: { title: [{ text: { content: "Insikter, Mats" } }] },
  });
  console.log(`Parent created: ${parent.url}\n`);

  // Add a short intro to the parent page
  await appendBlocks(parent.id, [
    { type: "callout", callout: {
      rich_text: richText("Insikter från kundsamtal med Mats Johansson, BS Logistics. Sammanställt 2026-02-08 efter möte mellan David och Kajsa."),
      icon: { type: "emoji", emoji: "\uD83D\uDCCB" },
    }},
    { type: "paragraph", paragraph: { rich_text: richText("Tre undersidor med komplett dokumentation:") } },
    { type: "bulleted_list_item", bulleted_list_item: { rich_text: richText("**Kundinsikter** — Allt från samtalet strukturerat") } },
    { type: "bulleted_list_item", bulleted_list_item: { rich_text: richText("**Kundpitch** — 1-2 A4, redo att skicka till kunder") } },
    { type: "bulleted_list_item", bulleted_list_item: { rich_text: richText("**Strategisk analys** — Agentteamets diskussion och rekommendationer") } },
  ]);

  // 2. Create sub-pages
  const files = [
    { file: "docs/mats-insikter-2026-02-08.md", title: "Kundinsikter: BS Logistics / Mats Johansson", emoji: "\uD83D\uDCDD" },
    { file: "docs/kundpitch-ramavtal-2026-02-08.md", title: "Kundpitch: Ramavtal — Boendelösning för företag", emoji: "\uD83C\uDFAF" },
    { file: "docs/strategisk-analys-2026-02-08.md", title: "Strategisk analys: Ramavtalsmodellen", emoji: "\uD83D\uDE80" },
  ];

  for (const { file, title, emoji } of files) {
    const md = readFileSync(resolve(ROOT, file), "utf-8");
    await createPage(parent.id, title, emoji, md);
  }

  console.log("\nDone! ✓ Alla 3 undersidor skapade under 'Insikter, Mats'");
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
