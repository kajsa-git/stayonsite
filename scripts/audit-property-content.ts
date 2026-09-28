// Audit without publication or messages. Resume caches are written only with
// --local-cache against an explicit file: database.
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { desc, eq } from "drizzle-orm";
import { db } from "../src/lib/crm/db";
import { properties } from "../src/lib/crm/schema";
import { inspectPropertyContent } from "../src/lib/crm/property-content-review";

let rows = await db.select({ id: properties.id, address: properties.address }).from(properties).orderBy(desc(properties.published), properties.id);
const output = process.argv[2] || "tmp/property-review-audit.json";
await mkdir(output.slice(0, output.lastIndexOf("/")) || ".", { recursive: true });
const results: Record<string, unknown>[] = [];
try {
  const previous = JSON.parse(await readFile(output, "utf8"));
  for (const entry of previous) {
    if (!entry.report) continue;
    if (process.argv.includes("--local-cache")) {
      if (!process.env.TURSO_DATABASE_URL?.startsWith("file:")) throw new Error("Cache resume requires a local file database.");
      await db.update(properties).set({ contentReviewReport: entry.report }).where(eq(properties.id, entry.id));
    }
    if (entry.report.reasons.length === 0 || entry.report.images.length === 0) results.push(entry);
  }
  rows = rows.filter((row) => !results.some((entry) => entry.id === row.id));
} catch { /* first audit */ }
const total = rows.length + results.length;
let cursor = 0;
let flush = Promise.resolve();
async function worker() {
  while (cursor < rows.length) {
    const row = rows[cursor++];
    try {
      const result = await inspectPropertyContent(row.id);
      results.push({ id: row.id, address: row.address, sourceHash: result.sourceHash, values: result.values, report: result.report });
      console.log(JSON.stringify({ completed: results.length, total, address: row.address, status: result.report.reasons.length ? "needs_review" : "approved", reasons: result.report.reasons }));
    } catch (error) {
      results.push({ id: row.id, address: row.address, error: error instanceof Error ? error.message : String(error) });
      console.log(JSON.stringify({ completed: results.length, total, address: row.address, status: "error" }));
    }
    const snapshot = JSON.stringify(results, null, 2);
    flush = flush.then(() => writeFile(output, snapshot));
    await flush;
  }
}
await Promise.all(Array.from({ length: 4 }, worker));
await flush;
console.log(JSON.stringify({ total, approved: results.filter((r) => r.report && !(r.report as { reasons: string[] }).reasons.length).length, errors: results.filter((r) => r.error).length, output }));
