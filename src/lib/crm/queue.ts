import { asc, eq, inArray, lte, sql } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { todayStockholm } from "@/lib/crm/date";
import { db as defaultDb } from "@/lib/crm/db";
import { hasSignedMoveInContract } from "@/lib/crm/move-checklists";
import * as schema from "@/lib/crm/schema";
import { companies, requests } from "@/lib/crm/schema";

type DB = LibSQLDatabase<typeof schema>;

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

export const VALID_QUEUES = ["followups", "incoming", "matching", "agreement", "won"] as const;

const REQUEST_QUEUE_LABEL: Record<string, string> = {
  incoming: "Ny förfrågan",
  matching: "Pågående matchning",
  agreement: "Avtal",
  won: "Att fakturera",
};

export function isValidQueue(queue: string | null | undefined): queue is (typeof VALID_QUEUES)[number] {
  return !!queue && (VALID_QUEUES as readonly string[]).includes(queue);
}

// Single source of truth for the navigable work-mode queues (used by the
// /api/crm/queue-items route AND the work page server component).
export async function fetchQueueItems(queue: string, opts?: { db?: DB }): Promise<QueueItem[]> {
  const db = opts?.db ?? defaultDb;
  // Svensk kalenderdag, samma som queue-counts — annars glider kön och
  // badge-räknaren isär mellan midnatt och 01/02 svensk tid.
  const today = todayStockholm();

  if (queue === "followups") {
    const rows = await db
      .select()
      .from(companies)
      .where(lte(companies.followUpDate, today))
      .orderBy(asc(companies.followUpDate), sql`${companies.followUpTime} ASC NULLS LAST`);
    return rows.map((c) => {
      const when = c.followUpDate === today ? "Återkomst idag" : `Återkomst ${c.followUpDate}`;
      return {
        itemId: c.id,
        companyId: c.id,
        companyName: c.name,
        requestId: null,
        statusLabel: c.followUpTime ? `${when} kl. ${c.followUpTime}` : when,
      };
    });
  }

  const status = queue === "agreement" ? "won" : REQUEST_QUEUE_STATUS[queue];
  if (!status) return [];

  const rows = await db
    .select()
    .from(requests)
    .where(eq(requests.status, status))
    .orderBy(sql`${requests.statusChangedAt} ASC NULLS LAST`);
  const reqs =
    queue === "agreement"
      ? rows.filter((r) => !hasSignedMoveInContract(r.moveInChecklist))
      : queue === "won"
        ? rows.filter((r) => hasSignedMoveInContract(r.moveInChecklist))
        : rows;
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
