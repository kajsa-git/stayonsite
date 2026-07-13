// Avtalstexterna för treparts-flödet, versionerade i kod. Godkännanden lagras i
// crm_agreement_acceptances med (agreement_type, version) — bumpas versionen här
// matchar befintliga accepter inte längre och gaten visas igen.
//
// Tonen är medveten: få åtaganden och ingen risk för motparten i detta läge.
// Det enda strikta är förmedlingsskyddet — ingen får runda Stayonsite.

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
  version: "2026-07-13",
  title: "Uppdragsbekräftelse",
  intro:
    "Genom att godkänna denna uppdragsbekräftelse ger ni Stayonsite i uppdrag att, för er räkning, " +
    "ta fram och presentera boendeförslag. Uppdraget är kostnadsfritt för er och innebär ingen skyldighet att hyra något av de objekt som presenteras.",
  points: [
    {
      heading: "Kostnadsfritt uppdrag",
      body:
        "Ni betalar ingenting för att Stayonsite tar fram och presenterar boendeförslag. " +
        "Ni är inte skyldiga att gå vidare med, boka eller hyra något objekt som presenteras.",
    },
    {
      heading: "Stayonsite är er kontaktpart",
      body:
        "All kontakt som rör presenterade objekt, priser, tillgänglighet och villkor ska gå via Stayonsite. " +
        "Detta görs för att säkerställa tydlig kommunikation och korrekta villkor för alla parter.",
    },
    {
      heading: "Ingen direktkontakt med uthyrare",
      body:
        "Ni får inte själva kontakta, förhandla med eller ingå avtal direkt med uthyrare eller boendeleverantörer avseende objekt som Stayonsite har presenterat för er. " +
        "Detta gäller under pågående uppdrag och i 12 månader från det datum då objektet först presenterades för er.",
    },
    {
      heading: "Sekretess",
      body:
        "Priser, villkor och övrig information i erbjudanden från Stayonsite är avsedda endast för er och ert företag. " +
        "Informationen får inte delas vidare utanför ert företag utan skriftligt godkännande från Stayonsite.",
    },
    {
      heading: "Godkännande",
      body:
        "Genom att fylla i ert namn och godkänna bekräftelsen intygar ni att ni har läst och accepterar villkoren ovan.",
    },
  ],
};

// Uthyrarens avtal — signeras via uthyrarlänken (fas 3). Texten ligger klar här
// så datamodellen och gaten kan återanvändas rakt av.
export const UTHYRNINGSUPPDRAG: AgreementText = {
  type: "uthyrningsuppdrag",
  version: "2026-07-12",
  title: "Uthyrningsuppdrag",
  intro:
    "Ni ger Stayonsite i uppdrag att hyra ut ert objekt. Uppdraget är kostnadsfritt och inte exklusivt — " +
    "ni kan när som helst dra tillbaka objektet.",
  points: [
    {
      heading: "Kostnadsfritt för er",
      body: "Stayonsite tar betalt av hyresgästen, aldrig av er som uthyrare.",
    },
    {
      heading: "Ni bestämmer",
      body: "Inget hyresavtal ingås utan er bekräftelse, och ni kan tacka nej till förslag utan motivering.",
    },
    {
      heading: "Ingen direktkontakt med hyresgäster",
      body:
        "Ni får inte själva kontakta, förhandla med eller ingå avtal med hyresgäster som Stayonsite presenterat. " +
        "Detta gäller under uppdraget och i 12 månader efter presentation.",
    },
    {
      heading: "Villkor via Stayonsite",
      body: "Hyra och villkor för förmedlade affärer går alltid via Stayonsite.",
    },
  ],
};

export const AGREEMENTS: Record<AgreementType, AgreementText> = {
  uppdragsbekraftelse: UPPDRAGSBEKRAFTELSE,
  uthyrningsuppdrag: UTHYRNINGSUPPDRAG,
};
