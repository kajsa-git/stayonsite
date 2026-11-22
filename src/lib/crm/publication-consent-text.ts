// Versioner är bevis för vad uthyraren faktiskt såg. Ändra inte en gammal text.
export const PUBLICATION_CONSENT_LEGACY_2026_11_12 =
  "Jag godkänner att StayOnSite visar de angivna bostäderna på stayonsite.se med bostadsuppgifter och bilder som får användas för detta. " +
  "Beskrivningen kan språkgranskas och översättas. Exakt adress och kontaktuppgifter visas inte offentligt. " +
  "Publiceringen är kostnadsfri och innebär ingen skyldighet att hyra ut. Jag kan när som helst kontakta StayOnSite för att ändra eller ta bort en annons.";

export const PUBLICATION_CONSENT_PREVIOUS_VERSION = "2026-11-17.1";

export const PUBLICATION_CONSENT_PREVIOUS_PARAGRAPHS = [
  "Det är kostnadsfritt att registrera din bostad hos HyrUtSmart – en del av StayOnSite.",
  "När du godkänner medgivandet får vi använda de uppgifter och bilder du har lämnat för att beskriva din bostad på vår hemsida och för potentiella hyresgäster. Din exakta adress och dina kontaktuppgifter visas inte offentligt.",
  "Om vi får en förfrågan som kan passa din bostad kontaktar vi dig för att stämma av hyra, hyresperiod och andra villkor. Du bestämmer själv om du vill gå vidare. Innan vi föreslår bostaden för en kund ber vi dig godkänna villkoren för den förmedlingen separat.",
  "Du kan när som helst kontakta oss om du vill ändra uppgifterna eller återkalla ditt medgivande. Om du återkallar det tar vi bort annonsen från hemsidan.",
] as const;

export const PUBLICATION_CONSENT_PREVIOUS_TEXT = PUBLICATION_CONSENT_PREVIOUS_PARAGRAPHS.join("\n\n");

// Gällande HUS-version (hyrutsmart.se skickar den i husPublication).
export const PUBLICATION_CONSENT_VERSION = "2026-11-17.2";
export const PUBLICATION_CONSENT_PARAGRAPHS = [
  "Det är kostnadsfritt att registrera din bostad hos HyrUtSmart, en del av StayOnSite.",
  "När du godkänner får vi använda dina uppgifter och bilder för att presentera bostaden på vår hemsida och för potentiella hyresgäster. Din exakta adress och dina kontaktuppgifter visas inte offentligt.",
  "Om en förfrågan passar din bostad kontaktar vi dig för att stämma av hyra, hyresperiod och övriga villkor. Du bestämmer om du vill gå vidare och godkänner förmedlingsvillkoren separat innan vi föreslår bostaden för en kund.",
  "Du kan när som helst kontakta oss för att ändra uppgifter eller återkalla medgivandet. Om du återkallar det tar vi bort annonsen från hemsidan.",
  "Godkänner du publiceringsmedgivandet?",
] as const;

export const PUBLICATION_CONSENT_TEXT = PUBLICATION_CONSENT_PARAGRAPHS.join("\n\n");
export const PUBLICATION_CONSENT_CHECKBOX_LABEL =
  "Jag godkänner att HyrUtSmart använder uppgifterna och bilderna för att presentera min bostad på hemsidan och för potentiella hyresgäster, enligt beskrivningen ovan.";

// Uthyrarlänken (/uthyrare/[token]) och del 2 av bostadsregistreringen på
// stayonsite.se. Samma villkor som HUS-versionen ovan men med StayOnSite som
// avsändare; HUS (hyrutsmart.se) skickar fortfarande PUBLICATION_CONSENT_VERSION.
export const WEB_PUBLICATION_CONSENT_VERSION = "2026-11-22.1";
export const WEB_PUBLICATION_CONSENT_PARAGRAPHS = [
  "Det är kostnadsfritt att registrera din bostad hos StayOnSite.",
  "När du godkänner får vi använda dina uppgifter och bilder för att presentera bostaden på vår hemsida och för potentiella hyresgäster. Din exakta adress och dina kontaktuppgifter visas inte offentligt.",
  "Om en förfrågan passar din bostad kontaktar vi dig för att stämma av hyra, hyresperiod och övriga villkor. Du bestämmer om du vill gå vidare och godkänner förmedlingsvillkoren separat innan vi föreslår bostaden för en kund.",
  "Du kan när som helst kontakta oss för att ändra uppgifter eller återkalla medgivandet. Om du återkallar det tar vi bort annonsen från hemsidan.",
  "Godkänner du publiceringsmedgivandet?",
] as const;
export const WEB_PUBLICATION_CONSENT_TEXT = WEB_PUBLICATION_CONSENT_PARAGRAPHS.join("\n\n");
export const WEB_PUBLICATION_CONSENT_CHECKBOX_LABEL =
  "Jag godkänner att StayOnSite använder uppgifterna och bilderna för att presentera min bostad på hemsidan och för potentiella hyresgäster, enligt beskrivningen ovan.";
