import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { computeReplyInbox, groupReplies, type MailReply, type SmsReply } from "./reply-inbox";
import * as schema from "./schema";
import { createTestDb, type TestDB } from "./test-db";

const { companies, contacts, emails, emailSenderSuggestions, inboxMessages, owners, requests } = schema;

function sms(over: Partial<SmsReply> & { id: string; sentAt: string }): SmsReply {
  return {
    fromPhone: "+46701234567", body: "Hej", service: "SMS", ownerId: null, contactId: null, companyId: null,
    ownerName: null, contactName: null, companyName: null, repliedTo: null, replyStatus: null, ...over,
  };
}

function mail(over: Partial<MailReply> & { key: string; sentAt: string }): MailReply {
  return {
    gmailThreadId: over.key, subject: "Ämne", fromEmail: "a@b.se", fromName: null, preview: "Text", messageCount: 1,
    unreadIds: [`${over.key}-1`], companyId: null, companyName: null, contactId: null, contactName: null,
    ownerId: null, ownerName: null, ...over,
  };
}

describe("groupReplies", () => {
  it("puts SMS and mail from the same person on one row, newest first", () => {
    const groups = groupReplies(
      [
        sms({ id: "s1", sentAt: "2026-11-07T08:00:00Z", body: "Ringer du?", contactId: "ct-anna", contactName: "Anna Berg", companyId: "co-1", companyName: "Bygg AB" }),
        sms({ id: "s2", sentAt: "2026-11-07T06:00:00Z", fromPhone: "+46709999999", body: "Bilderna kommer", ownerId: "ow-1", ownerName: "Sven Hus" }),
      ],
      [
        mail({ key: "t1", sentAt: "2026-11-07T09:00:00Z", preview: "Offerten ser bra ut", contactId: "ct-anna", contactName: "Anna Berg", companyId: "co-1", companyName: "Bygg AB", fromEmail: "anna@bygg.se" }),
        mail({ key: "t2", sentAt: "2026-11-06T09:00:00Z", fromEmail: "okand@x.se", fromName: "Okänd" }),
      ],
    );
    expect(groups.map((g) => [g.key, g.name, g.context, g.sms.length, g.mails.length])).toEqual([
      ["contact:ct-anna", "Anna Berg", "Bygg AB", 1, 1],
      ["owner:ow-1", "Sven Hus", "Uthyrare", 1, 0],
      ["unknown:okand@x.se", "Okänd", null, 0, 1],
    ]);
    expect(groups[0]).toMatchObject({ preview: "Offerten ser bra ut", phone: "+46701234567", email: "anna@bygg.se", latestAt: "2026-11-07T09:00:00Z" });
  });

  it("files a person who is both landlord and contact under the landlord", () => {
    const groups = groupReplies(
      [sms({ id: "s1", sentAt: "2026-11-07T08:00:00Z", ownerId: "ow-1", ownerName: "Lisa" })],
      [mail({ key: "t1", sentAt: "2026-11-07T09:00:00Z", ownerId: "ow-1", ownerName: "Lisa", companyId: "co-1", companyName: "El AB", contactId: "ct-1" })],
    );
    expect(groups).toHaveLength(1);
    expect(groups[0]).toMatchObject({ key: "owner:ow-1", companyId: "co-1", contactId: "ct-1", context: "El AB · även uthyrare" });
  });
});

describe("computeReplyInbox", () => {
  let db: TestDB;
  let cleanup: () => void;
  beforeEach(async () => {
    ({ db, cleanup } = await createTestDb("crm-reply-inbox"));
  });
  afterEach(() => cleanup());

  it("combines unread SMS and waiting mail with open-request counts and suggestion count", async () => {
    const now = new Date().toISOString();
    await db.insert(companies).values([{ id: "co-1", name: "Bygg AB" }, { id: "co-2", name: "Ny Kund AB" }]);
    await db.insert(contacts).values([
      { id: "ct-1", companyId: "co-1", name: "Anna", email: "anna@bygg.se", phone: "+46701234567" },
      { id: "ct-2", companyId: "co-2", name: "Bo", email: "bo@nykund.se" },
    ]);
    await db.insert(owners).values({ id: "ow-1", name: "Sven", phone: "+46709999999" });
    await db.insert(requests).values([
      { id: "r1", companyId: "co-1", status: "matching" },
      { id: "r2", companyId: "co-1", status: "lost" },
    ]);
    await db.insert(inboxMessages).values([
      { id: "i1", guid: "g1", fromPhone: "+46701234567", body: "Ringer du?", sentAt: now, contactId: "ct-1", companyId: "co-1" },
      { id: "i2", guid: "g2", fromPhone: "+46709999999", body: "JA", sentAt: now, ownerId: "ow-1" },
      { id: "i3", guid: "g3", fromPhone: "+46709999999", body: "läst", sentAt: now, ownerId: "ow-1", isRead: true },
    ]);
    await db.insert(emails).values({
      id: "e1", companyId: "co-2", contactId: "ct-2", direction: "in", subject: "Boende?", body: "Har ni något i Gävle?",
      fromEmail: "Bo <bo@nykund.se>", toEmail: "kajsa@stayonsite.se", gmailThreadId: "t1", gmailMessageId: "m1", isRead: false, sentAt: now,
    });
    await db.insert(emailSenderSuggestions).values({ id: "s1", email: "x@bygg.se", domain: "bygg.se", companyIds: ["co-1"], lastSeenAt: now });

    const inbox = await computeReplyInbox({ db });

    expect(inbox.suggestionCount).toBe(1);
    const byKey = Object.fromEntries(inbox.groups.map((g) => [g.key, g]));
    expect(Object.keys(byKey).sort()).toEqual(["contact:ct-1", "contact:ct-2", "owner:ow-1"]);
    expect(byKey["contact:ct-1"]).toMatchObject({ openRequests: 1, sms: [expect.objectContaining({ id: "i1" })] });
    expect(byKey["contact:ct-2"]).toMatchObject({ openRequests: 0, name: "Bo", context: "Ny Kund AB", mails: [expect.objectContaining({ unreadIds: ["e1"] })] });
    expect(byKey["owner:ow-1"].sms.map((s) => s.id)).toEqual(["i2"]);
  });
});
