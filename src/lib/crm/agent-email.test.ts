import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { emailHistory, sendAgentEmail } from "./agent-email";
import { companies, contacts, emails, owners, requests } from "./schema";
import { createTestDb, type TestDB } from "./test-db";

let db: TestDB;
let cleanup: () => void;

beforeEach(async () => {
  ({ db, cleanup } = await createTestDb("crm-agent-email"));
  await db.insert(companies).values([{ id: "c1", name: "BS Logistics" }]);
  await db.insert(contacts).values([
    { id: "k1", companyId: "c1", name: "Mats", email: "mats@bs.se" },
    { id: "k2", companyId: "c1", name: "Utan mejl", email: null },
  ]);
  await db.insert(owners).values([{ id: "o1", name: "Anna Hyr", email: "anna@hyr.se" }]);
  await db.insert(requests).values([{ id: "r1", companyId: "c1", city: "Gävle" }]);
});

afterEach(() => cleanup());

function deps(now = new Date("2026-11-18T10:00:00Z")) {
  const send = vi.fn(async () => ({ messageId: `m-${send.mock.calls.length}`, threadId: "t-ny" }));
  return { send, d: { db, send, automationUserId: async () => "u1", replyHeaders: async () => ({}), now: () => now, from: "kajsa@stayonsite.se" } };
}

describe("sendAgentEmail", () => {
  it("skickar till kontaktens adress ur CRM:et och loggar mejlet på kunden", async () => {
    const { send, d } = deps();
    const res = await sendAgentEmail({ contactId: "k1", subject: "Boende i Gävle", body: "Hej Mats!", requestId: "r1" }, d);
    expect(res).toMatchObject({ ok: true, alreadySent: false, to: "mats@bs.se", companyId: "c1" });
    expect(send).toHaveBeenCalledOnce();
    expect((send.mock.calls[0] as unknown as [string, { to: string; from: string }])[1]).toMatchObject({ to: "mats@bs.se", from: "Kajsa <kajsa@stayonsite.se>" });
    const [row] = await db.select().from(emails);
    expect(row).toMatchObject({ direction: "out", companyId: "c1", contactId: "k1", requestId: "r1", toEmail: "mats@bs.se", gmailThreadId: "t-ny" });
  });

  it("skickar inte samma mejl två gånger inom 15 minuter", async () => {
    const { send, d } = deps();
    await sendAgentEmail({ ownerId: "o1", subject: "Hus", body: "Hej Anna" }, d);
    const igen = await sendAgentEmail({ ownerId: "o1", subject: "Hus", body: "Hej Anna" }, d);
    expect(igen).toMatchObject({ ok: true, alreadySent: true });
    expect(send).toHaveBeenCalledOnce();
  });

  it("vägrar utan mottagare, med två mottagare, utan e-post och för okänd förfrågan", async () => {
    const { send, d } = deps();
    expect((await sendAgentEmail({ subject: "a", body: "b" }, d)).ok).toBe(false);
    expect((await sendAgentEmail({ contactId: "k1", ownerId: "o1", subject: "a", body: "b" }, d)).ok).toBe(false);
    expect((await sendAgentEmail({ contactId: "k2", subject: "a", body: "b" }, d)).ok).toBe(false);
    expect((await sendAgentEmail({ contactId: "k1", subject: "a", body: "b", requestId: "saknas" }, d)).ok).toBe(false);
    expect(send).not.toHaveBeenCalled();
  });

  it("svarar bara i en tråd som hör till mottagaren", async () => {
    await db.insert(emails).values([
      { id: "e1", ownerId: "o1", direction: "in", subject: "Re: Hus", body: "Ja", fromEmail: "anna@hyr.se", toEmail: "kajsa@stayonsite.se", gmailThreadId: "t-anna", sentAt: "2026-11-17T10:00:00Z" },
    ]);
    const { send, d } = deps();
    expect((await sendAgentEmail({ contactId: "k1", subject: "x", body: "y", threadId: "t-anna" }, d)).ok).toBe(false);
    expect((await sendAgentEmail({ ownerId: "o1", subject: "Re: Hus", body: "Tack!", threadId: "t-anna" }, d)).ok).toBe(true);
    expect((send.mock.calls[0] as unknown as [string, { threadId?: string }])[1].threadId).toBe("t-anna");
  });
});

describe("emailHistory", () => {
  it("kräver en mottagare och visar nyast först", async () => {
    expect(await emailHistory({}, { db })).toBeNull();
    await db.insert(emails).values([
      { id: "a", ownerId: "o1", direction: "out", subject: "1", body: "x", fromEmail: "k", toEmail: "anna@hyr.se", sentAt: "2026-11-01T10:00:00Z" },
      { id: "b", ownerId: "o1", direction: "in", subject: "2", body: "y", fromEmail: "anna@hyr.se", toEmail: "k", sentAt: "2026-11-02T10:00:00Z" },
    ]);
    const rows = await emailHistory({ ownerId: "o1" }, { db });
    expect(rows!.map((r) => r.subject)).toEqual(["2", "1"]);
  });
});
