import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createTestDb, type TestDB } from "../test-db";
import { emails, inboxMessages, owners, companies } from "../schema";

const state = vi.hoisted(() => ({ db: null as unknown as TestDB, prompts: [] as string[] }));
vi.mock("../db", () => ({ get db() { return state.db; } }));
vi.mock("./decide", async (orig) => ({
  ...(await orig<typeof import("./decide")>()),
  callClaude: vi.fn(async (prompt: string) => {
    state.prompts.push(prompt);
    return { text: prompt.startsWith("Slå ihop") ? "SAMLAD PLAYBOOK" : `anteckning ${state.prompts.length}`, model: "test" };
  }),
}));

import { learnStart, learnStep } from "./learn";
import { getSettings } from "./store";

let cleanup: () => void;
beforeEach(async () => {
  ({ db: state.db, cleanup } = await createTestDb("reply-learn"));
  state.prompts = [];
  await state.db.insert(owners).values([{ id: "o1", name: "Ägare Ett" }, { id: "o2", name: "Ägare Två" }]);
  await state.db.insert(companies).values({ id: "c1", name: "Bygg AB" });
  for (const [i, owner] of ["o1", "o2"].entries()) {
    await state.db.insert(inboxMessages).values([
      { id: `${owner}-in`, guid: `${owner}-in`, fromPhone: `+4670000000${i}`, body: "Hej, är bostaden fortfarande intressant?", direction: "in", sentAt: "2026-10-01T10:00:00.000Z", ownerId: owner },
      { id: `${owner}-out`, guid: `${owner}-out`, fromPhone: `+4670000000${i}`, body: "Hej! Ja, skicka gärna bilder. /Kajsa", direction: "out", sentAt: "2026-10-01T11:00:00.000Z", ownerId: owner },
    ]);
  }
  // Envägskonversationer (bara inkommande) lär motorn ingenting.
  await state.db.insert(emails).values({ id: "e1", companyId: "c1", direction: "in", subject: "Nyhetsbrev", body: "...", fromEmail: "x@y.se", toEmail: "kajsa@stayonsite.se", sentAt: "2026-10-02T10:00:00.000Z" });
});
afterEach(() => cleanup());

it("lär sig i steg och sparar en samlad playbook", async () => {
  const start = await learnStart({ db: state.db, batchChars: 200 });
  expect(start).toMatchObject({ total: 2, done: 0, finished: false, conversations: 2 });

  let p = await learnStep({ db: state.db, maxBatches: 1 });
  expect(p).toMatchObject({ total: 2, done: 1, finished: false });
  p = await learnStep({ db: state.db, maxBatches: 1 });
  expect(p.finished).toBe(true);

  const settings = await getSettings(state.db);
  expect(settings.playbook).toBe("SAMLAD PLAYBOOK");
  expect(settings.learnStatus).toContain("klar");
  expect(state.prompts[0]).toContain("skicka gärna bilder");
  expect(state.prompts.join("\n")).not.toContain("Nyhetsbrev");
});
