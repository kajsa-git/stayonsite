import { eq } from "drizzle-orm";
import { landlordDialogs, landlordSmsDialogs } from "./schema";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import type * as schema from "./schema";

// The generic reply engine and enrollment use the same lease. A paused
// landlord dialog remains reserved: pausing must not hand it to another bot.
// Prefixes cannot collide with the nanoid property IDs in this lock table.
export function landlordConversationLockKey(channel: "sms" | "whatsapp" | "email", address: string, threadId: string | null): string | null {
  if (channel === "sms" && address) return `channel:sms:${address}`;
  if (channel === "email" && threadId) return `channel:email:${threadId}`;
  return null;
}

export async function isLandlordConversationReserved(connection: LibSQLDatabase<typeof schema>, channel: "sms" | "whatsapp" | "email", address: string, threadId: string | null): Promise<boolean> {
  if (channel === "sms" && address) {
    const rows = await connection.select({ id: landlordSmsDialogs.id }).from(landlordSmsDialogs).where(eq(landlordSmsDialogs.phone, address)).limit(1);
    return rows.length > 0;
  }
  if (channel === "email" && threadId) {
    const rows = await connection.select({ id: landlordDialogs.id }).from(landlordDialogs).where(eq(landlordDialogs.gmailThreadId, threadId)).limit(1);
    return rows.length > 0;
  }
  return false;
}
