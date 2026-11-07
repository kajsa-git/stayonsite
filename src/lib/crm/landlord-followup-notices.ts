import { and, eq, isNull } from "drizzle-orm";
import { db } from "./db";
import { sendLandlordFollowUpQuestion } from "./landlord-dialog-alerts";
import { landlordDialogs, landlordReplyRuns, landlordSmsDialogs, landlordSmsRuns, outboxMessages } from "./schema";

// The existing CRM rule requires asking Kajsa what to do with the open
// landlord follow-up after a response. The notice does not change its status.
export async function sendPendingLandlordFollowUpQuestions(channel: "mejl" | "sms"): Promise<number> {
  if (channel === "mejl") {
    const rows = await db.select({ id: landlordReplyRuns.gmailMessageId, propertyId: landlordDialogs.propertyId })
      .from(landlordReplyRuns).innerJoin(landlordDialogs, eq(landlordReplyRuns.dialogId, landlordDialogs.id))
      .where(and(eq(landlordReplyRuns.status, "sent"), isNull(landlordReplyRuns.followUpNoticeSentAt))).limit(20);
    for (const row of rows) {
      await sendLandlordFollowUpQuestion(row.propertyId, channel, row.id);
      await db.update(landlordReplyRuns).set({ followUpNoticeSentAt: new Date().toISOString() })
        .where(and(eq(landlordReplyRuns.gmailMessageId, row.id), isNull(landlordReplyRuns.followUpNoticeSentAt)));
    }
    return rows.length;
  }
  const rows = await db.select({ id: landlordSmsRuns.inboxGuid, propertyId: landlordSmsDialogs.propertyId })
    .from(landlordSmsRuns).innerJoin(landlordSmsDialogs, eq(landlordSmsRuns.dialogId, landlordSmsDialogs.id))
    .innerJoin(outboxMessages, eq(landlordSmsRuns.outboxId, outboxMessages.id))
    .where(and(eq(outboxMessages.status, "sent"), isNull(landlordSmsRuns.followUpNoticeSentAt))).limit(20);
  for (const row of rows) {
    await sendLandlordFollowUpQuestion(row.propertyId, channel, row.id);
    await db.update(landlordSmsRuns).set({ followUpNoticeSentAt: new Date().toISOString() })
      .where(and(eq(landlordSmsRuns.inboxGuid, row.id), isNull(landlordSmsRuns.followUpNoticeSentAt)));
  }
  return rows.length;
}
