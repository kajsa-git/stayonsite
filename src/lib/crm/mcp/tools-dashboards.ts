import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { computeWaitingEmails } from "../email-sync";
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
        "SMS drafts and renewal candidates. Landlord chasing includes rented properties due for availability checks; list those with crm_rental_reviews_due.",
    },
    async () => jsonContent(await computeQueueCounts({ db: opts?.db })),
  );

  server.registerTool(
    "crm_emails_waiting",
    {
      title: "Emails waiting for a reply",
      description:
        "Email threads from the last 14 days, linked to a company or landlord (uthyrare), where the " +
        "latest message is an unhandled incoming email — i.e. the customer or landlord wrote last. " +
        "Synced from Gmail every 15 minutes. Each row has the sender, subject, a short preview and the linked company/landlord.",
    },
    async () => jsonContent(await computeWaitingEmails({ db: opts?.db })),
  );
}
