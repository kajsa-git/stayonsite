import { describe, expect, it } from "vitest";
import { agreementValidUntil, isAcceptanceValid, UPPDRAGSBEKRAFTELSE } from "./avtal";

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
});
