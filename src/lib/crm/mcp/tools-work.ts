import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { listInbox } from "../inbox-list";
import { listOpenRequests } from "../open-requests";
import { fetchQueueItems, VALID_QUEUES } from "../queue";
import { BASE_URL_NOTE, clampLimit, crmRoute, jsonContent, truncate, type DB } from "./shape";

export function registerWorkTools(server: McpServer, opts?: { db?: DB }) {
  server.registerTool(
    "crm_queue_items",
    {
      title: "Work queue items",
      description:
        "Items in a work queue: followups (dagens återkomster), incoming (nya förfrågningar), " +
        `matching (pågående matchning), agreement (avtal) or won (att fakturera). ${BASE_URL_NOTE}`,
      inputSchema: {
        queue: z.enum(VALID_QUEUES),
        limit: z.number().int().min(1).max(100).optional().describe("Max items, default 30"),
      },
    },
    async ({ queue, limit }) => {
      const items = await fetchQueueItems(queue, { db: opts?.db });
      return jsonContent(
        items.slice(0, clampLimit(limit, 30, 100)).map((i) => ({ ...i, crmUrl: crmRoute.company(i.companyId) })),
      );
    },
  );

  server.registerTool(
    "crm_inbox",
    {
      title: "Message inbox",
      description:
        "Incoming iMessage/SMS replies from landlords (uthyrare) and contacts, enriched with " +
        "names and the last message we sent to that number (what they are replying to).",
      inputSchema: {
        unreadOnly: z.boolean().optional().describe("Only unread incoming replies"),
        limit: z.number().int().min(1).max(50).optional().describe("Max messages, default 20"),
      },
    },
    async ({ unreadOnly, limit }) => {
      const rows = await listInbox({ unreadOnly, limit: clampLimit(limit, 20, 50), db: opts?.db });
      return jsonContent(
        rows.map((r) => ({
          ...r,
          body: truncate(r.body, 500),
          repliedTo: r.repliedTo ? { ...r.repliedTo, body: truncate(r.repliedTo.body, 500) } : null,
          crmUrl: r.ownerId ? crmRoute.owner(r.ownerId) : r.companyId ? crmRoute.company(r.companyId) : null,
        })),
      );
    },
  );

  server.registerTool(
    "crm_open_requests",
    {
      title: "Open requests",
      description:
        "Open housing requests (öppna förfrågningar, status incoming/matching) — someone is " +
        `looking for project housing. Optionally filter by company name or city. ${BASE_URL_NOTE}`,
      inputSchema: {
        q: z.string().optional().describe("Filter on company name or city"),
        limit: z.number().int().min(1).max(50).optional().describe("Max requests, default 25"),
      },
    },
    async ({ q, limit }) => {
      const rows = await listOpenRequests({ q, limit: clampLimit(limit, 25, 50), db: opts?.db });
      return jsonContent(rows.map((r) => ({ ...r, crmUrl: crmRoute.company(r.companyId) })));
    },
  );
}
