// Avtalstexterna för treparts-flödet, versionerade i kod. Godkännanden lagras i
// crm_agreement_acceptances med (agreement_type, version) — bumpas versionen här
// matchar befintliga accepter inte längre och gaten visas igen.
//
// Tonen är medveten: få åtaganden och ingen risk för motparten i detta läge.
// Det enda strikta är förmedlingsskyddet — ingen får runda StayOnSite.

export type AgreementType = "uppdragsbekraftelse" | "uthyrningsuppdrag";

export interface AgreementText {
  type: AgreementType;
  version: string; // ISO-datum då texten senast ändrades
  title: string;
  intro: string;
  points: { heading: string; body: string }[];
}

// Kundens avtal — gate i erbjudandelänken (/erbjudande/<token>).
export const UPPDRAGSBEKRAFTELSE: AgreementText = {
  type: "uppdragsbekraftelse",
  version: "2026-07-13.4", // .4 = praktisk direktkontakt (tillträde m.m.) uttryckligen ok; omsignering krävs
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
      heading: "StayOnSite är er kontaktpart",
      body:
        "Frågor om pris, tillgänglighet och villkor för presenterade objekt hanteras alltid av StayOnSite. " +
        "Praktisk direktkontakt med uthyraren — till exempel kring visning, tillträde och nycklar — kan förekomma, " +
        "men förhandling om pris och villkor sker aldrig direkt mellan er och uthyraren.",
    },
    {
      heading: "Inget avtal utanför StayOnSite",
      body:
        "Ni förbinder er att inte — direkt eller indirekt, till exempel genom annat bolag i samma koncern, närstående eller annan mellanhand — " +
        "ingå hyresavtal eller annan överenskommelse om boende utan StayOnSites medverkan, avseende objekt som StayOnSite presenterat för er " +
        "eller annat boende hos samma uthyrare som ni fått kontakt med genom StayOnSite. " +
        "Detta gäller under pågående uppdrag och i 12 månader från det datum då objektet först presenterades för er.",
    },
    {
      heading: "Vite vid överträdelse",
      body:
        "Vid överträdelse av punkten om avtal utanför StayOnSite ovan utgår vite motsvarande tre (3) månadshyror för det aktuella objektet, dock lägst 25 000 kr. " +
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
        "Genom att fylla i ert namn och godkänna bekräftelsen intygar ni att ni har läst och accepterar villkoren ovan.",
    },
  ],
};

// Uthyrarens avtal — signeras via uthyrarlänken (/uthyrare/<token>).
export const UTHYRNINGSUPPDRAG: AgreementText = {
  type: "uthyrningsuppdrag",
  version: "2026-07-13.4", // .4 = praktisk direktkontakt (tillträde m.m.) uttryckligen ok; omsignering krävs
  title: "Uthyrningsuppdrag",
  intro:
    "Ni ger StayOnSite i uppdrag att hyra ut ert objekt. Uppdraget är kostnadsfritt och inte exklusivt — " +
    "ni kan när som helst dra tillbaka objektet.",
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
      heading: "Inget avtal utanför StayOnSite",
      body:
        "Ni förbinder er att inte — direkt eller indirekt, till exempel genom närstående, annat bolag eller annan mellanhand — " +
        "ingå hyresavtal eller annan överenskommelse utan StayOnSites medverkan med hyresgäster som StayOnSite presenterat, " +
        "vare sig det gäller det aktuella objektet eller annat boende ni erbjuder. " +
        "Detta gäller under uppdraget och i 12 månader efter presentation.",
    },
    {
      heading: "Vite vid överträdelse",
      body:
        "Vid överträdelse av punkten om avtal utanför StayOnSite ovan utgår vite motsvarande tre (3) månadshyror för det aktuella objektet, dock lägst 25 000 kr. " +
        "Vitet påverkar inte StayOnSites rätt till ersättning för faktisk skada som överstiger vitet.",
    },
    {
      heading: "Villkor via StayOnSite",
      body:
        "Hyra och villkor för förmedlade affärer går alltid via StayOnSite. " +
        "Praktisk direktkontakt med hyresgästen — till exempel kring visning, tillträde och nycklar — kan förekomma, " +
        "men förhandling om hyra och villkor sker aldrig direkt mellan er och hyresgästen.",
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
      heading: "StayOnSite is your point of contact",
      body:
        "Questions about price, availability and terms for presented properties are always handled by StayOnSite. " +
        "Practical direct contact with the landlord — for example regarding viewings, move-in and keys — may occur, " +
        "but price and terms are never negotiated directly between you and the landlord.",
    },
    {
      heading: "No agreements outside StayOnSite",
      body:
        "You undertake not to — directly or indirectly, for example through a group company, related party or other intermediary — " +
        "enter into a lease or any other housing arrangement without StayOnSite's involvement, regarding properties presented by StayOnSite " +
        "or other housing from the same landlord that you came into contact with through StayOnSite. " +
        "This applies for the duration of the assignment and for 12 months from the date the property was first presented to you.",
    },
    {
      heading: "Penalty upon breach",
      body:
        "In the event of a breach of the clause on agreements outside StayOnSite above, a contractual penalty equal to three (3) months' rent " +
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
        "By entering your name and approving this confirmation, you certify that you have read and accept the terms above.",
    },
  ],
};

export const UTHYRNINGSUPPDRAG_EN: AgreementText = {
  type: "uthyrningsuppdrag",
  version: UTHYRNINGSUPPDRAG.version,
  title: "Letting Assignment",
  intro:
    "You engage StayOnSite to let your property. The assignment is free of charge and non-exclusive — " +
    "you may withdraw the property at any time.",
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
      heading: "No agreements outside StayOnSite",
      body:
        "You undertake not to — directly or indirectly, for example through a related party, another company or other intermediary — " +
        "enter into a lease or any other arrangement without StayOnSite's involvement with tenants presented by StayOnSite, " +
        "whether for the property in question or any other housing you offer. " +
        "This applies for the duration of the assignment and for 12 months after presentation.",
    },
    {
      heading: "Penalty upon breach",
      body:
        "In the event of a breach of the clause on agreements outside StayOnSite above, a contractual penalty equal to three (3) months' rent " +
        "for the property in question applies, subject to a minimum of SEK 25,000. " +
        "The penalty does not limit StayOnSite's right to compensation for actual damage exceeding the penalty.",
    },
    {
      heading: "Terms via StayOnSite",
      body:
        "Rent and terms for brokered deals always go through StayOnSite. " +
        "Practical direct contact with the tenant — for example regarding viewings, move-in and keys — may occur, " +
        "but rent and terms are never negotiated directly between you and the tenant.",
    },
  ],
};

export const AGREEMENTS: Record<AgreementType, AgreementText> = {
  uppdragsbekraftelse: UPPDRAGSBEKRAFTELSE,
  uthyrningsuppdrag: UTHYRNINGSUPPDRAG,
};

export type AgreementLanguage = "sv" | "en";

// Avtalstext för given typ och besökarspråk. Bara sv/en finns — pl faller till en.
export function agreementFor(type: AgreementType, lang: string): { text: AgreementText; language: AgreementLanguage } {
  if (lang === "sv") return { text: AGREEMENTS[type], language: "sv" };
  return {
    text: type === "uppdragsbekraftelse" ? UPPDRAGSBEKRAFTELSE_EN : UTHYRNINGSUPPDRAG_EN,
    language: "en",
  };
}
