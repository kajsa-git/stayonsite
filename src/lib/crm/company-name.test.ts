import { describe, expect, it } from "vitest";
import {
  cleanScrapedSiteName,
  isPlaceholderCompanyName,
  normalizeCompanyFields,
  normalizeCompanyName,
  normalizeOrgNr,
  normalizeWebsite,
  privatePersonLabel,
} from "./company-name";

describe("isPlaceholderCompanyName", () => {
  it.each([
    "Privat", "privat", "Privatperson", "Privat person", "Privat personer", "Privatperson student",
    "Student", "Ingen", "No", "Nej", "000", "-", "Ej företag", "Inga foretag",
    "Anställd på Mälarsjukhuset- har inte företag",
  ])("%s är en platshållare", (value) => {
    expect(isPlaceholderCompanyName(value)).toBe(true);
  });

  it.each([
    "Privatbostäder AB", "Private Equity Partners AB", "Student Housing AB", "Nordic NC",
    "Ingenjörsfirman AB", "Noa Bygg", "0024 Entreprenad AB",
  ])("%s är ett riktigt namn", (value) => {
    expect(isPlaceholderCompanyName(value)).toBe(false);
  });
});

describe("normalizeCompanyName", () => {
  it("avkodar HTML-entities och tar bort upprepningar", () => {
    expect(normalizeCompanyName("SN Byggservice AB &#8211; SN Byggservice AB")).toBe("SN Byggservice AB");
    expect(normalizeCompanyName("Aberga VVS &amp; Svets AB")).toBe("Aberga VVS & Svets AB");
  });

  it("skriver svensk bolagsform i versaler men lämnar finska Oy Ab", () => {
    expect(normalizeCompanyName("Grandvia ab")).toBe("Grandvia AB");
    expect(normalizeCompanyName("Faisalus Ab")).toBe("Faisalus AB");
    expect(normalizeCompanyName("Insolva Oy Ab")).toBe("Insolva Oy Ab");
  });

  it("returnerar null för platshållare", () => {
    expect(normalizeCompanyName("Privat")).toBeNull();
    expect(normalizeCompanyName("  ")).toBeNull();
  });
});

describe("privatePersonLabel", () => {
  it("föredrar namn, sedan mejl, sedan telefon", () => {
    expect(privatePersonLabel({ name: "Anna Berg", email: "a@gmail.com" })).toBe("Privatperson · Anna Berg");
    expect(privatePersonLabel({ email: "a@gmail.com", phone: "+4670" })).toBe("Privatperson · a@gmail.com");
    expect(privatePersonLabel({})).toBe("Privatperson");
  });
});

describe("cleanScrapedSiteName", () => {
  it("väljer segmentet som liknar domänen", () => {
    expect(cleanScrapedSiteName("Etusivu | Prepipe", "prepipe.fi", "title")).toBe("Prepipe");
    expect(cleanScrapedSiteName("Insolva Oy Ab | Teollisuuden eristysurakointi", "insolva.fi", "title")).toBe("Insolva Oy Ab");
    expect(cleanScrapedSiteName(
      "Sveda &amp; V&auml;rk &#8211; Sjuksk&ouml;terskebemanning till offentlig- och privat sektor.",
      "sveda-vark.se",
      "title",
    )).toBe("Sveda & Värk");
    expect(cleanScrapedSiteName("Home - Nordicapartrent", "nordicapartrent.com", "title")).toBe("Nordicapartrent");
  });

  it("ger null för felsidor och slogans utan bolagsnamn", () => {
    expect(cleanScrapedSiteName("Access Denied", "skane.se", "title")).toBeNull();
    expect(cleanScrapedSiteName("European Scaffolding Training &amp; Accreditation", "efecta.lt", "title")).toBeNull();
  });

  it("litar på og:site_name även när det inte liknar domänen", () => {
    expect(cleanScrapedSiteName("Lokala hantverkarna i sverige", "lokalahantverkarna.se", "og:site_name"))
      .toBe("Lokala hantverkarna i sverige");
    expect(cleanScrapedSiteName("Acme Group", "acme-bygg.se", "og:site_name")).toBe("Acme Group");
  });
});

describe("normalizeOrgNr", () => {
  it("formaterar svenska nummer och lämnar utländska", () => {
    expect(normalizeOrgNr("5592185846")).toBe("559218-5846");
    expect(normalizeOrgNr("556681-6111")).toBe("556681-6111");
    expect(normalizeOrgNr("19550101-1232")).toBe("550101-1232");
    expect(normalizeOrgNr("5242876112")).toBe("5242876112"); // polskt NIP, ogiltig svensk kontrollsiffra
    expect(normalizeOrgNr("NIP:6272412576")).toBe("NIP:6272412576");
    expect(normalizeOrgNr("306108772")).toBe("306108772");
    expect(normalizeOrgNr(" ")).toBeNull();
  });
});

describe("normalizeWebsite", () => {
  it("lägger till https och kortar kontaktsidor", () => {
    expect(normalizeWebsite("www.easyflat.se")).toBe("https://www.easyflat.se");
    expect(normalizeWebsite("https://limab-ref.se/kontakta-oss/")).toBe("https://limab-ref.se");
    expect(normalizeWebsite("https://nordarmering.se/")).toBe("https://nordarmering.se");
    expect(normalizeWebsite("https://www.nuvia.com/sv/om-nuvia/")).toBe("https://www.nuvia.com/sv/om-nuvia");
  });
});

describe("normalizeCompanyFields", () => {
  it("rör bara fält som finns och behåller CRM-etiketter", () => {
    expect(normalizeCompanyFields({ orgNr: "5567930135" })).toEqual({ orgNr: "556793-0135" });
    expect(normalizeCompanyFields({ name: "Webbförfrågan · a@gmail.com" }).name).toBe("Webbförfrågan · a@gmail.com");
    expect(normalizeCompanyFields({ name: "Grandvia ab", city: "Umeå" })).toEqual({ name: "Grandvia AB", city: "Umeå" });
  });
});
