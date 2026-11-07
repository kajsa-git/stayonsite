import { describe, expect, it } from "vitest";
import { applyPolicy, isOptOut, nextFollowUpAt, replyTextProblems, withinActiveHours, type ModelDecision } from "./policy";

const base: ModelDecision = {
  partyRole: "uthyrare",
  intent: "skickar bilder",
  stage: "registrering",
  outcomeGoal: "publicerad bostad",
  needsReply: true,
  reply: "Tack! Jag har fått bilderna och tittar på dem i dag. /Kajsa",
  replySubject: null,
  routine: true,
  confidence: 0.92,
  riskFlags: [],
  handover: false,
  handoverReason: null,
  followUpInHours: null,
  followUpReason: null,
  kajsaTask: null,
  nextStep: null,
  summary: "",
};

const input = (d: Partial<ModelDecision> = {}, extra: Partial<Parameters<typeof applyPolicy>[0]> = {}) =>
  applyPolicy({ mode: "auto", channel: "sms", inboundText: "Här kommer bilderna", decision: { ...base, ...d }, autoSentLast24h: 0, ...extra });

describe("svarsmotorns regler", () => {
  it("skickar ett säkert rutinsvar direkt", () => {
    expect(input()).toMatchObject({ action: "auto_sent", draft: false, notifyKajsa: false });
  });

  it("lägger risker som utkast och hos Kajsa", () => {
    const r = input({ riskFlags: ["price"], reply: "Jag återkommer om priset." });
    expect(r).toMatchObject({ action: "handover", draft: true, notifyKajsa: true });
  });

  it("stoppar belopp, avtalsord och okända länkar även om modellen säger rutin", () => {
    expect(input({ reply: "Hyran blir 12 500 kr i månaden." }).action).toBe("draft");
    expect(input({ reply: "Jag skickar avtalet i kväll." }).action).toBe("draft");
    expect(input({ reply: "Se https://example.com/annons" }).action).toBe("draft");
    expect(input({ reply: "Registrera bostaden här: https://www.stayonsite.se/registrera-bostad" }).action).toBe("auto_sent");
    expect(replyTextProblems("We will send the contract and invoice", "email")).toContain("rör avtal, betalning eller löften");
    expect(replyTextProblems("Cena 3000 zł miesięcznie", "whatsapp")).toContain("innehåller belopp");
  });

  it("kräver hög säkerhet och rutin", () => {
    expect(input({ confidence: 0.6 }).action).toBe("draft");
    expect(input({ routine: false }).action).toBe("draft");
  });

  it("skickar aldrig mer än två automatiska svar per dygn", () => {
    expect(input({}, { autoSentLast24h: 2 }).action).toBe("draft");
  });

  it("utkastläget skickar aldrig", () => {
    expect(input({}, { mode: "draft" })).toMatchObject({ action: "draft", draft: true });
  });

  it("skuggläget gör ingenting", () => {
    expect(input({}, { mode: "shadow" })).toMatchObject({ action: "shadow", draft: false, notifyKajsa: false });
  });

  it("svarar aldrig när kontakten ber oss sluta", () => {
    expect(isOptOut("Sluta skicka sms tack")).toBe(true);
    expect(isOptOut("STOP")).toBe(true);
    expect(input({}, { inboundText: "Snälla sluta höra av er" })).toMatchObject({ action: "handover", draft: false, notifyKajsa: true });
  });

  it("säger till Kajsa när ett automatiskt svar lovar något av henne", () => {
    expect(input({ kajsaTask: "skicka boendeförslag" })).toMatchObject({ action: "auto_sent", notifyKajsa: true });
  });

  it("lämnar över när ett svar behövs men motorn inte kan ge det", () => {
    expect(input({ reply: null, handover: true, handoverReason: "kunden klagar" })).toMatchObject({ action: "handover", draft: false, notifyKajsa: true });
  });

  it("svarar inte när inget svar behövs", () => {
    expect(input({ needsReply: false, reply: null })).toMatchObject({ action: "no_reply", notifyKajsa: false });
  });

  it("lägger en uppgift hos Kajsa även när inget svar behövs", () => {
    expect(input({ needsReply: false, reply: null, kajsaTask: "notera att internet ingår" })).toMatchObject({ action: "no_reply", notifyKajsa: true });
    expect(input({ needsReply: false, reply: null, kajsaTask: "notera" }, { mode: "shadow" })).toMatchObject({ action: "shadow", notifyKajsa: false });
  });
});

describe("tider", () => {
  it("är aktiv 07–21 svensk tid", () => {
    expect(withinActiveHours(new Date("2026-11-09T05:30:00Z"))).toBe(false); // 06:30
    expect(withinActiveHours(new Date("2026-11-09T06:30:00Z"))).toBe(true); // 07:30
    expect(withinActiveHours(new Date("2026-11-09T20:10:00Z"))).toBe(false); // 21:10
  });

  it("lägger påminnelser på vardagar 08–18", () => {
    // Fredag 17:00 + 3 h → måndag morgon
    const at = nextFollowUpAt(3, new Date("2026-11-13T16:00:00Z"));
    const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Stockholm", weekday: "short", hour: "2-digit", hourCycle: "h23" }).formatToParts(at);
    expect(parts.find((p) => p.type === "weekday")?.value).toBe("Mon");
    expect(Number(parts.find((p) => p.type === "hour")?.value)).toBeGreaterThanOrEqual(8);
    // Minst två och högst 72 timmar
    const now = new Date("2026-11-10T08:00:00Z");
    expect(nextFollowUpAt(0, now).getTime() - now.getTime()).toBeGreaterThanOrEqual(2 * 3600_000);
  });
});
