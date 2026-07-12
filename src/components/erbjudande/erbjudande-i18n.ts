// Strängar för kundens erbjudandesida (/erbjudande/<token>). Samma Lang/pickLang
// som prospektet — avtalsgaten (uppdragsbekräftelsen) är dock alltid svensk,
// texten i src/lib/crm/avtal.ts är originalet som godkänns.

import type { Lang } from "@/components/prospekt/prospekt-i18n";

export const OFFER_T: Record<Lang, {
  tagline: string;
  heading: (company: string | null) => string;
  intro: (n: number) => string;
  persons: (n: number) => string;
  period: string;
  ongoing: string;
  yourPrice: string;
  perMonth: string;
  note: string;
  priceLocked: string;
  status: { sent: string; accepted: string; unavailable: string };
  unavailableInfo: string;
  ctaTitle: string;
  ctaSub: string;
  ctaButton: string;
  ctaHref: string;
  agreementBadge: (name: string, date: string) => string;
  footer: string;
}> = {
  sv: {
    tagline: "Ert boendeförslag",
    heading: (c) => (c ? `Boendeförslag till ${c}` : "Ert boendeförslag"),
    intro: (n) =>
      n === 1
        ? "Här är objektet vi föreslår för er. Priset nedan är ert och ligger fast."
        : `Här är de ${n} objekt vi föreslår för er. Priserna nedan är era och ligger fast.`,
    persons: (n) => `${n} personer`,
    period: "Period",
    ongoing: "tills vidare",
    yourPrice: "Ert pris",
    perMonth: "kr/mån",
    note: "Notering",
    priceLocked: "Priset gäller er för detta objekt och ändras inte i efterhand.",
    status: { sent: "Erbjudet", accepted: "Accepterat", unavailable: "Inte längre tillgängligt" },
    unavailableInfo: "Objektet har gått till en annan hyresgäst eller tagits av marknaden.",
    ctaTitle: "Vill ni gå vidare eller har frågor?",
    ctaSub: "Hör av er till StayOnSite så hjälper vi er vidare — ofta med svar inom 24 timmar.",
    ctaButton: "Kontakta oss",
    ctaHref: "https://www.stayonsite.se/kontakt",
    agreementBadge: (name, date) => `Uppdragsbekräftelse godkänd av ${name} den ${date}`,
    footer: "StayOnSite · Corporate housing i hela Sverige",
  },
  en: {
    tagline: "Your housing proposal",
    heading: (c) => (c ? `Housing proposal for ${c}` : "Your housing proposal"),
    intro: (n) =>
      n === 1
        ? "Here is the property we propose for you. The price below is yours and is fixed."
        : `Here are the ${n} properties we propose for you. The prices below are yours and are fixed.`,
    persons: (n) => `${n} people`,
    period: "Period",
    ongoing: "until further notice",
    yourPrice: "Your price",
    perMonth: "SEK/month",
    note: "Note",
    priceLocked: "This price applies to you for this property and will not change afterwards.",
    status: { sent: "Offered", accepted: "Accepted", unavailable: "No longer available" },
    unavailableInfo: "The property has gone to another tenant or been taken off the market.",
    ctaTitle: "Want to proceed or have questions?",
    ctaSub: "Get in touch with StayOnSite and we'll help you further — usually a reply within 24 hours.",
    ctaButton: "Contact us",
    ctaHref: "https://www.stayonsite.se/en/corporate-housing-sweden",
    agreementBadge: (name, date) => `Assignment confirmation approved by ${name} on ${date}`,
    footer: "StayOnSite · Corporate housing across Sweden",
  },
  pl: {
    tagline: "Propozycja zakwaterowania",
    heading: (c) => (c ? `Propozycja zakwaterowania dla ${c}` : "Propozycja zakwaterowania"),
    intro: (n) =>
      n === 1
        ? "Oto obiekt, który dla Was proponujemy. Cena poniżej jest Wasza i jest stała."
        : `Oto ${n} obiektów, które dla Was proponujemy. Ceny poniżej są Wasze i są stałe.`,
    persons: (n) => `${n} osób`,
    period: "Okres",
    ongoing: "na czas nieokreślony",
    yourPrice: "Wasza cena",
    perMonth: "SEK/mies.",
    note: "Uwaga",
    priceLocked: "Ta cena dotyczy Was dla tego obiektu i nie zmieni się później.",
    status: { sent: "Zaproponowane", accepted: "Zaakceptowane", unavailable: "Już niedostępne" },
    unavailableInfo: "Obiekt trafił do innego najemcy lub został wycofany z rynku.",
    ctaTitle: "Chcecie przejść dalej lub macie pytania?",
    ctaSub: "Skontaktujcie się ze StayOnSite, a pomożemy dalej — zwykle odpowiadamy w ciągu 24 godzin.",
    ctaButton: "Skontaktuj się",
    ctaHref: "https://www.stayonsite.se/pl/zakwaterowanie-firmowe",
    agreementBadge: (name, date) => `Potwierdzenie zlecenia zaakceptowane przez ${name} dnia ${date}`,
    footer: "StayOnSite · Zakwaterowanie firmowe w całej Szwecji",
  },
};
