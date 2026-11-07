import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { eq, sql } from "drizzle-orm";
import { createTestDb, type TestDB } from "../test-db";
import { companies, contacts, emails, inboxMessages, outboxMessages, owners } from "../schema";
import type { ModelDecision } from "./policy";

const state = vi.hoisted(() => ({ db: null as unknown as TestDB, decisions: [] as unknown[], prompts: [] as string[] }));
vi.mock("../db", () => ({ get db() { return state.db; } }));
vi.mock("../gmail", () => ({
  gmailAutomationUserId: vi.fn(async () => "user-1"),
  gmailThreadReplyHeaders: vi.fn(async () => ({})),
  gmailSend: vi.fn(async () => ({ messageId: "gm-out-1", threadId: "thread-1" })),
}));
vi.mock("./decide", async (orig) => {
  const actual = await orig<typeof import("./decide")>();
  return {
    ...actual,
    decide: vi.fn(async (prompt: string) => {
      state.prompts.push(prompt);
      const next = state.decisions.shift();
      if (!next) throw new Error("ingen fejkad modell kvar");
      return { decision: next, model: "test-model" };
    }),
  };
});

import { gmailSend } from "../gmail";
import { runReplyEngine } from "./run";
import { getSettings, listDecisions, setMode, setSetting } from "./store";

const routine = (over: Partial<ModelDecision> = {}): ModelDecision => ({
  partyRole: "uthyrare", intent: "fråga om bilder", stage: "registrering", outcomeGoal: "publicerad bostad",
  needsReply: true, reply: "Tack! Jag tittar på bilderna i dag. /Kajsa", replySubject: null, routine: true,
  confidence: 0.95, riskFlags: [], handover: false, handoverReason: null, followUpInHours: null, followUpReason: null,
  kajsaTask: null, nextStep: null, summary: "", ...over,
});

let cleanup: () => void;
const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

beforeEach(async () => {
  const t = await createTestDb("reply-engine");
  state.db = t.db;
  cleanup = t.cleanup;
  state.decisions = [];
  state.prompts = [];
  vi.clearAllMocks();
  await state.db.insert(owners).values({ id: "o1", name: "Anna Ägare", phone: "+46701112233", email: "anna@example.se" });
  await state.db.insert(companies).values({ id: "c1", name: "Bygg AB", languages: ["sv"] });
  await state.db.insert(contacts).values({ id: "k1", companyId: "c1", name: "Per", phone: "+46704445566", email: "per@bygg.se", isPrimary: true });
  await setMode(state.db, "auto");
  await setSetting(state.db, "activated_at", minutesAgo(60));
});

afterEach(() => cleanup());

async function sms(id: string, opts: { from?: string; owner?: string | null; contact?: string | null; company?: string | null; body?: string; at?: string; direction?: "in" | "out"; service?: string } = {}) {
  await state.db.insert(inboxMessages).values({
    id, guid: `g-${id}`, fromPhone: opts.from ?? "+46701112233", body: opts.body ?? "Hej! Bilderna är uppladdade nu.",
    service: opts.service ?? "iMessage", direction: opts.direction ?? "in", sentAt: opts.at ?? minutesAgo(5),
    ownerId: opts.owner === undefined ? "o1" : opts.owner, contactId: opts.contact ?? null, companyId: opts.company ?? null,
  });
}

describe("svarsmotorn", () => {
  it("svarar direkt på ett rutinmeddelande och lägger svaret i utkorgen", async () => {
    await sms("in1");
    state.decisions.push(routine({ followUpInHours: 24 }));
    const summary = await runReplyEngine({ db: state.db, force: true });
    expect(summary.autoSent).toBe(1);

    const [out] = await state.db.select().from(outboxMessages);
    expect(out).toMatchObject({ toPhone: "+46701112233", status: "queued", source: "reply-engine", ownerId: "o1" });
    expect(out.replyToInboxIds).toEqual(["in1"]);
    const [inbound] = await state.db.select().from(inboxMessages).where(eq(inboxMessages.id, "in1"));
    expect(inbound.isRead).toBe(true);
    const [d] = await listDecisions(state.db);
    expect(d).toMatchObject({ action: "auto_sent", follow_up_status: "pending", outbox_id: out.id });
    // Kontexten innehåller uthyraren och meddelandet, men aldrig interna hyror.
    expect(state.prompts[0]).toContain("Anna Ägare");
    expect(state.prompts[0]).toContain("Bilderna är uppladdade");
  });

  it("gör ett utkast och lägger ärendet hos Kajsa när svaret rör pris", async () => {
    await sms("in1", { body: "Vad blir hyran per månad?" });
    state.decisions.push(routine({ riskFlags: ["price"], reply: "Jag återkommer om ersättningen i dag.", kajsaTask: "räkna fram ersättning" }));
    const summary = await runReplyEngine({ db: state.db, force: true });
    expect(summary.handovers).toBe(1);
    const [out] = await state.db.select().from(outboxMessages);
    expect(out.status).toBe("draft");
    const [o] = await state.db.select().from(owners).where(eq(owners.id, "o1"));
    expect(o.followUpDate).toBeTruthy();
    expect(o.followUpReason).toContain("räkna fram ersättning");
  });

  it("rör inte en konversation som Kajsa redan har svarat på", async () => {
    await sms("in1", { at: minutesAgo(10) });
    await sms("out1", { at: minutesAgo(5), direction: "out", body: "Tack, jag kollar!" });
    const summary = await runReplyEngine({ db: state.db, force: true });
    expect(summary.processed).toBe(0);
    expect(state.prompts).toHaveLength(0);
    const [d] = await listDecisions(state.db);
    expect(d).toMatchObject({ action: "skipped", reason: "Kajsa har redan svarat eller har ett utkast" });
  });

  it("hanterar bara meddelanden efter aktiveringen och gör inget när den är avstängd", async () => {
    await sms("old", { at: minutesAgo(120) });
    let summary = await runReplyEngine({ db: state.db, force: true });
    expect(summary.processed).toBe(0);

    await sms("new");
    await setMode(state.db, "off");
    summary = await runReplyEngine({ db: state.db, force: true });
    expect(summary.skippedReason).toBe("motorn är avstängd");
    expect(state.prompts).toHaveLength(0);
  });

  it("svarar samlat på flera meddelanden i rad och bara en gång", async () => {
    await sms("a", { at: minutesAgo(8), body: "Hej" });
    await sms("b", { at: minutesAgo(6), body: "Har laddat upp bilder" });
    state.decisions.push(routine());
    await runReplyEngine({ db: state.db, force: true });
    await runReplyEngine({ db: state.db, force: true });
    expect(state.prompts).toHaveLength(1);
    expect(state.prompts[0]).toContain("Hej\nHar laddat upp bilder");
    const out = await state.db.select().from(outboxMessages);
    expect(out).toHaveLength(1);
    expect(out[0].replyToInboxIds).toEqual(["b", "a"]);
  });

  it("svarar på WhatsApp i WhatsApp-kanalen", async () => {
    await sms("w1", { service: "WhatsApp" });
    state.decisions.push(routine());
    await runReplyEngine({ db: state.db, force: true });
    const [out] = await state.db.select().from(outboxMessages);
    const channel = await state.db.all<{ channel: string }>(sql`SELECT channel FROM crm_outbox_channels WHERE outbox_id = ${out.id}`);
    expect(channel[0]?.channel).toBe("whatsapp");
  });

  it("svarar på mejl i samma tråd och loggar svaret", async () => {
    await state.db.insert(emails).values({
      id: "e1", companyId: "c1", contactId: "k1", direction: "in", subject: "Boende i Gävle",
      body: "Hej, vi behöver boende för tre personer från januari.\n\nDen mån 2 nov skrev Kajsa:\n> gammalt",
      fromEmail: "Per <per@bygg.se>", toEmail: "kajsa@stayonsite.se", gmailMessageId: "gm-in-1", gmailThreadId: "thread-1", sentAt: minutesAgo(5),
    });
    state.decisions.push(routine({ partyRole: "företagskund", reply: "Hej Per! Tack. Hur länge räknar ni med att stanna?\n\nVänliga hälsningar,\nKajsa" }));
    const summary = await runReplyEngine({ db: state.db, force: true });
    expect(summary.autoSent).toBe(1);
    expect(vi.mocked(gmailSend)).toHaveBeenCalledWith("user-1", expect.objectContaining({ to: "per@bygg.se", subject: "Re: Boende i Gävle", threadId: "thread-1" }));
    expect(state.prompts[0]).not.toContain("gammalt");
    const out = await state.db.select().from(emails).where(eq(emails.direction, "out"));
    expect(out[0]).toMatchObject({ companyId: "c1", gmailThreadId: "thread-1", toEmail: "per@bygg.se" });
  });

  it("lär sig av att Kajsa ändrar ett utkast", async () => {
    await sms("in1");
    state.decisions.push(routine({ routine: false }));
    await runReplyEngine({ db: state.db, force: true });
    const [draft] = await state.db.select().from(outboxMessages);
    await state.db.update(outboxMessages).set({ status: "queued", body: "Toppen, tack! Jag hör av mig när annonsen är klar." }).where(eq(outboxMessages.id, draft.id));

    await sms("in2", { body: "En fråga till", at: new Date(Date.now() + 60_000).toISOString() });
    state.decisions.push(routine());
    await runReplyEngine({ db: state.db, force: true });
    const decisions = await listDecisions(state.db);
    expect(decisions.find((d) => d.outbox_id === draft.id)).toMatchObject({ feedback: "edited", final_text: "Toppen, tack! Jag hör av mig när annonsen är klar." });
    expect(state.prompts[1]).toContain("Kajsa skickade i stället");
  });

  it("påminner en gång och lämnar sedan över till Kajsa", async () => {
    await sms("in1");
    state.decisions.push(routine({ followUpInHours: 4, reply: "Vilket datum kan bostaden vara ledig från?" }));
    await runReplyEngine({ db: state.db, force: true });
    await state.db.run(sql`UPDATE crm_reply_decisions SET follow_up_at = ${minutesAgo(1)}`);

    state.decisions.push(routine({ reply: "Hej igen! Hann du kolla datumet? /Kajsa", followUpInHours: 24 }));
    let summary = await runReplyEngine({ db: state.db, force: true });
    expect(summary.followUps).toBe(1);
    expect(await state.db.select().from(outboxMessages)).toHaveLength(2);

    // Motorns eget SMS kommer tillbaka från Messages – det är inte ett svar.
    await sms("echo", { direction: "out", body: "Hej igen! Hann du kolla datumet? /Kajsa", at: new Date(Date.now() + 30_000).toISOString() });
    await state.db.run(sql`UPDATE crm_reply_decisions SET follow_up_at = ${minutesAgo(1)} WHERE follow_up_status = 'pending'`);
    summary = await runReplyEngine({ db: state.db, force: true });
    expect(summary.handovers).toBe(1);
    const [o] = await state.db.select().from(owners).where(eq(owners.id, "o1"));
    expect(o.followUpReason).toContain("inget svar efter påminnelse");
    expect(await state.db.select().from(outboxMessages)).toHaveLength(2);
  });

  it("avbryter påminnelsen när kontakten svarar", async () => {
    await sms("in1");
    state.decisions.push(routine({ followUpInHours: 4 }));
    await runReplyEngine({ db: state.db, force: true });
    await state.db.run(sql`UPDATE crm_reply_decisions SET follow_up_at = ${minutesAgo(1)}`);
    await sms("in2", { body: "👍", at: new Date(Date.now() + 60_000).toISOString() });
    state.decisions.push(routine({ needsReply: false, reply: null }));
    await runReplyEngine({ db: state.db, force: true });
    const decisions = await listDecisions(state.db);
    expect(decisions.find((d) => d.source_id === "in1")?.follow_up_status).toBe("cancelled");
    expect(decisions.find((d) => d.source_id === "in2")?.action).toBe("no_reply");
  });

  it("aktiverar från nu när motorn slås på", async () => {
    await setMode(state.db, "off");
    const before = Date.now();
    const settings = await setMode(state.db, "draft");
    expect(new Date(settings.activatedAt!).getTime()).toBeGreaterThanOrEqual(before - 1000);
    expect((await getSettings(state.db)).mode).toBe("draft");
  });
});
