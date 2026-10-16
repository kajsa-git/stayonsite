import { describe, expect, it } from "vitest";
import { agreementValidUntil, isAcceptanceValid, UPPDRAGSBEKRAFTELSE, UTHYRNINGSUPPDRAG, UTHYRNINGSUPPDRAG_EN } from "./avtal";

// Giltighetsreglerna är gate-logik: fel här betyder antingen att parter släpps
// förbi utan giltigt avtal, eller att giltiga avtal avvisas och gaten spammar.

describe("agreementValidUntil", () => {
  it("ger 12 månader från signering", () => {
    expect(agreementValidUntil("2026-07-13T10:00:00Z")).toBe("2027-07-13");
  });
});

describe("isAcceptanceValid", () => {
  const now = new Date();
  const recent = new Date(now.getTime() - 24 * 3600 * 1000).toISOString(); // igår
  const thirteenMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth() - 1, 1).toISOString();

  it("giltig: rätt version, inom 12 mån", () => {
    expect(isAcceptanceValid({ version: UPPDRAGSBEKRAFTELSE.version, acceptedAt: recent }, UPPDRAGSBEKRAFTELSE)).toBe(true);
  });

  it("ogiltig: gammal version", () => {
    expect(isAcceptanceValid({ version: "2026-01-01", acceptedAt: recent }, UPPDRAGSBEKRAFTELSE)).toBe(false);
  });

  it("ogiltig: utgången (äldre än 12 mån)", () => {
    expect(
      isAcceptanceValid({ version: UPPDRAGSBEKRAFTELSE.version, acceptedAt: thirteenMonthsAgo }, UPPDRAGSBEKRAFTELSE)
    ).toBe(false);
  });

  it("ogiltig: saknas", () => {
    expect(isAcceptanceValid(null, UPPDRAGSBEKRAFTELSE)).toBe(false);
  });

  it.each(["2026-07-13.7", "2026-07-16.8"])("behåller uthyrarens tidigare version %s till ursprungligt slutdatum", (version) => {
    const acceptance = { version, acceptedAt: recent };
    expect(isAcceptanceValid(acceptance, UTHYRNINGSUPPDRAG)).toBe(true);
    expect(isAcceptanceValid(acceptance, UTHYRNINGSUPPDRAG_EN)).toBe(true);
  });

  it.each(["2026-07-13.7", "2026-07-16.8"])("kräver förnyelse när tidigare version %s har gått ut", (version) => {
    expect(isAcceptanceValid({ version, acceptedAt: thirteenMonthsAgo }, UTHYRNINGSUPPDRAG)).toBe(false);
  });

  it("godtar inte en okänd uthyrarversion", () => {
    expect(isAcceptanceValid({ version: "unknown", acceptedAt: recent }, UTHYRNINGSUPPDRAG)).toBe(false);
  });

  it("uthyrarens versionsundantag gäller inte kundavtal", () => {
    expect(isAcceptanceValid({ version: "2026-07-16.8", acceptedAt: recent }, UPPDRAGSBEKRAFTELSE)).toBe(false);
  });
});
