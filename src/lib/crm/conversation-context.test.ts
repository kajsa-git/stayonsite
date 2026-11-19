import { afterEach, beforeEach, expect, it } from "vitest";
import { getConversationContext } from "./conversation-context";
import { CRM_MAILBOX } from "./email-sync";
import { linkMessengerThread, logMessengerMessage } from "./messenger";
import { setOutboxChannel } from "./reply-engine/store";
import { companies, contacts, emails, gmailSyncState, inboxMessages, matches, outboxMessages, owners, properties, propertyNotes, requests } from "./schema";
import { createTestDb, type TestDB } from "./test-db";

let db: TestDB;
let cleanup: () => void;
const at = (minutes: number) => new Date(Date.UTC(2026, 10, 19, 8, minutes)).toISOString();

beforeEach(async () => {
  ({ db, cleanup } = await createTestDb("conversation-context"));
  await db.insert(owners).values({ id: "owner-a", name: "Testuthyrare", phone: "+46700001001" });
  await db.insert(properties).values([
    { id: "home-a", ownerId: "owner-a", address: "Exempelvägen 1", rentIn: 9123, status: "available" },
    { id: "home-b", ownerId: "owner-a", address: "Exempelvägen 2" },
  ]);
});
afterEach(() => cleanup());

it("returns fresh linked landlord dialogue, keeps drafts separate and focuses property notes", async () => {
  await db.insert(propertyNotes).values([
    { id: "note-a", propertyId: "home-a", channel: "samtal", content: "Stämt av inflyttning", createdAt: at(2) },
    { id: "note-b", propertyId: "home-b", channel: "samtal", content: "Gäller andra bostaden", createdAt: at(3) },
  ]);
  await db.insert(outboxMessages).values([
    { id: "draft", ownerId: "owner-a", toPhone: "+46700001001", body: "Utkast om nycklar", status: "draft", createdAt: at(5) },
    { id: "sent", ownerId: "owner-a", toPhone: "+46700001001", body: "Har du bilder?", status: "sent", sentAt: at(1) },
  ]);
  await db.insert(inboxMessages).values({ id: "mac-copy", guid: "copy", ownerId: "owner-a", fromPhone: "+46700001001",
    body: "Har du bilder?", direction: "out", sentAt: at(1) });
  const url = "https://www.facebook.com/messages/t/thread-example";
  await linkMessengerThread({ url, ownerId: "owner-a" }, { db });
  await logMessengerMessage({ url, text: "Jag laddar upp bilderna i kväll", eventKey: "example-event", seenAt: at(4) }, { db });

  const first = await getConversationContext({ kind: "property", id: "home-a", limit: 12 }, db);
  expect(first?.history.map((row) => row.id)).toEqual([expect.stringMatching(/^messenger:/), "property-note:note-a", "sms:mac-copy"]);
  expect(first?.history[0]).toMatchObject({ channel: "messenger", direction: null, state: "observed" });
  expect(first?.pending).toEqual([expect.objectContaining({ id: "draft", status: "draft" })]);
  expect(JSON.stringify(first)).not.toContain("9123");

  await db.insert(inboxMessages).values({ id: "new-answer", guid: "new", ownerId: "owner-a", fromPhone: "+46700001001",
    body: "Bilderna är uppladdade", sentAt: at(6) });
  const updated = await getConversationContext({ kind: "property", id: "home-a", limit: 12 }, db);
  expect(updated?.history[0]).toMatchObject({ id: "sms:new-answer", direction: "in", state: "received", body: "Bilderna är uppladdade" });
});

it("uses the renter's booking and identified channels without mixing cases, people or a shared number", async () => {
  await db.insert(companies).values([{ id: "team", name: "Testkund AB" }, { id: "other-team", name: "Annan kund AB" }]);
  await db.insert(contacts).values([
    { id: "renter", companyId: "team", name: "Rätt hyrare", phone: "+46700002001" },
    { id: "colleague", companyId: "team", name: "Annan kontakt", phone: "+46700001001" },
    { id: "unrelated", companyId: "other-team", name: "Orelaterad kontakt" },
  ]);
  await db.insert(requests).values([
    { id: "booking", requestNumber: 1750, companyId: "team", contactId: "renter", status: "won",
      wonPropertyId: "home-a", startDate: "2026-12-01", endDate: "2027-02-01" },
    { id: "other-case", requestNumber: 1751, companyId: "team", contactId: "renter", status: "incoming" },
  ]);
  await db.insert(matches).values({ id: "offer", propertyId: "home-a", requestId: "booking", status: "accepted", offerRentOut: 14000, promisedRentIn: 9123 });
  await db.insert(inboxMessages).values([
    { id: "actual-whatsapp", guid: "whatsapp", contactId: "renter", companyId: "team", fromPhone: "+46700002001",
      service: "WhatsApp", body: "Vi kommer på tisdag", sentAt: at(3) },
    { id: "shared", guid: "shared", ownerId: "owner-a", contactId: "colleague", companyId: "team",
      fromPhone: "+46700001001", body: "Otydligt vem det gäller", sentAt: at(4) },
  ]);
  await db.insert(emails).values([
    { id: "current", contactId: "renter", companyId: "team", requestId: "booking", direction: "in",
      subject: "Gällande bokningen", body: "Vi fick länken https://www.stayonsite.se/erbjudande/ANotPublicToken01234567890123456", fromEmail: "renter@example.test", toEmail: "kajsa@example.test", sentAt: at(5) },
    { id: "wrong-case", contactId: "renter", companyId: "team", requestId: "other-case", direction: "in",
      subject: "Annat ärende", body: "Fel period", fromEmail: "renter@example.test", toEmail: "kajsa@example.test", sentAt: at(6) },
    { id: "wrong-party", contactId: "unrelated", requestId: "booking", direction: "in",
      subject: "Fel företag", body: "Fel kontakt", fromEmail: "other@example.test", toEmail: "kajsa@example.test", sentAt: at(7) },
  ]);
  await db.insert(outboxMessages).values({ id: "wa-draft", status: "queued", contactId: "renter", toPhone: "+46700002001", body: "Praktiska detaljer", createdAt: at(8) });
  await setOutboxChannel(db, "wa-draft", "whatsapp");
  await db.insert(gmailSyncState).values({ mailbox: CRM_MAILBOX, lastSuccessAt: at(9) });
  const booking = await getConversationContext({ kind: "request", id: "booking", limit: 12 }, db);
  expect(booking?.cases).toMatchObject({ requests: [expect.objectContaining({ number: 1750, bookedPropertyId: "home-a" })], offers: [expect.objectContaining({ customerPrice: 14000 })] });
  expect(booking?.history.map((row) => row.id)).toEqual(["email:current", "sms:actual-whatsapp"]);
  expect(booking?.history[0].body).not.toContain("ANotPublicToken");
  expect(booking?.pending).toEqual([expect.objectContaining({ status: "queued", channel: "whatsapp" })]);
  expect(booking?.gmailSyncedAt).toBe(at(9));
  expect((await getConversationContext({ kind: "owner", id: "owner-a", limit: 12 }, db))?.history).toEqual([]);
  expect((await getConversationContext({ kind: "company", id: "team", limit: 12 }, db))?.history.some((m) => m.id === "sms:shared")).toBe(false);
});

it("continues through older history when rows have the same normalized timestamp", async () => {
  await db.insert(propertyNotes).values([
    { id: "a", propertyId: "home-a", channel: "samtal", content: "Första", createdAt: at(1) },
    { id: "b", propertyId: "home-a", channel: "mejl", content: "Andra", createdAt: "2026-11-19 08:01:00" },
  ]);
  const args = { kind: "owner", id: "owner-a", limit: 1, channel: "note" } as const;
  const first = await getConversationContext(args, db);
  const older = await getConversationContext({ ...args, before: first?.nextCursor ?? undefined }, db);
  expect(first?.history[0].id).toBe("property-note:b");
  expect(older?.history[0].id).toBe("property-note:a");
  expect(older?.nextCursor).toBeNull();
});
