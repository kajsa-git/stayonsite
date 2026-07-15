import { describe, expect, it } from "vitest";
import { formatPhoneSv, normalizePhoneE164, normalizePhoneForStorage, smsHref, whatsappHref } from "./phone-links";

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

  it("svensk mobil utan inledande nolla → +46 (inte +7)", () => {
    expect(normalizePhoneE164("706629338")).toBe("+46706629338");
    expect(normalizePhoneE164("722038459")).toBe("+46722038459");
  });

  it("avvisar skräp och för korta nummer", () => {
    expect(normalizePhoneE164("")).toBeNull();
    expect(normalizePhoneE164(null)).toBeNull();
    expect(normalizePhoneE164("1234")).toBeNull();
    expect(normalizePhoneE164("ring mig")).toBeNull();
  });
});

describe("normalizePhoneForStorage", () => {
  it("normaliserar till E.164", () => {
    expect(normalizePhoneForStorage("070-123 45 67")).toBe("+46701234567");
    expect(normalizePhoneForStorage("  0701234567 ")).toBe("+46701234567");
    expect(normalizePhoneForStorage("+46 70 123 45 67")).toBe("+46701234567");
  });

  it("bevarar otolkbar text trimmad i stället för att tappa den", () => {
    expect(normalizePhoneForStorage(" ring efter 17 ")).toBe("ring efter 17");
    expect(normalizePhoneForStorage("1234")).toBe("1234");
  });

  it("tomt → null", () => {
    expect(normalizePhoneForStorage("")).toBeNull();
    expect(normalizePhoneForStorage("   ")).toBeNull();
    expect(normalizePhoneForStorage(null)).toBeNull();
    expect(normalizePhoneForStorage(undefined)).toBeNull();
  });
});

describe("formatPhoneSv", () => {
  it("mobil: 07X-XXX XX XX", () => {
    expect(formatPhoneSv("+46701234567")).toBe("070-123 45 67");
    expect(formatPhoneSv("+46733445566")).toBe("073-344 55 66");
  });

  it("Stockholm 08 med tvåsiffrigt riktnummer", () => {
    expect(formatPhoneSv("+46812345678")).toBe("08-12 34 56 78");
    expect(formatPhoneSv("+468123456")).toBe("08-12 34 56");
  });

  it("övriga riktnummer som tresiffriga", () => {
    expect(formatPhoneSv("+46261234567")).toBe("026-123 45 67");
    expect(formatPhoneSv("+4663123456")).toBe("063-12 34 56");
  });

  it("utländska nummer och fritext lämnas orörda", () => {
    expect(formatPhoneSv("+12125550199")).toBe("+12125550199");
    expect(formatPhoneSv("ring efter 17")).toBe("ring efter 17");
  });

  it("tomt → null", () => {
    expect(formatPhoneSv(null)).toBeNull();
    expect(formatPhoneSv("")).toBeNull();
  });
});

describe("whatsappHref / smsHref", () => {
  it("bygger korrekta länkar", () => {
    expect(whatsappHref("070-123 45 67")).toBe("https://wa.me/46701234567");
    expect(smsHref("070-123 45 67")).toBe("sms:+46701234567");
  });

  it("ger null för otolkbara nummer", () => {
    expect(whatsappHref("hej")).toBeNull();
    expect(smsHref(undefined)).toBeNull();
  });
});
