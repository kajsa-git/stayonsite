import { db } from "@/lib/crm/db";
import { companies, requests } from "@/lib/crm/schema";
import { asc, eq, inArray, lte, sql } from "drizzle-orm";

export type QueueItem = {
  itemId: string; // companyId always
  companyId: string;
  companyName: string;
  requestId: string | null;
  statusLabel: string;
};

// queue param → request status (request-based queues map 1:1)
export const REQUEST_QUEUE_STATUS: Record<string, string> = {
  incoming: "incoming",
  matching: "matching",
  won: "won",
};

export const VALID_QUEUES = ["followups", "incoming", "matching", "won"] as const;

const REQUEST_QUEUE_LABEL: Record<string, string> = {
  incoming: "Ny förfrågan",
  matching: "Pågående matchning",
  won: "Att fakturera",
};

export function isValidQueue(queue: string | null | undefined): queue is (typeof VALID_QUEUES)[number] {
  return !!queue && (VALID_QUEUES as readonly string[]).includes(queue);
}

// Single source of truth for the navigable work-mode queues (used by the
// /api/crm/queue-items route AND the work page server component).
export async function fetchQueueItems(queue: string): Promise<QueueItem[]> {
  const today = new Date().toISOString().split("T")[0];

  if (queue === "followups") {
    const rows = await db
      .select()
      .from(companies)
      .where(lte(companies.followUpDate, today))
      .orderBy(asc(companies.followUpDate));
    return rows.map((c) => ({
      itemId: c.id,
      companyId: c.id,
      companyName: c.name,
      requestId: null,
      statusLabel: c.followUpDate === today ? "Återkomst idag" : `Återkomst ${c.followUpDate}`,
    }));
  }

  const status = REQUEST_QUEUE_STATUS[queue];
  if (!status) return [];

  const reqs = await db
    .select()
    .from(requests)
    .where(eq(requests.status, status))
    .orderBy(sql`${requests.statusChangedAt} ASC NULLS LAST`);
  if (reqs.length === 0) return [];

  const companyIds = [...new Set(reqs.map((r) => r.companyId))];
  const companyRows = await db
    .select({ id: companies.id, name: companies.name })
    .from(companies)
    .where(inArray(companies.id, companyIds));
  const nameMap = Object.fromEntries(companyRows.map((c) => [c.id, c.name]));

  return reqs.map((r) => ({
    itemId: r.companyId,
    companyId: r.companyId,
    companyName: nameMap[r.companyId] ?? "Okänt bolag",
    requestId: r.id,
    statusLabel: `#${r.requestNumber} ${REQUEST_QUEUE_LABEL[queue] ?? ""}`,
  }));
}
