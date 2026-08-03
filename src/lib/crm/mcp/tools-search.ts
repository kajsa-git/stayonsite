import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { searchCrm } from "../search-query";
import { BASE_URL_NOTE, clampLimit, jsonContent, type DB } from "./shape";

export function registerSearchTools(server: McpServer, opts?: { db?: DB }) {
  server.registerTool(
    "crm_search",
    {
      title: "Search the CRM",
      description:
        "Global search across companies (kunder), contacts, requests (förfrågningar), " +
        "properties (objekt), owners (uthyrare) and notes. All terms must match (AND). " +
        `Returns compact hits with entityType, ids and a crmUrl. ${BASE_URL_NOTE}`,
      inputSchema: {
        q: z.string().min(2).describe("Search terms, e.g. a name, city, address or phone number"),
        limit: z.number().int().min(1).max(50).optional().describe("Max hits, default 20"),
      },
    },
    async ({ q, limit }) => {
      const rows = await searchCrm(q, { db: opts?.db, limit: clampLimit(limit, 20, 50) });
      return jsonContent(rows.map((r) => ({ ...r, crmUrl: r.route })));
    },
  );
}
