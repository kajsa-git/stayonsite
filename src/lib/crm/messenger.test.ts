import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { linkMessengerThread, logMessengerMessage, messengerMessagesForOwner, messengerThreadId } from "./messenger";
import { owners } from "./schema";
import { createTestDb, type TestDB } from "./test-db";

let db: TestDB;
let cleanup: () => void;

beforeEach(async () => {
  ({ db, cleanup } = await createTestDb("crm-messenger"));
  await db.insert(owners).values([{ id: "o1", name: "Anna Svensson", phone: "+46701234567" }]);
});
afterEach(() => cleanup());

const url = "https://www.facebook.com/messages/t/100012345678?ref=x";

describe("messenger", () => {
  it("läser trådens id ur länken", () => {
    expect(messengerThreadId(url)).toBe("100012345678");
    expect(messengerThreadId("https://www.facebook.com/messages/e2ee/t/7654321/")).toBe("7654321");
    expect(messengerThreadId("https://www.messenger.com/t/abc.def")).toBe("abc.def");
    expect(messengerThreadId("https://www.facebook.com/groups/1")).toBeNull();
    expect(messengerThreadId("https://evil.example/messages/t/1")).toBeNull();
  });

  it("loggar meddelanden en gång och visar dem på uthyraren när tråden är kopplad", async () => {
    const a = await logMessengerMessage({ url, name: "Anna Svensson", text: "Har ett hus i Valbo", eventKey: "k1", seenAt: "2026-11-19T08:00:00Z" }, { db });
    expect(a.status).toBe("logged");
    if (a.status === "invalid") throw new Error();
    expect(a.thread.ownerId).toBeNull();
    expect((await logMessengerMessage({ url, text: "Har ett hus i Valbo", eventKey: "k1" }, { db })).status).toBe("already_logged");

    const l = await linkMessengerThread({ url, ownerId: "o1" }, { db });
    expect(l.status).toBe("linked");
    if (l.status === "invalid") throw new Error();
    expect(l.thread.ownerName).toBe("Anna Svensson");

    const b = await logMessengerMessage({ url, text: "Ring mig gärna", eventKey: "k2", seenAt: "2026-11-19T09:00:00Z" }, { db });
    if (b.status === "invalid") throw new Error();
    expect(b.thread.ownerId).toBe("o1");
    expect(b.thread.name).toBe("Anna Svensson");
    expect((await messengerMessagesForOwner("o1", { db })).map((m) => m.text)).toEqual(["Ring mig gärna", "Har ett hus i Valbo"]);
  });

  it("kopplar inte till någon som inte finns", async () => {
    expect((await linkMessengerThread({ url, ownerId: "finns-inte" }, { db })).status).toBe("invalid");
    expect((await linkMessengerThread({ url }, { db })).status).toBe("invalid");
    expect((await logMessengerMessage({ url: "https://www.facebook.com/groups/1", text: "x", eventKey: "k" }, { db })).status).toBe("invalid");
  });
});
