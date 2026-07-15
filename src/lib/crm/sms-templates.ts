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

// Uppdragsavtal till uthyraren — avtalet skickas alltid FÖRST, fristående
// (gäller alla deras objekt i 12 månader). Länk utan https:// av smishing-skäl.
// Ordalydelsen är Kajsas egen (2026-07-13) — ändra inte utan hennes ok.
export function landlordAvtalStandaloneSms(ownerName: string | null | undefined, token: string): string {
  return `${greet(ownerName)}\nHär kommer uppdragsavtalet: www.stayonsite.se/uthyrare/${token}\nMvh Kajsa\nStayOnSite`;
}

// Uppdragsavtal-MEJL till uthyraren — HTML för interna klienten, full https-länk.
export function landlordAvtalEmailHtml(ownerName: string | null | undefined, token: string): string {
  const first = firstNameOf(ownerName);
  const hej = first ? `Hej ${first},` : "Hej,";
  const url = `https://www.stayonsite.se/uthyrare/${token}`;
  return (
    `<p>${hej}</p>` +
    `<p>Här kommer uppdragsavtalet:<br><a href="${url}">${url}</a></p>` +
    `<p>Det är kostnadsfritt och inte exklusivt och tar en minut att signera.</p>` +
    `<p>Mvh Kajsa<br>StayOnSite</p>`
  );
}

// Fristående uppdragsbekräftelse till kunden — skickas tidigt, innan erbjudandet
// är klart. Lovar INTE objekt/pris (det gör offerLinkSms när förslaget skickats);
// samma länk visar förslaget automatiskt när det stämplats.
// Ordalydelsen är Kajsas egen (2026-07-13) — ändra inte utan hennes ok.
export function tenantAvtalSms(contactName: string | null | undefined, token: string): string {
  return `${greet(contactName)}\nBifogar uppdragsbekräftelse www.stayonsite.se/erbjudande/${token}\n\nBoendeförslag dyker upp på samma sida så snart det är klart.\nMvh Kajsa\nStayOnSite`;
}

// Erbjudande-MEJL till kunden — HTML för den interna mejlklienten. I mejl används
// full https-länk (klickbar, inget smishing-filter som i SMS). Kajsas ordalydelse.
export function offerEmailHtml(
  contactName: string | null | undefined,
  city: string | null | undefined,
  token: string
): string {
  const first = firstNameOf(contactName);
  const hej = first ? `Hej ${first},` : "Hej,";
  const url = `https://www.stayonsite.se/erbjudande/${token}`;
  const plats = city ? ` i ${city}` : "";
  return (
    `<p>${hej}</p>` +
    `<p>Här ser du förslag på boende${plats}:<br><a href="${url}">${url}</a></p>` +
    `<p>Hör av dig med frågor eller om du vill boka boendet.</p>` +
    `<p>Mvh Kajsa<br>StayOnSite</p>`
  );
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
