import fs from "node:fs";
import path from "node:path";
import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GmailMessage } from "./gmail";
import * as schema from "./schema";
import { createTestDb, type TestDB } from "./test-db";

const gmail = vi.hoisted(() => ({
  messages: new Map<string, GmailMessage>(),
  threads: new Map<string, string[]>(),
  searchResults: new Map<string, string[]>(),
  added: [] as string[],
  historyExpired: false,
  listed: [] as string[],
  currentHistoryId: "500",
  fullFetches: [] as string[],
}));

vi.mock("./gmail", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./gmail")>();
  return {
    ...actual,
    gmailAutomationUserId: vi.fn(async () => "user-kajsa"),
    gmailCurrentHistoryId: vi.fn(async () => gmail.currentHistoryId),
    gmailListAddedMessageIds: vi.fn(async () => {
      if (gmail.historyExpired) throw new actual.GmailHistoryExpiredError("expired");
      return { messageIds: gmail.added, historyId: gmail.currentHistoryId };
    }),
    gmailListMessageIds: vi.fn(async () => gmail.listed),
    gmailGetMessage: vi.fn(async (_user: string, id: string, format: "full" | "metadata") => {
      const msg = gmail.messages.get(id);
      if (!msg) return null;
      if (format === "full") gmail.fullFetches.push(id);
      return format === "full" ? msg : { ...msg, text: "", html: null };
    }),
    gmailGetThread: vi.fn(async (_user: string, threadId: string) =>
      (gmail.threads.get(threadId) ?? []).map((id) => gmail.messages.get(id)!),
    ),
    gmailSearchThreadIds: vi.fn(async (_user: string, email: string) => gmail.searchResults.get(email) ?? []),
  };
});

import {
  EMAIL_SYNC_SCHEMA_STATEMENTS,
  computeWaitingEmails,
  ignoreSenderSuggestion,
  importGmailMessage,
  linkSenderSuggestion,
  listSenderSuggestions,
  markEmailsRead,
  replyPreview,
  runMailboxSync,
  syncEntityEmails,
} from "./email-sync";

const { companies, contacts, emailSenderSuggestions, emails, gmailSyncState, owners, requests } = schema;
const MAILBOX = "kajsa@stayonsite.se";
const NOW = Date.parse("2026-11-07T19:00:00.000Z");

let db: TestDB;
let cleanup: () => void;

function message(id: string, over: Partial<GmailMessage> & { threadId?: string; hoursAgo?: number }): GmailMessage {
  const { hoursAgo = 1, ...rest } = over;
  return {
    id,
    threadId: rest.threadId ?? `t-${id}`,
    from: "someone@random.se",
    to: MAILBOX,
    cc: "",
    subject: `Ämne ${id}`,
    date: "",
    text: `Text ${id}`,
    html: null,
    autoSubmitted: "",
    precedence: "",
    listUnsubscribe: "",
    labelIds: ["INBOX"],
    snippet: `Snippet ${id}`,
    receivedAt: new Date(NOW - hoursAgo * 3_600_000).toISOString(),
    ...rest,
  };
}

function addMessage(msg: GmailMessage) {
  gmail.messages.set(msg.id, msg);
  gmail.threads.set(msg.threadId, [...(gmail.threads.get(msg.threadId) ?? []), msg.id]);
  return msg;
}

beforeEach(async () => {
  ({ db, cleanup } = await createTestDb("crm-email-sync"));
  gmail.messages.clear();
  gmail.threads.clear();
  gmail.searchResults.clear();
  gmail.added = [];
  gmail.listed = [];
  gmail.historyExpired = false;
  gmail.currentHistoryId = "500";
  gmail.fullFetches = [];

  await db.insert(companies).values([
    { id: "co-bygg", name: "Byggbolaget AB", website: "https://www.byggbolaget.se" },
    { id: "co-el", name: "Elfirman AB" },
  ]);
  await db.insert(contacts).values([
    { id: "ct-anna", companyId: "co-bygg", name: "Anna Berg", email: "anna@byggbolaget.se" },
    { id: "ct-lisa", companyId: "co-el", name: "Lisa Ek", email: "lisa@elfirma.se" },
  ]);
  await db.insert(owners).values([
    { id: "ow-lisa", name: "Lisa Ek (uthyrare)", email: "lisa@elfirma.se" },
    { id: "ow-sven", name: "Sven Hus", email: "sven.hus@hotmail.com" },
  ]);
});

afterEach(() => cleanup());

const rowsFor = (id: string) => db.select().from(emails).where(eq(emails.gmailMessageId, id));

describe("schema", () => {
  it("creates the same tables at runtime as migration 0050", () => {
    const file = fs.readFileSync(path.resolve(__dirname, "../../../drizzle/0050_gmail_mailbox_sync.sql"), "utf8");
    const fromFile = file.split("--> statement-breakpoint").map((s) => s.trim().replace(/;$/, "").replace(/\s+/g, " "));
    expect(EMAIL_SYNC_SCHEMA_STATEMENTS.map((s) => s.replace(/\s+/g, " "))).toEqual(fromFile);
  });
});

describe("runMailboxSync", () => {
  it("bootstraps from the last 30 days, links known people and queues unknown colleagues", async () => {
    addMessage(message("m-anna", { from: "Anna Berg <anna@byggbolaget.se>", hoursAgo: 2 }));
    addMessage(message("m-old", { from: "anna@byggbolaget.se", hoursAgo: 24 * 10, threadId: "t-old" }));
    addMessage(message("m-out", { from: `Kajsa <${MAILBOX}>`, to: "sven.hus@hotmail.com", hoursAgo: 3 }));
    addMessage(message("m-lisa", { from: "lisa@elfirma.se", hoursAgo: 1 }));
    addMessage(message("m-erik", { from: "Erik Olsson <erik@byggbolaget.se>", subject: "Boende i Gävle", hoursAgo: 1 }));
    addMessage(message("m-news", { from: "info@byggbolaget.se", listUnsubscribe: "<mailto:u@x.se>", hoursAgo: 1 }));
    addMessage(message("m-private", { from: "friend@gmail.com", hoursAgo: 1 }));
    gmail.listed = ["m-private", "m-news", "m-erik", "m-lisa", "m-out", "m-old", "m-anna"]; // nyast först, som Gmail

    const summary = await runMailboxSync({ db, now: () => NOW });

    expect(summary).toMatchObject({ mode: "bootstrap", scanned: 7, imported: 4, suggested: 1, partial: false });
    const [anna] = await rowsFor("m-anna");
    expect(anna).toMatchObject({ companyId: "co-bygg", contactId: "ct-anna", ownerId: null, direction: "in", isRead: false });
    const [old] = await rowsFor("m-old");
    expect(old.isRead).toBe(true); // äldre än 48 h vid första körningen = redan hanterat
    const [out] = await rowsFor("m-out");
    expect(out).toMatchObject({ ownerId: "ow-sven", direction: "out", isRead: true });
    const [lisa] = await rowsFor("m-lisa");
    expect(lisa).toMatchObject({ companyId: "co-el", ownerId: "ow-lisa" });
    expect(await rowsFor("m-private")).toHaveLength(0);
    expect(await rowsFor("m-news")).toHaveLength(0);
    // Bara mejl som ska importeras hämtas i sin helhet.
    expect(gmail.fullFetches.sort()).toEqual(["m-anna", "m-lisa", "m-old", "m-out"]);

    const suggestions = await listSenderSuggestions(db);
    expect(suggestions).toEqual([
      expect.objectContaining({ email: "erik@byggbolaget.se", name: "Erik Olsson", lastSubject: "Boende i Gävle", companies: [{ id: "co-bygg", name: "Byggbolaget AB" }] }),
    ]);

    const [state] = await db.select().from(gmailSyncState);
    expect(state).toMatchObject({ mailbox: MAILBOX, historyId: "500", lastError: null, lastImported: 4 });
  });

  it("continues incrementally from the saved history id and follows known threads", async () => {
    await db.insert(gmailSyncState).values({ mailbox: MAILBOX, historyId: "400", lastSuccessAt: new Date(NOW - 900_000).toISOString() });
    await db.insert(emails).values({
      id: "e1", companyId: "co-bygg", direction: "out", subject: "Offert", body: "x", fromEmail: MAILBOX,
      toEmail: "anna@byggbolaget.se", gmailMessageId: "m-first", gmailThreadId: "t-offert", sentAt: new Date(NOW - 7_200_000).toISOString(),
    });
    addMessage(message("m-colleague", { from: "Ny Kollega <ny@byggbolaget.se>", threadId: "t-offert" }));
    gmail.added = ["m-first", "m-colleague"];
    gmail.currentHistoryId = "520";

    const summary = await runMailboxSync({ db, now: () => NOW });

    expect(summary).toMatchObject({ mode: "incremental", scanned: 1, imported: 1, suggested: 0 });
    const [reply] = await rowsFor("m-colleague");
    expect(reply).toMatchObject({ companyId: "co-bygg", direction: "in", isRead: false });
    const [state] = await db.select().from(gmailSyncState);
    expect(state.historyId).toBe("520");
  });

  it("carries a thread link to later replies from new addresses in the same run", async () => {
    addMessage(message("m-1", { from: `Kajsa <${MAILBOX}>`, to: "anna@byggbolaget.se", threadId: "t-new", hoursAgo: 3 }));
    addMessage(message("m-2", { from: "Ny <ny@byggbolaget.se>", threadId: "t-new", hoursAgo: 1 }));
    gmail.listed = ["m-2", "m-1"];

    const summary = await runMailboxSync({ db, now: () => NOW });

    expect(summary).toMatchObject({ imported: 2, suggested: 0 });
    const [reply] = await rowsFor("m-2");
    expect(reply).toMatchObject({ companyId: "co-bygg", direction: "in" });
  });

  it("recovers with a search when Gmail's history has expired", async () => {
    await db.insert(gmailSyncState).values({ mailbox: MAILBOX, historyId: "1", lastSuccessAt: new Date(NOW - 10 * 86_400_000).toISOString() });
    gmail.historyExpired = true;
    addMessage(message("m-anna", { from: "anna@byggbolaget.se" }));
    gmail.listed = ["m-anna"];

    const summary = await runMailboxSync({ db, now: () => NOW });

    expect(summary.mode).toBe("recovery");
    const { gmailListMessageIds } = await import("./gmail");
    expect(vi.mocked(gmailListMessageIds)).toHaveBeenLastCalledWith("user-kajsa", "newer_than:11d -in:chats -in:drafts", 1000);
    expect(await rowsFor("m-anna")).toHaveLength(1);
  });

  it("keeps the old starting point when the time budget runs out", async () => {
    await db.insert(gmailSyncState).values({ mailbox: MAILBOX, historyId: "400" });
    for (let i = 0; i < 20; i++) addMessage(message(`m${i}`, { from: "anna@byggbolaget.se" }));
    gmail.added = [...gmail.messages.keys()];
    let clock = NOW;
    const summary = await runMailboxSync({ db, budgetMs: 10, now: () => (clock += 8) });

    expect(summary.partial).toBe(true);
    expect(summary.scanned).toBe(16);
    const [state] = await db.select().from(gmailSyncState);
    expect(state.historyId).toBe("400");
  });

  it("resumes a large first sync after the last mail it got through", async () => {
    for (let i = 0; i < 20; i++) addMessage(message(`b${i}`, { from: "anna@byggbolaget.se", hoursAgo: 40 - i }));
    gmail.listed = [...gmail.messages.keys()].reverse(); // nyast först
    let clock = NOW;
    const first = await runMailboxSync({ db, budgetMs: 10, now: () => (clock += 8) });
    expect(first).toMatchObject({ mode: "bootstrap", partial: true, scanned: 16, imported: 16 });
    let [state] = await db.select().from(gmailSyncState);
    expect(state.historyId).toBeNull();
    expect(state.backfillAfter).toBe(gmail.messages.get("b15")!.receivedAt);

    gmail.listed = ["b19", "b18", "b17", "b16", "b15"];
    const second = await runMailboxSync({ db, now: () => NOW });
    const { gmailListMessageIds } = await import("./gmail");
    const cursor = Math.floor(Date.parse(state.backfillAfter!) / 1000) - 1;
    expect(vi.mocked(gmailListMessageIds)).toHaveBeenLastCalledWith("user-kajsa", `after:${cursor} -in:chats -in:drafts`, 1000);
    expect(second).toMatchObject({ mode: "bootstrap", partial: false, imported: 4 });
    [state] = await db.select().from(gmailSyncState);
    expect(state).toMatchObject({ historyId: "500", backfillAfter: null });
  });

  it("records the error and rethrows when Gmail fails", async () => {
    const { gmailCurrentHistoryId } = await import("./gmail");
    vi.mocked(gmailCurrentHistoryId).mockRejectedValueOnce(new Error("Gmail nere"));
    await expect(runMailboxSync({ db, now: () => NOW })).rejects.toThrow("Gmail nere");
    const [state] = await db.select().from(gmailSyncState);
    expect(state.lastError).toBe("Gmail nere");
  });
});

describe("company and landlord on the same mail", () => {
  it("adds the missing link to an already imported mail instead of skipping it", async () => {
    const msg = addMessage(message("m-lisa", { from: "lisa@elfirma.se", threadId: "t-lisa" }));
    expect(await importGmailMessage(db, msg, { companyId: "co-el", contactId: "ct-lisa", ownerId: null }, { mailbox: MAILBOX })).toBe("inserted");
    expect(await importGmailMessage(db, msg, { companyId: null, contactId: null, ownerId: "ow-lisa" }, { mailbox: MAILBOX })).toBe("linked");
    expect(await importGmailMessage(db, msg, { companyId: "co-el", contactId: null, ownerId: "ow-lisa" }, { mailbox: MAILBOX })).toBe("unchanged");
    const rows = await rowsFor("m-lisa");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ companyId: "co-el", contactId: "ct-lisa", ownerId: "ow-lisa" });
  });

  it("card sync on the landlord shows a thread first synced on the company", async () => {
    await db.insert(emails).values({
      id: "e1", companyId: "co-el", direction: "in", subject: "Hej", body: "x", fromEmail: "lisa@elfirma.se",
      toEmail: MAILBOX, gmailMessageId: "m-lisa", gmailThreadId: "t-lisa", sentAt: new Date(NOW).toISOString(),
    });
    addMessage(message("m-lisa", { from: "lisa@elfirma.se", threadId: "t-lisa" }));
    addMessage(message("m-lisa-2", { from: `Kajsa <${MAILBOX}>`, to: "lisa@elfirma.se", threadId: "t-lisa" }));
    gmail.searchResults.set("lisa@elfirma.se", ["t-lisa"]);

    expect(await syncEntityEmails(db, "user-kajsa", { ownerId: "ow-lisa" }, { mailbox: MAILBOX })).toEqual({ synced: 2 });
    const ownerRows = await db.select().from(emails).where(eq(emails.ownerId, "ow-lisa"));
    expect(ownerRows.map((r) => r.gmailMessageId).sort()).toEqual(["m-lisa", "m-lisa-2"]);
    const [reply] = await rowsFor("m-lisa-2");
    expect(reply).toMatchObject({ companyId: "co-el", ownerId: "ow-lisa", direction: "out" });
  });
});

describe("waiting emails", () => {
  it("lists threads where the other side wrote last, until answered or handled", async () => {
    const at = (h: number) => new Date(NOW - h * 3_600_000).toISOString();
    await db.insert(emails).values([
      { id: "a1", companyId: "co-bygg", contactId: "ct-anna", direction: "out", subject: "Offert", body: "Här är offerten", fromEmail: MAILBOX, toEmail: "anna@byggbolaget.se", gmailThreadId: "t-a", gmailMessageId: "g1", sentAt: at(5) },
      { id: "a2", companyId: "co-bygg", contactId: "ct-anna", direction: "in", subject: "Re: Offert", body: "Ser bra ut!\n\nDen 6 nov skrev Kajsa:\n> Här är offerten", fromEmail: "Anna Berg <anna@byggbolaget.se>", toEmail: MAILBOX, gmailThreadId: "t-a", gmailMessageId: "g2", isRead: false, sentAt: at(2) },
      { id: "b1", ownerId: "ow-sven", direction: "in", subject: "Huset", body: "Ledigt i december", fromEmail: "sven.hus@hotmail.com", toEmail: MAILBOX, gmailThreadId: "t-b", gmailMessageId: "g3", isRead: false, sentAt: at(3) },
      { id: "b2", ownerId: "ow-sven", direction: "out", subject: "Re: Huset", body: "Tack!", fromEmail: MAILBOX, toEmail: "sven.hus@hotmail.com", gmailThreadId: "t-b", gmailMessageId: "g4", sentAt: at(1) },
      { id: "c1", companyId: "co-el", direction: "in", subject: "Gammalt", body: "x", fromEmail: "lisa@elfirma.se", toEmail: MAILBOX, gmailThreadId: "t-c", gmailMessageId: "g5", isRead: false, sentAt: at(24 * 20) },
    ]);

    let waiting = await computeWaitingEmails({ db, now: NOW });
    expect(waiting).toHaveLength(1);
    expect(waiting[0]).toMatchObject({
      key: "t-a", subject: "Re: Offert", fromEmail: "anna@byggbolaget.se", fromName: "Anna Berg", preview: "Ser bra ut!",
      companyId: "co-bygg", companyName: "Byggbolaget AB", contactName: "Anna Berg", messageCount: 2, unreadIds: ["a2"],
    });

    expect(await markEmailsRead(db, waiting[0].unreadIds)).toBe(1);
    waiting = await computeWaitingEmails({ db, now: NOW });
    expect(waiting).toHaveLength(0);
  });

  it("strips quoted history from the preview", () => {
    expect(replyPreview("Tack, vi tar den!\n\nOn Fri, Nov 6, 2026 Kajsa wrote:\n> offert")).toBe("Tack, vi tar den!");
    expect(replyPreview("Hej\nFrån: Kajsa\nSkickat: igår")).toBe("Hej");
    expect(replyPreview("a".repeat(400)).length).toBe(280);
  });
});

describe("sender suggestions", () => {
  async function seedSuggestion() {
    addMessage(message("m-erik", { from: "Erik Olsson <erik@byggbolaget.se>", threadId: "t-erik" }));
    gmail.listed = ["m-erik"];
    await runMailboxSync({ db, now: () => NOW });
    const [s] = await db.select().from(emailSenderSuggestions);
    return s;
  }

  it("counts new mails from the same sender once each", async () => {
    const s = await seedSuggestion();
    addMessage(message("m-erik-2", { from: "erik@byggbolaget.se" }));
    gmail.added = ["m-erik-2"];
    await runMailboxSync({ db, now: () => NOW + 1000 });
    await runMailboxSync({ db, now: () => NOW + 2000 }); // samma meddelande igen
    const [after] = await db.select().from(emailSenderSuggestions).where(eq(emailSenderSuggestions.id, s.id));
    expect(after.messageCount).toBe(2);
  });

  it("links a sender as a contact and pulls in the thread", async () => {
    const s = await seedSuggestion();
    gmail.searchResults.set("erik@byggbolaget.se", ["t-erik"]);

    const result = await linkSenderSuggestion(db, s.id, "co-bygg", { userId: "user-kajsa" });

    expect(result.synced).toBe(1);
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, result.contactId));
    expect(contact).toMatchObject({ companyId: "co-bygg", name: "Erik Olsson", email: "erik@byggbolaget.se" });
    const [mail] = await rowsFor("m-erik");
    expect(mail).toMatchObject({ companyId: "co-bygg", contactId: result.contactId });
    expect(await listSenderSuggestions(db)).toEqual([]);
    await expect(linkSenderSuggestion(db, s.id, "co-bygg")).rejects.toThrow("redan hanterat");
  });

  it("never suggests an ignored sender again", async () => {
    const s = await seedSuggestion();
    await ignoreSenderSuggestion(db, s.id);
    addMessage(message("m-erik-3", { from: "erik@byggbolaget.se" }));
    gmail.added = ["m-erik-3"];
    await runMailboxSync({ db, now: () => NOW + 1000 });
    expect(await listSenderSuggestions(db)).toEqual([]);
  });
});

describe("qualification replies imported by the background sync first", () => {
  it("attaches the request to the existing row", async () => {
    const { sql } = await import("drizzle-orm");
    await db.insert(requests).values({ id: "req-1", companyId: "co-bygg", status: "incoming" });
    await db.insert(emails).values({
      id: "e1", companyId: "co-bygg", direction: "in", subject: "Svar", body: "x", fromEmail: "anna@byggbolaget.se",
      toEmail: MAILBOX, gmailMessageId: "g-q", gmailThreadId: "t-q", sentAt: new Date(NOW).toISOString(),
    });
    await db.insert(emails).values({
      id: "e2", companyId: "co-bygg", requestId: "req-1", contactId: "ct-anna", direction: "in", subject: "Svar", body: "x",
      fromEmail: "anna@byggbolaget.se", toEmail: MAILBOX, gmailMessageId: "g-q", gmailThreadId: "t-q", isRead: false, sentAt: new Date(NOW).toISOString(),
    }).onConflictDoUpdate({
      target: emails.gmailMessageId,
      set: {
        requestId: sql`coalesce(${emails.requestId}, excluded.request_id)`,
        contactId: sql`coalesce(${emails.contactId}, excluded.contact_id)`,
        companyId: sql`coalesce(${emails.companyId}, excluded.company_id)`,
      },
    });
    const rows = await rowsFor("g-q");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ id: "e1", requestId: "req-1", contactId: "ct-anna", companyId: "co-bygg" });
  });
});
