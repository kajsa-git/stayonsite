import { describe, expect, it } from "vitest";
import { normalizePhoneE164, smsHref, whatsappHref } from "./phone-links";

describe("normalizePhoneE164", () => {
  it("svenskt nationellt format → +46…", () => {
    expect(normalizePhoneE164("070-123 45 67")).toBe("+46701234567");
    expect(normalizePhoneE164("0701234567")).toBe("+46701234567");
    expect(normalizePhoneE164("08-123 456")).toBe("+468123456");
  });

  it("internationellt format bevaras", () => {
    expect(normalizePhoneE164("+46 70 123 45 67")).toBe("+46701234567");
    expect(normalizePhoneE164("0046701234567")).toBe("+46701234567");
    expect(normalizePhoneE164("+1 (212) 555-0199")).toBe("+12125550199");
  });

  it("redan med landskod utan plus", () => {
    expect(normalizePhoneE164("46701234567")).toBe("+46701234567");
  });

  it("avvisar skräp och för korta nummer", () => {
    expect(normalizePhoneE164("")).toBeNull();
    expect(normalizePhoneE164(null)).toBeNull();
    expect(normalizePhoneE164("1234")).toBeNull();
    expect(normalizePhoneE164("ring mig")).toBeNull();
  });
});

describe("whatsappHref / smsHref", () => {
  it("bygger korrekta länkar", () => {
    expect(whatsappHref("070-123 45 67")).toBe("whatsapp://send?phone=46701234567");
    expect(smsHref("070-123 45 67")).toBe("sms:+46701234567");
  });

  it("ger null för otolkbara nummer", () => {
    expect(whatsappHref("hej")).toBeNull();
    expect(smsHref(undefined)).toBeNull();
  });
});
