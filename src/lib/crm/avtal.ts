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
  version: "2026-07-13.3", // .3 = avtalsförbud i st. f. kontaktförbud (direkt/indirekt); omsignering krävs
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
      heading: "Inget avtal utanför Stayonsite",
      body:
        "Ni förbinder er att inte — direkt eller indirekt, till exempel genom annat bolag i samma koncern, närstående eller annan mellanhand — " +
        "ingå hyresavtal eller annan överenskommelse om boende utan Stayonsites medverkan, avseende objekt som Stayonsite presenterat för er " +
        "eller annat boende hos samma uthyrare som ni fått kontakt med genom Stayonsite. " +
        "Detta gäller under pågående uppdrag och i 12 månader från det datum då objektet först presenterades för er.",
    },
    {
      heading: "Vite vid överträdelse",
      body:
        "Vid överträdelse av punkten om avtal utanför Stayonsite ovan utgår vite motsvarande tre (3) månadshyror för det aktuella objektet, dock lägst 25 000 kr. " +
        "Vitet påverkar inte Stayonsites rätt till ersättning för faktisk skada som överstiger vitet.",
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

// Uthyrarens avtal — signeras via uthyrarlänken (/uthyrare/<token>).
export const UTHYRNINGSUPPDRAG: AgreementText = {
  type: "uthyrningsuppdrag",
  version: "2026-07-13.3", // .3 = avtalsförbud i st. f. kontaktförbud (direkt/indirekt); omsignering krävs
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
      heading: "Inget avtal utanför Stayonsite",
      body:
        "Ni förbinder er att inte — direkt eller indirekt, till exempel genom närstående, annat bolag eller annan mellanhand — " +
        "ingå hyresavtal eller annan överenskommelse utan Stayonsites medverkan med hyresgäster som Stayonsite presenterat, " +
        "vare sig det gäller det aktuella objektet eller annat boende ni erbjuder. " +
        "Detta gäller under uppdraget och i 12 månader efter presentation.",
    },
    {
      heading: "Vite vid överträdelse",
      body:
        "Vid överträdelse av punkten om avtal utanför Stayonsite ovan utgår vite motsvarande tre (3) månadshyror för det aktuella objektet, dock lägst 25 000 kr. " +
        "Vitet påverkar inte Stayonsites rätt till ersättning för faktisk skada som överstiger vitet.",
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
