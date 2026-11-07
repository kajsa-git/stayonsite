import { and, eq, gt, isNull, lt, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "./db";
import { landlordPropertyLocks } from "./schema";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import type * as schema from "./schema";

type Connection = LibSQLDatabase<typeof schema>;

// Mail and SMS about the same property share context and must not compose
// replies simultaneously against different snapshots of the same history.
export async function acquireLandlordPropertyLock(propertyId: string, connection: Connection = db, leaseMs = 120_000): Promise<string | null> {
  const now = new Date(); const token = nanoid();
  await connection.insert(landlordPropertyLocks).values({ propertyId }).onConflictDoNothing();
  const [lock] = await connection.update(landlordPropertyLocks).set({ leaseToken: token, leaseUntil: new Date(now.getTime() + leaseMs).toISOString() })
    .where(and(eq(landlordPropertyLocks.propertyId, propertyId), or(isNull(landlordPropertyLocks.leaseUntil), lt(landlordPropertyLocks.leaseUntil, now.toISOString())))).returning();
  return lock ? token : null;
}

export async function renewLandlordPropertyLock(propertyId: string, token: string, connection: Connection = db, leaseMs = 120_000): Promise<boolean> {
  const now = new Date();
  const [held] = await connection.update(landlordPropertyLocks).set({ leaseUntil: new Date(now.getTime() + leaseMs).toISOString() })
    .where(and(eq(landlordPropertyLocks.propertyId, propertyId), eq(landlordPropertyLocks.leaseToken, token),
      gt(landlordPropertyLocks.leaseUntil, now.toISOString()))).returning({ propertyId: landlordPropertyLocks.propertyId });
  return Boolean(held);
}

export async function releaseLandlordPropertyLock(propertyId: string, token: string, connection: Connection = db): Promise<void> {
  await connection.update(landlordPropertyLocks).set({ leaseToken: null, leaseUntil: null })
    .where(and(eq(landlordPropertyLocks.propertyId, propertyId), eq(landlordPropertyLocks.leaseToken, token)));
}
