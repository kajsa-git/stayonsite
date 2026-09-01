import { and, eq, sql } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { nanoid } from "nanoid";
import { db as defaultDb } from "./db";
import { normalizePhoneE164 } from "./phone-links";
import * as schema from "./schema";
import { outboxMessages, type Owner } from "./schema";
import { homeownerLeadIntakeSms } from "./sms-templates";

type DB = LibSQLDatabase<typeof schema>;

export function isHomeownerLeadForm(formType: string): formType is "homeowner" | "lp-homeowner" {
  return formType === "homeowner" || formType === "lp-homeowner";
}

export function shouldQueueHomeownerLeadIntakeSms(opts: {
  formType: string;
  hasCrmOwner: boolean;
  customerEmail?: string | null;
}): boolean {
  return opts.hasCrmOwner && isHomeownerLeadForm(opts.formType);
}

export async function queueHomeownerLeadIntakeSms(opts: {
  owner: Pick<Owner, "id" | "phone"> | null;
  fallbackPhone?: string | null;
  db?: DB;
}): Promise<{ queued: boolean; messageId?: string; reason?: "missing_phone" | "duplicate_today" }> {
  const db = opts.db ?? defaultDb;
  const toPhone = normalizePhoneE164(opts.owner?.phone) ?? normalizePhoneE164(opts.fallbackPhone);
  if (!toPhone) return { queued: false, reason: "missing_phone" };

  const body = homeownerLeadIntakeSms();
  const [existing] = await db
    .select({ id: outboxMessages.id })
    .from(outboxMessages)
    .where(
      and(
        eq(outboxMessages.toPhone, toPhone),
        eq(outboxMessages.body, body),
        eq(outboxMessages.source, "intake"),
        sql`date(${outboxMessages.createdAt}) = date('now')`,
      ),
    )
    .limit(1);

  if (existing) return { queued: false, messageId: existing.id, reason: "duplicate_today" };

  const [row] = await db
    .insert(outboxMessages)
    .values({
      id: nanoid(),
      toPhone,
      body,
      status: "queued",
      ownerId: opts.owner?.id ?? null,
      source: "intake",
    })
    .returning({ id: outboxMessages.id });

  return { queued: true, messageId: row.id };
}
