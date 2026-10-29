import { describe, expect, it } from "vitest";
import {
  buildCorporateQualificationEmail,
  buildPrivateCustomerReply,
  corporateQualificationRecipient,
  isCorporateQualificationSubmission,
} from "./corporate-qualification-email";

describe("corporate qualification email", () => {
  it("identifierar svenska företagslead från snabbförfrågan", () => {
    const submission = {
      formType: "hero-intent",
      locale: "sv" as const,
      fields: {
        city: "Sigtuna",
        people: "4",
        company: "BC Bygglösningar AB",
        email: "mikael@bygglosningar.net",
      },
    };

    expect(isCorporateQualificationSubmission(submission)).toBe(true);
    expect(corporateQualificationRecipient(submission)).toBe("mikael@bygglosningar.net");
  });

  it("kvalificerar snabbförfrågningar utan tydligt bolag och frågar vilket företag det gäller", () => {
    const submission = {
      formType: "hero-intent",
      locale: "sv" as const,
      fields: {
        ort: "Göteborg",
        antal_personer: "1",
        email: "test@example.com",
        phone: "0701234567",
      },
    };

    expect(isCorporateQualificationSubmission(submission)).toBe(true);
    expect(corporateQualificationRecipient(submission)).toBe("test@example.com");

    const email = buildCorporateQualificationEmail(submission);
    expect(email.text).toContain("Gäller förfrågan ett företag som ska stå som hyresgäst?");
    expect(email.text).toContain("fullständiga namn och organisationsnummer");
    expect(email.crmNote).toContain("företag/juridiskt namn/organisationsnummer");
  });

  it("använder e-post från äldre kontaktfält och frågar om företag", () => {
    const submission = {
      formType: "hero-intent",
      locale: "sv" as const,
      fields: {
        ort: "Göteborg",
        antal_personer: "2",
        kontakt: "kund@example.com",
      },
    };

    expect(isCorporateQualificationSubmission(submission)).toBe(true);
    expect(corporateQualificationRecipient(submission)).toBe("kund@example.com");
    expect(buildCorporateQualificationEmail(submission).text).toContain("Gäller förfrågan ett företag");
  });

  it("frågar om eget boende men aldrig om delat boende", () => {
    const email = buildCorporateQualificationEmail({
      formType: "hero-intent",
      locale: "sv",
      fields: {
        city: "Vällingby",
        people: "1",
        company: "IF Brommapojkarna",
        email: "staffan.jacobsson@bpfotboll.se",
      },
    });

    expect(email.subject).toBe("Boende i Vällingby – några snabba frågor");
    expect(email.text).toContain("Vilken typ av eget boende söker ni");
    expect(email.text).toContain("lägenhet, studio, hus eller flera separata boenden");
    expect(email.text).not.toContain("Gäller förfrågan ett företag");
    expect(email.text.toLowerCase()).not.toContain("delat boende");
    expect(email.html.toLowerCase()).not.toContain("delat boende");
  });

  it("skickar projektbrief-kvitto utan fler kvalificeringsfrågor", () => {
    const submission = {
      formType: "project-brief",
      locale: "sv" as const,
      fields: {
        projectLocations: "Säffle och Arvika",
        people: "45",
        legalCompany: "Montagebolaget AB",
        email: "projekt@montagebolaget.se",
      },
    };

    expect(isCorporateQualificationSubmission(submission)).toBe(true);
    expect(corporateQualificationRecipient(submission)).toBe("projekt@montagebolaget.se");

    const email = buildCorporateQualificationEmail(submission);

    expect(email.subject).toBe("Projektbrief mottagen – Säffle och Arvika");
    expect(email.text).toContain("Jag går igenom ort, datum, sökradie");
    expect(email.text).not.toContain("Från vilket datum behövs boendet?");
    expect(email.text).not.toContain("24 timmar");
  });

  it("skickar polska frågor från den polska sajten", () => {
    const email = buildCorporateQualificationEmail({
      formType: "lp-corporate",
      locale: "pl",
      fields: {
        city: "Sztokholm",
        people: "3",
        company: "Budowa PL",
        email: "projekt@budowa.pl",
      },
    });

    expect(email.subject).toBe("Zakwaterowanie w Sztokholm – kilka krótkich pytań");
    expect(email.text).toContain("Od jakiej daty potrzebne jest zakwaterowanie?");
    expect(email.text).toContain("3 osób");
    expect(email.text).not.toContain("Från vilket datum");
  });

  it("bygger ett artigt avböjande för privatpersoner på formulärets språk", () => {
    const swedish = buildPrivateCustomerReply("sv");
    expect(swedish.text).toContain("hyr endast ut möblerade boenden till företag");
    expect(swedish.text).toContain("lycka till med ditt fortsatta bostadssökande");

    const english = buildPrivateCustomerReply("en");
    expect(english.text).toContain("only rents furnished accommodation to companies");
    expect(english.text).toContain("cannot help with a private rental");

    const polish = buildPrivateCustomerReply("pl");
    expect(polish.text).toContain("wyłącznie firmom");
    expect(polish.text).toContain("nie możemy pomóc w wynajmie prywatnym");
  });
});
