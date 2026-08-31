import { describe, expect, it } from "vitest";
import {
  buildCorporateQualificationEmail,
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

  it("skickar inte kvalificeringsmejl för gamla snabbformulär utan bolag", () => {
    expect(isCorporateQualificationSubmission({
      formType: "hero-intent",
      locale: "sv",
      fields: {
        ort: "Göteborg",
        antal_personer: "1",
        email: "test@example.com",
        phone: "0701234567",
      },
    })).toBe(false);
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
});
