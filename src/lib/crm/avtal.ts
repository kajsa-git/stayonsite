// Avtalstexterna för treparts-flödet, versionerade i kod. Godkännanden lagras i
// crm_agreement_acceptances med (agreement_type, version) — bumpas versionen här
// matchar befintliga accepter inte längre och gaten visas igen.
//
// Tonen är medveten: få åtaganden och ingen risk för motparten i detta läge.
// Det enda strikta är förmedlingsskyddet — ingen får runda StayOnSite.

export type AgreementType = "uppdragsbekraftelse" | "uthyrningsuppdrag";

export interface AgreementPoint {
  heading: string;
  body?: string; // löpande text
  bullets?: string[]; // underpunkter — för längre punkter som ska vara lättlästa
  note?: string; // avslutande rad (t.ex. giltighetstid), renderas diskret
}

export interface AgreementText {
  type: AgreementType;
  version: string; // ISO-datum då texten senast ändrades
  title: string;
  intro: string;
  points: AgreementPoint[];
}

// Kundens avtal — gate i erbjudandelänken (/erbjudande/<token>).
export const UPPDRAGSBEKRAFTELSE: AgreementText = {
  type: "uppdragsbekraftelse",
  version: "2026-07-13.7", // .7 = företagsscope + 12 mån giltighet uttalad; omsignering krävs
  title: "Uppdragsbekräftelse",
  intro:
    "Genom att godkänna denna uppdragsbekräftelse ger ni StayOnSite i uppdrag att, för er räkning, " +
    "ta fram och presentera boendeförslag. Uppdraget är kostnadsfritt för er och innebär ingen skyldighet att hyra något av de objekt som presenteras.",
  points: [
    {
      heading: "Kostnadsfritt uppdrag",
      body:
        "Ni betalar ingenting för att StayOnSite tar fram och presenterar boendeförslag. " +
        "Ni är inte skyldiga att gå vidare med, boka eller hyra något objekt som presenteras.",
    },
    {
      heading: "Affären går alltid via StayOnSite",
      bullets: [
        "Pris, tillgänglighet och villkor hanteras alltid av StayOnSite.",
        "Praktisk direktkontakt med uthyraren går bra — till exempel kring visning, tillträde och nycklar.",
        "Ni förbinder er att inte förhandla om eller ingå hyresavtal eller annan boendeöverenskommelse utan StayOnSites medverkan — " +
          "varken direkt eller indirekt (till exempel genom annat bolag i samma koncern, närstående eller annan mellanhand). " +
          "Detta omfattar objekt som StayOnSite presenterat för er, och annat boende hos samma uthyrare som ni fått kontakt med genom StayOnSite.",
      ],
      note: "Åtagandet gäller under pågående uppdrag och i 12 månader från att ett objekt först presenterades för er.",
    },
    {
      heading: "Vite vid överträdelse",
      body:
        "Vid överträdelse av föregående punkt utgår vite motsvarande tre (3) månadshyror för det aktuella objektet, dock lägst 25 000 kr. " +
        "Vitet påverkar inte StayOnSites rätt till ersättning för faktisk skada som överstiger vitet.",
    },
    {
      heading: "Sekretess",
      body:
        "Priser, villkor och övrig information i erbjudanden från StayOnSite är avsedda endast för er och ert företag. " +
        "Informationen får inte delas vidare utanför ert företag utan skriftligt godkännande från StayOnSite.",
    },
    {
      heading: "Godkännande",
      body:
        "Genom att fylla i ert namn och godkänna bekräftelsen intygar ni att ni har läst och accepterar villkoren ovan. " +
        "Uppdragsbekräftelsen gäller i 12 månader från signering och kan därefter förnyas.",
    },
  ],
};

// Uthyrarens avtal — signeras via uthyrarlänken (/uthyrare/<token>).
export const UTHYRNINGSUPPDRAG: AgreementText = {
  type: "uthyrningsuppdrag",
  version: "2026-07-16.8", // .8 = icke-exklusivitet uttalad: ingen skyldighet att hyra ut via oss, fritt hyra ut till ej förmedlade; omsignering krävs
  title: "Uthyrningsuppdrag",
  intro:
    "Ni ger StayOnSite i uppdrag att hyra ut era objekt. Uppdraget är kostnadsfritt och inte exklusivt — " +
    "ni kan när som helst dra tillbaka ett objekt. Uppdraget gäller i 12 månader från signering och kan därefter förnyas.",
  points: [
    {
      heading: "Kostnadsfritt för er",
      body: "StayOnSite tar betalt av hyresgästen, aldrig av er som uthyrare.",
    },
    {
      heading: "Ni bestämmer",
      body: "Inget hyresavtal ingås utan er bekräftelse, och ni kan tacka nej till förslag utan motivering.",
    },
    {
      heading: "Inte exklusivt — inga åtaganden utan förmedlad hyresgäst",
      bullets: [
        "Uppdraget innebär ingen skyldighet att hyra ut era objekt via StayOnSite.",
        "Ni får självklart hyra ut till hyresgäster som inte förmedlats av StayOnSite — egna kontakter, egna kanaler eller andra förmedlare.",
        "Förmedlar StayOnSite ingen hyresgäst har ni inga åtaganden enligt detta uppdrag.",
      ],
    },
    {
      heading: "Affären går alltid via StayOnSite",
      bullets: [
        "Hyra och villkor för förmedlade affärer hanteras alltid av StayOnSite.",
        "Praktisk direktkontakt med hyresgästen går bra — till exempel kring visning, tillträde och nycklar.",
        "Ni förbinder er att inte förhandla om eller ingå hyresavtal eller annan överenskommelse utan StayOnSites medverkan " +
          "med hyresgäster som StayOnSite presenterat — varken direkt eller indirekt (till exempel genom närstående, annat bolag eller annan mellanhand). " +
          "Detta gäller både det aktuella objektet och annat boende ni erbjuder.",
      ],
      note: "Åtagandet gäller under uppdraget och i 12 månader efter presentation.",
    },
    {
      heading: "Vite vid överträdelse",
      body:
        "Vid överträdelse av föregående punkt utgår vite motsvarande tre (3) månadshyror för det aktuella objektet, dock lägst 25 000 kr. " +
        "Vitet påverkar inte StayOnSites rätt till ersättning för faktisk skada som överstiger vitet.",
    },
  ],
};

// Engelska översättningar — SAMMA version som svenskan (en version = en innebörd,
// två språkdräkter). Svenskan är originalet och har företräde vid tolkningskonflikt
// (sägs uttryckligen i gaten på engelska). Avtal finns BARA på svenska och engelska
// — polska besökare får den engelska texten (Kajsas beslut 2026-07-13).
export const UPPDRAGSBEKRAFTELSE_EN: AgreementText = {
  type: "uppdragsbekraftelse",
  version: UPPDRAGSBEKRAFTELSE.version,
  title: "Assignment Confirmation",
  intro:
    "By approving this assignment confirmation, you engage StayOnSite to source and present housing proposals on your behalf. " +
    "The assignment is free of charge and does not oblige you to rent any of the presented properties.",
  points: [
    {
      heading: "Free of charge",
      body:
        "You pay nothing for StayOnSite sourcing and presenting housing proposals. " +
        "You are not obliged to proceed with, book or rent any property that is presented.",
    },
    {
      heading: "The deal always goes through StayOnSite",
      bullets: [
        "Price, availability and terms are always handled by StayOnSite.",
        "Practical direct contact with the landlord is fine — for example regarding viewings, move-in and keys.",
        "You undertake not to negotiate or enter into a lease or any other housing arrangement without StayOnSite's involvement — " +
          "neither directly nor indirectly (for example through a group company, related party or other intermediary). " +
          "This covers properties presented by StayOnSite, and other housing from the same landlord that you came into contact with through StayOnSite.",
      ],
      note: "This commitment applies for the duration of the assignment and for 12 months from the date a property was first presented to you.",
    },
    {
      heading: "Penalty upon breach",
      body:
        "In the event of a breach of the preceding clause, a contractual penalty equal to three (3) months' rent " +
        "for the property in question applies, subject to a minimum of SEK 25,000. " +
        "The penalty does not limit StayOnSite's right to compensation for actual damage exceeding the penalty.",
    },
    {
      heading: "Confidentiality",
      body:
        "Prices, terms and other information in offers from StayOnSite are intended solely for you and your company. " +
        "The information may not be shared outside your company without StayOnSite's written consent.",
    },
    {
      heading: "Approval",
      body:
        "By entering your name and approving this confirmation, you certify that you have read and accept the terms above. " +
        "The assignment confirmation is valid for 12 months from signing and can then be renewed.",
    },
  ],
};

export const UTHYRNINGSUPPDRAG_EN: AgreementText = {
  type: "uthyrningsuppdrag",
  version: UTHYRNINGSUPPDRAG.version,
  title: "Letting Assignment",
  intro:
    "You engage StayOnSite to let your properties. The assignment is free of charge and non-exclusive — " +
    "you may withdraw a property at any time. The assignment is valid for 12 months from signing and can then be renewed.",
  points: [
    {
      heading: "Free of charge for you",
      body: "StayOnSite charges the tenant, never you as the landlord.",
    },
    {
      heading: "You decide",
      body: "No lease is entered into without your confirmation, and you may decline any proposal without giving a reason.",
    },
    {
      heading: "Non-exclusive — no obligations unless we introduce a tenant",
      bullets: [
        "The assignment does not oblige you to let your properties through StayOnSite.",
        "You are of course free to let to tenants not introduced by StayOnSite — your own contacts, your own channels or other agents.",
        "If StayOnSite does not introduce a tenant, this assignment imposes no obligations on you.",
      ],
    },
    {
      heading: "The deal always goes through StayOnSite",
      bullets: [
        "Rent and terms for brokered deals are always handled by StayOnSite.",
        "Practical direct contact with the tenant is fine — for example regarding viewings, move-in and keys.",
        "You undertake not to negotiate or enter into a lease or any other arrangement without StayOnSite's involvement " +
          "with tenants presented by StayOnSite — neither directly nor indirectly (for example through a related party, another company or other intermediary). " +
          "This covers both the property in question and any other housing you offer.",
      ],
      note: "This commitment applies for the duration of the assignment and for 12 months after presentation.",
    },
    {
      heading: "Penalty upon breach",
      body:
        "In the event of a breach of the preceding clause, a contractual penalty equal to three (3) months' rent " +
        "for the property in question applies, subject to a minimum of SEK 25,000. " +
        "The penalty does not limit StayOnSite's right to compensation for actual damage exceeding the penalty.",
    },
  ],
};

export const AGREEMENTS: Record<AgreementType, AgreementText> = {
  uppdragsbekraftelse: UPPDRAGSBEKRAFTELSE,
  uthyrningsuppdrag: UTHYRNINGSUPPDRAG,
};

export type AgreementLanguage = "sv" | "en";

// Ett signerat uppdragsavtal gäller i 12 månader från signering (Kajsas beslut
// 2026-07-13) — därefter, eller när avtalstexten versionbumpats, krävs
// omsignering och gaten visas igen.
export const AVTAL_GILTIGHET_MANADER = 12;

export function agreementValidUntil(acceptedAt: string): string {
  const d = new Date(acceptedAt);
  d.setMonth(d.getMonth() + AVTAL_GILTIGHET_MANADER);
  return d.toISOString().slice(0, 10);
}

// Giltig = rätt version OCH inom 12 månader från signering.
export function isAcceptanceValid(
  a: { version: string; acceptedAt: string } | null | undefined,
  text: AgreementText
): boolean {
  if (!a) return false;
  if (a.version !== text.version) return false;
  return new Date(agreementValidUntil(a.acceptedAt)).getTime() >= Date.now();
}

// Avtalstext för given typ och besökarspråk. Bara sv/en finns — pl faller till en.
export function agreementFor(type: AgreementType, lang: string): { text: AgreementText; language: AgreementLanguage } {
  if (lang === "sv") return { text: AGREEMENTS[type], language: "sv" };
  return {
    text: type === "uppdragsbekraftelse" ? UPPDRAGSBEKRAFTELSE_EN : UTHYRNINGSUPPDRAG_EN,
    language: "en",
  };
}
