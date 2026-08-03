import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { computeOverview } from "../overview";
import { computeQueueCounts } from "../queue-counts";
import { computeToday } from "../today";
import { jsonContent, type DB } from "./shape";

export function registerDashboardTools(server: McpServer, opts?: { db?: DB }) {
  server.registerTool(
    "crm_overview",
    {
      title: "Dashboard overview",
      description:
        "Business overview: open deals (öppna förfrågningar) with estimated order value, " +
        "plus won/lost/new counts for the current week and month (Swedish time).",
    },
    async () => jsonContent(await computeOverview({ db: opts?.db })),
  );

  server.registerTool(
    "crm_today",
    {
      title: "Today's activity",
      description:
        "What has happened today (Swedish time): logged notes and calls, landlord contacts " +
        "(uthyrarkontakter), new companies, new requests, won and lost deals.",
    },
    async () => jsonContent(await computeToday({ db: opts?.db })),
  );

  server.registerTool(
    "crm_queue_counts",
    {
      title: "Work queue counts",
      description:
        "Badge counts for the work queues: due follow-ups (återkomster), open deals without " +
        "follow-up, to-invoice, landlord chasing, move-ins/outs due, unread replies, pending " +
        "SMS drafts and renewal candidates.",
    },
    async () => jsonContent(await computeQueueCounts({ db: opts?.db })),
  );
}
