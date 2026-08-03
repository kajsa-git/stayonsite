import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { outboxMessages, searchIndex } from "../schema";
import { createTestDb, type TestDB } from "../test-db";
import { registerCrmTools } from "./index";
import { addNote, draftMessage } from "./tools-write";
import { companies, notes } from "../schema";

let db: TestDB;
let cleanup: () => void;

beforeEach(async () => {
  ({ db, cleanup } = await createTestDb("crm-mcptools"));
});

afterEach(() => cleanup());

const READ_TOOLS = [
  "crm_search",
  "crm_get_company",
  "crm_get_owner",
  "crm_get_property",
  "crm_get_request",
  "crm_get_contact",
  "crm_overview",
  "crm_today",
  "crm_queue_counts",
  "crm_queue_items",
  "crm_inbox",
  "crm_open_requests",
];
const WRITE_TOOLS = ["crm_add_note", "crm_add_property_note", "crm_set_follow_up", "crm_update_request_status", "crm_draft_message"];

type ToolRegistry = Record<string, { handler: (args: unknown, extra: unknown) => Promise<{ content: { text: string }[]; isError?: boolean }> }>;

function makeServer(opts?: Parameters<typeof registerCrmTools>[1]) {
  const server = new McpServer({ name: "test", version: "0.0.0" });
  registerCrmTools(server, opts);
  const tools = (server as unknown as { _registeredTools: ToolRegistry })._registeredTools;
  return { server, tools };
}

describe("registerCrmTools", () => {
  it("registrerar alla läsverktyg men INGA skrivverktyg utan includeWrites", () => {
    const { tools } = makeServer({ db });
    for (const name of READ_TOOLS) expect(tools[name], name).toBeDefined();
    for (const name of WRITE_TOOLS) expect(tools[name], name).toBeUndefined();
  });

  it("registrerar skrivverktygen med includeWrites", () => {
    const { tools } = makeServer({ db, includeWrites: true });
    for (const name of [...READ_TOOLS, ...WRITE_TOOLS]) expect(tools[name], name).toBeDefined();
  });

  it("crm_search clampar limit server-side oavsett input", async () => {
    await db.insert(searchIndex).values(
      Array.from({ length: 60 }, (_, i) => ({
        id: `company:c${i}`,
        entityType: "company",
        entityId: `c${i}`,
        companyId: `c${i}`,
        title: `Acme ${i}`,
        subtitle: null,
        keywords: `acme bolag${i}`,
        route: `/crm/company/c${i}`,
      })),
    );
    const { tools } = makeServer({ db });
    const result = await tools.crm_search.handler({ q: "acme", limit: 500 }, {});
    const hits = JSON.parse(result.content[0].text) as unknown[];
    expect(hits.length).toBeLessThanOrEqual(50);
  });

  it("crm_get_company svarar med isError för okänt id", async () => {
    const { tools } = makeServer({ db });
    const result = await tools.crm_get_company.handler({ id: "finns-ej" }, {});
    expect(result.isError).toBe(true);
  });

  it("crm_draft_message skapar UTKAST (status draft, source mcp) — aldrig queued", async () => {
    const { tools } = makeServer({ db, includeWrites: true });
    const result = await tools.crm_draft_message.handler(
      { toPhone: "070-123 45 67", body: "Hej! Är huset ledigt i september?" },
      {},
    );
    expect(result.isError).toBeUndefined();
    const [row] = await db.select().from(outboxMessages);
    expect(row.status).toBe("draft");
    expect(row.source).toBe("mcp");
    expect(row.toPhone).toBe("+46701234567"); // E.164-normaliserat
  });
});

describe("skrivhandlers (direkta, med stubbar)", () => {
  it("addNote märker raden source=mcp och indexerar", async () => {
    await db.insert(companies).values([{ id: "c1", name: "Acme Bygg" }]);
    let indexed: string | null = null;
    const r = await addNote(
      { companyId: "c1", channel: "samtal", content: "Ringde om Boden-projektet" },
      { db, indexNote: async (id) => (indexed = id) },
    );
    expect(r.ok).toBe(true);
    const [row] = await db.select().from(notes);
    expect(row.source).toBe("mcp");
    expect(row.authorId).toBeNull();
    expect(indexed).toBe(row.id);
  });

  it("addNote nekar okänt företag (FK är av i libSQL — existenskoll krävs)", async () => {
    const r = await addNote({ companyId: "finns-ej", channel: "samtal", content: "x" }, { db });
    expect(r.ok).toBe(false);
    expect(await db.select().from(notes)).toHaveLength(0);
  });

  it("draftMessage nekar ogiltigt nummer och tom text", async () => {
    expect((await draftMessage({ toPhone: "banan", body: "Hej" }, { db })).ok).toBe(false);
    expect((await draftMessage({ toPhone: "+46701234567", body: "   " }, { db })).ok).toBe(false);
    expect(await db.select().from(outboxMessages)).toHaveLength(0);
  });
});
