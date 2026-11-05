import { expect, it } from "vitest";
import { husPublishedLinkSms } from "./hus-publication";

it("sends a stable property link in one GSM-7 SMS", () => {
  const message = husPublishedLinkSms("XCTc74ltDJrHAKXlid0Mg");
  const basic = "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
  const extended = "^{}\\[~]|€\f";
  const characters = [...message];
  expect(characters.every((c) => basic.includes(c) || extended.includes(c))).toBe(true);
  expect(characters.reduce((n, c) => n + (extended.includes(c) ? 2 : 1), 0)).toBeLessThanOrEqual(160);
  expect(message).toContain("www.stayonsite.se/boenden/XCTc74ltDJrHAKXlid0Mg");
  expect(message).not.toContain("Exakt adress visas inte");
  expect(message).not.toContain("Svara här");
  expect(message).toContain("/Kajsa, HyrUtSmart - en del av StayOnSite");
});
