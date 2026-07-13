// Deterministiska SMS-mallar för utkast-knapparna i Min dag. Medvetet INTE
// AI-genererade: samma knapp ger alltid samma text, i Kajsas etablerade ton
// (länk-SMS-formuleringen är samma som godkändes i kampanjen 2026-07-06).
// Alla mallar används som UTKAST — inget skickas utan godkännande i utkastpanelen.

// "Anna Andersson FÄ" → "Anna". Tomt/na → neutral hälsning utan namn.
export function firstNameOf(name: string | null | undefined): string | null {
  const first = (name ?? "").trim().split(/\s+/)[0] ?? "";
  if (!first || first.length < 2) return null;
  return first[0].toUpperCase() + first.slice(1);
}

const greet = (name: string | null | undefined) => {
  const first = firstNameOf(name);
  return first ? `Hej ${first}!` : "Hej!";
};

// Länk-SMS efter publicering (JA-flödet) — samma text som kampanjens godkända.
// Länken skrivs UTAN https:// — operatörernas smishing-filter stoppar https-länkar
// i SMS (verifierat 2026-07-08: error 4 med https, levererat med www).
export function publishedLinkSms(ownerName: string | null | undefined, slug: string): string {
  return `${greet(ownerName)} Tack för ditt svar 😊 Nu ligger ditt boende ute på vår hemsida: www.stayonsite.se/boenden/${slug}\nExakt adress visas inte publikt. Hör av dig om du vill ändra eller lägga till något. /Kajsa, StayOnSite`;
}

// Erbjudandelänk till företagskontakt — kundens personliga sida med förslag,
// pris och uppdragsbekräftelse (gaten). Länk utan https:// av samma smishing-skäl.
export function offerLinkSms(contactName: string | null | undefined, token: string): string {
  return `${greet(contactName)} Här är ert boendeförslag från StayOnSite: www.stayonsite.se/erbjudande/${token}\nLänken är personlig för er — där ser ni objekt, pris och kan godkänna uppdraget. Hör av dig vid frågor. /Kajsa, StayOnSite`;
}

// Uthyrningsuppdrag-signering till uthyraren — deras personliga sida där avtalet
// signeras innan visning/uthyrning. Länk utan https:// av samma smishing-skäl.
export function landlordAvtalSms(ownerName: string | null | undefined, token: string): string {
  return `${greet(ownerName)} Inför uthyrningen behöver du signera vårt uthyrningsuppdrag — kostnadsfritt och inte exklusivt: www.stayonsite.se/uthyrare/${token}\nDär ser du också vad vi kommit överens om. Hör av dig vid frågor. /Kajsa, StayOnSite`;
}

// Fristående uppdragsavtal till uthyraren — skickas tidigt, innan någon konkret
// affär finns (avtalet gäller alla deras objekt i 12 månader).
export function landlordAvtalStandaloneSms(ownerName: string | null | undefined, token: string): string {
  return `${greet(ownerName)} För att vi ska kunna hyra ut ditt boende behöver du signera vårt uppdragsavtal — kostnadsfritt och inte exklusivt, tar en minut: www.stayonsite.se/uthyrare/${token}\nHör av dig vid frågor. /Kajsa, StayOnSite`;
}

// Fristående uppdragsbekräftelse till kunden — skickas tidigt, innan erbjudandet
// är klart. Lovar INTE objekt/pris (det gör offerLinkSms när förslaget skickats);
// samma länk visar förslaget automatiskt när det stämplats.
export function tenantAvtalSms(contactName: string | null | undefined, token: string): string {
  return `${greet(contactName)} För att vi ska kunna ta fram boendeförslag åt er behöver ni godkänna vår uppdragsbekräftelse — kostnadsfritt och utan förpliktelser, tar en minut: www.stayonsite.se/erbjudande/${token}\nErt förslag dyker upp på samma sida så snart det är klart. /Kajsa, StayOnSite`;
}

// Jaga uthyrare: förslag skickat, väntar på svar.
export function ownerFollowUpSms(ownerName: string | null | undefined, address: string | null | undefined): string {
  const what = address ? `angående ${address}` : "angående ditt boende";
  return `${greet(ownerName)} Jag återkommer ${what} — har du hunnit fundera? Hör gärna av dig när det passar. /Kajsa, StayOnSite`;
}

// Be uthyrare om bilder (objekt utan foton kan inte publiceras/föreslås).
export function photoRequestSms(ownerName: string | null | undefined, address: string | null | undefined): string {
  const what = address ? address : "ditt boende";
  return `${greet(ownerName)} För att kunna hyra ut ${what} snabbare behöver jag några bilder — svara gärna med 3–5 foton direkt i den här tråden (vardagsrum, kök, sovrum, badrum). /Kajsa, StayOnSite`;
}

// Förlängningsfråga till företagskontakt när en vunnen affär närmar sig slutdatum.
export function renewalSms(
  contactName: string | null | undefined,
  city: string | null | undefined,
  endDate: string | null | undefined,
): string {
  const where = city ? ` i ${city}` : "";
  const when = endDate ? ` den ${endDate}` : " snart";
  return `${greet(contactName)} Ert boende${where} löper ut${when}. Vill ni förlänga, eller behöver ni boende till nästa projekt? Säg till så ordnar jag det. /Kajsa, StayOnSite`;
}

// Återkomst till företag (allmän uppföljning från "Att kontakta"-kön).
export function companyFollowUpSms(contactName: string | null | undefined, reason: string | null | undefined): string {
  const why = reason ? ` (${reason.trim()})` : "";
  return `${greet(contactName)} Jag lovade återkomma${why} — hur ser det ut hos er? Behöver ni boende framöver hjälper jag gärna till. /Kajsa, StayOnSite`;
}
