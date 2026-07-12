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
  version: "2026-07-12",
  title: "Uppdragsbekräftelse",
  intro:
    "Genom att godkänna bekräftar ni att Stayonsite tar uppdraget att hitta boende för er räkning. " +
    "Bekräftelsen är kostnadsfri och innebär ingen skyldighet att hyra.",
  points: [
    {
      heading: "Kostnadsfritt och utan förpliktelser",
      body: "Ni förbinder er inte att hyra något av de objekt som presenteras, och uppdraget kostar er ingenting.",
    },
    {
      heading: "Stayonsite är er motpart",
      body: "All kontakt om objekt, priser och villkor går via Stayonsite — det är så vi kan hålla ihop affären för alla parter.",
    },
    {
      heading: "Ingen direktkontakt med uthyrare",
      body:
        "Ni får inte själva kontakta, förhandla med eller ingå avtal med uthyrare vars objekt Stayonsite presenterat. " +
        "Detta gäller under uppdraget och i 12 månader efter att ett objekt presenterats.",
    },
    {
      heading: "Sekretess",
      body: "Priser och villkor i erbjudandet är framtagna för er och delas inte vidare utanför ert företag.",
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
