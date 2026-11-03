import { describe, expect, it } from "vitest";
import { classifyDelivery, shouldForceSms } from "../../../scripts/imessage-delivery.mjs";

const pending = { body: "Hej Anna", sentAtMs: 1_000_000 };
const row = { body: "Hej Anna", atMs: 1_001_000, error: 0, isDelivered: 0 };

describe("leveranskvitto", () => {
  it("väljer sms för matchningar utan att ändra vanliga meddelanden", () => {
    expect(shouldForceSms("landlord_match", false)).toBe(true);
    expect(shouldForceSms("crm", false)).toBe(false);
  });
  it("visar levererat bara när Messages bekräftat det", () => {
    expect(classifyDelivery([row], pending)).toBe("unknown");
    expect(classifyDelivery([{ ...row, isDelivered: 1 }], pending)).toBe("delivered");
  });
  it("rapporterar ett faktiskt fel", () => {
    expect(classifyDelivery([{ ...row, error: 22 }], pending)).toBe("failed");
  });
  it("drar ingen slutsats av fel text, gamla meddelanden eller tvetydiga träffar", () => {
    expect(classifyDelivery([{ ...row, body: "Hej Anna igen", isDelivered: 1 }], pending)).toBe("unknown");
    expect(classifyDelivery([{ ...row, atMs: 800_000, isDelivered: 1 }], pending)).toBe("unknown");
    expect(classifyDelivery([{ ...row, isDelivered: 1 }, { ...row, isDelivered: 1 }], pending)).toBe("unknown");
  });
});
