import { and, desc, eq, inArray } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { db as defaultDb } from "./db";
import * as schema from "./schema";
import { inboxMessages, outboxMessages } from "./schema";

type DB = LibSQLDatabase<typeof schema>;
type AgentReport = { ok: boolean; error?: string } | { delivered: true };
const timestamp = (value: string | null) => value ? Date.parse(value.includes("T") ? value : `${value.replace(" ", "T")}Z`) : NaN;

// Ett skickat svar markeras läst först när Mac-agenten rapporterar att det är
// skickat. En senare felrapport gör samma meddelande synligt igen. Ett senare
// lyckat svar på samma inkommande meddelande får aldrig återöppnas av ett äldre fel.
export async function reportMessageStatus(id: string, report: AgentReport, opts?: { db?: DB }) {
  const db = opts?.db ?? defaultDb;
  return db.transaction(async (tx) => {
    const [existing] = await tx.select().from(outboxMessages).where(eq(outboxMessages.id, id));
    if (!existing) return null;
    if ("delivered" in report) {
      if (existing.status !== "sent") return existing;
      const [row] = await tx.update(outboxMessages).set({ deliveredAt: new Date().toISOString() })
        .where(eq(outboxMessages.id, id)).returning();
      return row;
    }
    if (existing.status === "failed") return existing; // idempotent, återöppna inte en gammal felrapport

    const [row] = await tx.update(outboxMessages).set(report.ok
      ? { status: "sent", sentAt: new Date().toISOString(), error: null }
      : { status: "failed", deliveredAt: null, error: (report.error || "okänt fel").slice(0, 500) },
    ).where(eq(outboxMessages.id, id)).returning();

    const ids = existing.replyToInboxIds ?? [];
    if (ids.length) {
      let affected = ids;
      if (!report.ok) {
        const newer = await tx.select({ id: outboxMessages.id, sentAt: outboxMessages.sentAt, replyToInboxIds: outboxMessages.replyToInboxIds })
          .from(outboxMessages).where(and(eq(outboxMessages.toPhone, existing.toPhone), eq(outboxMessages.status, "sent")))
          .orderBy(desc(outboxMessages.createdAt));
        const previousAt = timestamp(existing.sentAt ?? existing.createdAt);
        const handledLater = new Set(newer.filter((m) => m.id !== id && timestamp(m.sentAt) > previousAt)
          .flatMap((m) => m.replyToInboxIds ?? []));
        affected = ids.filter((inboxId) => !handledLater.has(inboxId));
      }
      if (affected.length) await tx.update(inboxMessages).set({ isRead: report.ok })
        .where(and(inArray(inboxMessages.id, affected), eq(inboxMessages.fromPhone, existing.toPhone), eq(inboxMessages.direction, "in")));
    }
    return row;
  });
}
