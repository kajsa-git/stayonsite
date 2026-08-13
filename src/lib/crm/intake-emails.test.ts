import { describe, expect, it } from "vitest";
import { buildIntakeConfirmationEmail, buildIntakeNotificationEmail } from "./intake-emails";
import { intakeConfirmSms } from "./sms-templates";

describe("buildIntakeConfirmationEmail", () => {
  it("innehåller adress, bildantal, båda stegen och länken", () => {
    const mail = buildIntakeConfirmationEmail({
      ownerName: "Anna Andersson",
      address: "Gatan 1",
      city: "Boden",
      imageCount: 5,
      token: "tok123",
    });
    expect(mail.subject).toBe("Tack — vi har tagit emot din bostad");
    expect(mail.text).toContain("Hej Anna,");
    expect(mail.text).toContain("Gatan 1, Boden");
    expect(mail.text).toContain("5 bilder");
    expect(mail.text).toContain("Godkänn att annonsen får visas online");
    expect(mail.text).toContain("Signera uthyrningsuppdraget");
    expect(mail.text).toContain("https://www.stayonsite.se/uthyrare/tok123");
    expect(mail.html).toContain("uthyrare/tok123");
    // Textriktlinjerna: exakt adress-integriteten uttalad
    expect(mail.text).toContain("exakt adress visas aldrig publikt");
  });

  it("utan token: kvitto utan steg-sektion", () => {
    const mail = buildIntakeConfirmationEmail({ ownerName: null, address: null, city: "Luleå", imageCount: 0, token: null });
    expect(mail.text).toContain("Hej,");
    expect(mail.text).not.toContain("uthyrare/");
    expect(mail.text).not.toContain("Två snabba steg");
  });
});

describe("buildIntakeNotificationEmail", () => {
  it("innehåller nyckelfakta och CRM-djuplänk", () => {
    const mail = buildIntakeNotificationEmail({
      propertyId: "prop1",
      ownerName: "Anna Andersson",
      ownerPhone: "+46701234567",
      ownerEmail: null,
      ownerType: "privatperson",
      address: "Gatan 1",
      city: "Boden",
      imageCount: 3,
      imageErrors: ["bild 2: duplicate_image"],
    });
    expect(mail.subject).toBe("Nytt bostadsintag: Gatan 1, Boden — 3 bilder");
    expect(mail.text).toContain("https://www.stayonsite.se/crm/properties?id=prop1");
    expect(mail.text).toContain("+46701234567");
    expect(mail.text).toContain("3 uppladdade, 1 fel");
    expect(mail.text).toContain("bekräftelse gick som SMS");
  });
});

describe("intakeConfirmSms", () => {
  it("kvitto + länk utan https:// (smishing-filtren)", () => {
    const sms = intakeConfirmSms("Anna Andersson", "tok123");
    expect(sms).toContain("Hej Anna!");
    expect(sms).toContain("www.stayonsite.se/uthyrare/tok123");
    expect(sms).not.toContain("https://");
    expect(sms).toContain("/Kajsa, StayOnSite");
  });

  it("utan token: bara kvittot", () => {
    const sms = intakeConfirmSms(null, null);
    expect(sms).toContain("Hej!");
    expect(sms).not.toContain("uthyrare/");
  });
});
