import { describe, expect, it } from "vitest";
import {
  buildAddressBook,
  counterpartAddresses,
  isAutomaticMessage,
  isOutgoing,
  parseAddressList,
  resolveMessageLinks,
  splitStoredEmails,
  suggestSender,
  websiteDomain,
} from "./email-matching";

const MAILBOX = "kajsa@stayonsite.se";

const book = buildAddressBook({
  contacts: [
    { id: "ct-anna", companyId: "co-bygg", email: "Anna.Berg@Byggbolaget.se " },
    { id: "ct-per", companyId: "co-el", email: "per@elfirma.se; per.privat@gmail.com" },
    { id: "ct-dual", companyId: "co-el", email: "lisa@elfirma.se" },
  ],
  companies: [
    { id: "co-bygg", website: "https://www.byggbolaget.se/kontakt", invoiceEmail: "faktura@byggbolaget.se" },
    { id: "co-el", website: null, invoiceEmail: null },
    { id: "co-bygg-norr", website: "byggbolaget.se", invoiceEmail: null },
    { id: "co-own", website: "stayonsite.se", invoiceEmail: null },
  ],
  owners: [
    { id: "ow-lisa", email: "lisa@elfirma.se" },
    { id: "ow-sven", email: "sven.hus@hotmail.com" },
  ],
});

function headers(from: string, to = MAILBOX, cc = "", extra: Partial<{ autoSubmitted: string; precedence: string; listUnsubscribe: string }> = {}) {
  return { from, to, cc, ...extra };
}

describe("parseAddressList", () => {
  it("reads display names, quoted commas and bare addresses", () => {
    expect(parseAddressList('"Berg, Anna" <Anna.Berg@byggbolaget.se>, per@elfirma.se, Lisa <lisa@elfirma.se>')).toEqual([
      { email: "anna.berg@byggbolaget.se", name: "Berg, Anna" },
      { email: "per@elfirma.se", name: null },
      { email: "lisa@elfirma.se", name: "Lisa" },
    ]);
  });

  it("ignores duplicates and garbage", () => {
    expect(parseAddressList("undisclosed-recipients:;, a@b.se, A@B.se")).toEqual([{ email: "a@b.se", name: null }]);
    expect(parseAddressList("")).toEqual([]);
  });
});

describe("stored values", () => {
  it("splits several addresses in one CRM field", () => {
    expect(splitStoredEmails("per@elfirma.se; per.privat@gmail.com, nope")).toEqual(["per@elfirma.se", "per.privat@gmail.com"]);
  });

  it("extracts a domain from a website", () => {
    expect(websiteDomain("https://www.peab.se/om-oss")).toBe("peab.se");
    expect(websiteDomain("skanska.se")).toBe("skanska.se");
    expect(websiteDomain("")).toBeNull();
    expect(websiteDomain("inte en sida")).toBeNull();
  });
});

describe("direction and counterparts", () => {
  it("treats the own mailbox and own domains as outgoing", () => {
    expect(isOutgoing(headers("Kajsa <kajsa@stayonsite.se>", "anna.berg@byggbolaget.se"), MAILBOX)).toBe(true);
    expect(isOutgoing(headers("info@stayonsite.se", "x@y.se"), MAILBOX)).toBe(true);
    expect(isOutgoing(headers("anna.berg@byggbolaget.se"), MAILBOX)).toBe(false);
  });

  it("excludes own addresses from counterparts", () => {
    const list = counterpartAddresses(headers("Kajsa <kajsa@stayonsite.se>", "anna.berg@byggbolaget.se", "info@stayonsite.se, per@elfirma.se"), MAILBOX);
    expect(list.map((a) => a.email)).toEqual(["anna.berg@byggbolaget.se", "per@elfirma.se"]);
  });
});

describe("resolveMessageLinks", () => {
  it("links an incoming mail from a known contact to the company and contact", () => {
    expect(resolveMessageLinks(headers("Anna <anna.berg@byggbolaget.se>"), book, MAILBOX)).toEqual({
      companyId: "co-bygg",
      contactId: "ct-anna",
      ownerId: null,
    });
  });

  it("links an outgoing mail by its recipient", () => {
    expect(resolveMessageLinks(headers(MAILBOX, "per.privat@gmail.com"), book, MAILBOX)).toEqual({
      companyId: "co-el",
      contactId: "ct-per",
      ownerId: null,
    });
  });

  it("links a person who is both contact and landlord to both", () => {
    expect(resolveMessageLinks(headers("lisa@elfirma.se"), book, MAILBOX)).toEqual({
      companyId: "co-el",
      contactId: "ct-dual",
      ownerId: "ow-lisa",
    });
  });

  it("links invoice addresses to the company without a contact", () => {
    expect(resolveMessageLinks(headers("faktura@byggbolaget.se"), book, MAILBOX)).toEqual({
      companyId: "co-bygg",
      contactId: null,
      ownerId: null,
    });
  });

  it("keeps an existing thread link for an unknown colleague replying in the thread", () => {
    expect(resolveMessageLinks(headers("ny.kollega@byggbolaget.se"), book, MAILBOX, { companyId: "co-bygg", ownerId: null })).toEqual({
      companyId: "co-bygg",
      contactId: null,
      ownerId: null,
    });
  });

  it("returns no links for strangers", () => {
    expect(resolveMessageLinks(headers("someone@random.se"), book, MAILBOX)).toEqual({ companyId: null, contactId: null, ownerId: null });
  });
});

describe("suggestSender", () => {
  it("suggests an unknown sender on a known company domain, with all candidate companies", () => {
    expect(suggestSender(headers('"Olsson, Erik" <erik.olsson@byggbolaget.se>'), book, MAILBOX)).toEqual({
      email: "erik.olsson@byggbolaget.se",
      name: "Olsson, Erik",
      domain: "byggbolaget.se",
      companyIds: ["co-bygg", "co-bygg-norr"],
    });
  });

  it("matches subdomains to the company domain", () => {
    expect(suggestSender(headers("drift@mail.elfirma.se"), book, MAILBOX)?.companyIds).toEqual(["co-el"]);
  });

  it("never suggests freemail, own, known, outgoing or automatic senders", () => {
    expect(suggestSender(headers("stranger@gmail.com"), book, MAILBOX)).toBeNull();
    expect(suggestSender(headers("kollega@stayonsite.se"), book, MAILBOX)).toBeNull();
    expect(suggestSender(headers("anna.berg@byggbolaget.se"), book, MAILBOX)).toBeNull();
    expect(suggestSender(headers(MAILBOX, "erik@byggbolaget.se"), book, MAILBOX)).toBeNull();
    expect(suggestSender(headers("noreply@byggbolaget.se"), book, MAILBOX)).toBeNull();
    expect(suggestSender(headers("nyhetsbrev@byggbolaget.se", MAILBOX, "", { listUnsubscribe: "<mailto:x@y.se>" }), book, MAILBOX)).toBeNull();
    expect(suggestSender(headers("erik@byggbolaget.se", MAILBOX, "", { autoSubmitted: "auto-replied" }), book, MAILBOX)).toBeNull();
  });
});

describe("isAutomaticMessage", () => {
  it("recognises auto replies, bulk mail and no-reply senders", () => {
    expect(isAutomaticMessage(headers("a@b.se", MAILBOX, "", { autoSubmitted: "auto-generated" }))).toBe(true);
    expect(isAutomaticMessage(headers("a@b.se", MAILBOX, "", { autoSubmitted: "no" }))).toBe(false);
    expect(isAutomaticMessage(headers("a@b.se", MAILBOX, "", { precedence: "bulk" }))).toBe(true);
    expect(isAutomaticMessage(headers("Mailer-Daemon@googlemail.com"))).toBe(true);
    expect(isAutomaticMessage(headers("anna@byggbolaget.se"))).toBe(false);
  });
});
