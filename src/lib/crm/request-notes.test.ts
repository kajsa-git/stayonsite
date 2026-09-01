import { describe, expect, it } from "vitest";
import { parseWebRequestNote } from "./request-notes";

describe("parseWebRequestNote", () => {
  it("lyfter kontaktuppgifter från en webbanteckning och döljer metadata från övrig anteckning", () => {
    const parsed = parseWebRequestNote([
      "Inkommen från webb (hero-intent)",
      "Källa: foretag-conversion",
      "Sida: /for-foretag",
      "Språk: sv",
      "UTM: gclid=abc123, gad_source=1",
      "E-post: oriadcitsirk77@gmail.com",
      "Telefon: 076-097 08 01",
    ].join("\n"));

    expect(parsed).toMatchObject({
      formType: "hero-intent",
      source: "foretag-conversion",
      page: "/for-foretag",
      locale: "sv",
      utm: "gclid=abc123, gad_source=1",
      email: "oriadcitsirk77@gmail.com",
      phone: "076-097 08 01",
      message: null,
      remainingNote: null,
    });
  });

  it("bevarar flerradigt meddelande fram till nästa kända fält", () => {
    const parsed = parseWebRequestNote([
      "Inkommen från webb (inquiry)",
      "Sida: /kontakt",
      "Meddelande:",
      "Från omgående - tillsvidare",
      "Parkering.",
      "E-post: dario@example.com",
      "Telefon: 0701234567",
    ].join("\n"));

    expect(parsed?.message).toBe("Från omgående - tillsvidare\nParkering.");
    expect(parsed?.email).toBe("dario@example.com");
    expect(parsed?.phone).toBe("0701234567");
    expect(parsed?.remainingNote).toBeNull();
  });

  it("returnerar null för vanliga manuella anteckningar", () => {
    expect(parseWebRequestNote("Han heter Dario")).toBeNull();
  });
});
