export type CorporateQualificationLocale = "sv" | "en" | "pl";

export interface CorporateQualificationSubmissionLike {
  formType: string;
  locale?: CorporateQualificationLocale;
  fields: Record<string, string>;
}

export interface BuiltCorporateQualificationEmail {
  subject: string;
  text: string;
  html: string;
  crmNote: string;
}

function esc(v: string) {
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function clean(value: string | null | undefined) {
  const text = value?.trim();
  return text || null;
}

function personLabel(people: string | number | null, locale: CorporateQualificationLocale) {
  const n = Number(people);
  if (locale === "en") {
    if (Number.isFinite(n) && n === 1) return "1 person";
    return people ? `${people} people` : "your team";
  }
  if (locale === "pl") {
    if (Number.isFinite(n) && n === 1) return "1 osoby";
    return people ? `${people} osób` : "Państwa zespołu";
  }
  if (Number.isFinite(n) && n === 1) return "1 person";
  return `${people || "ert team"} personer`;
}

export function isCorporateQualificationSubmission(submission: CorporateQualificationSubmissionLike): boolean {
  const f = submission.fields;
  const hasCustomerEmail = !!clean(f.email);
  const isCompanyHero = submission.formType === "hero-intent" && !!clean(f.company);
  const isCorporateLandingPage = submission.formType === "lp-corporate";
  const isProjectBrief = submission.formType === "project-brief";
  return hasCustomerEmail && (isCompanyHero || isCorporateLandingPage || isProjectBrief);
}

export function corporateQualificationRecipient(submission: CorporateQualificationSubmissionLike): string | null {
  if (!isCorporateQualificationSubmission(submission)) return null;
  return clean(submission.fields.email);
}

export function buildCorporateQualificationEmail(
  submission: CorporateQualificationSubmissionLike,
): BuiltCorporateQualificationEmail {
  const f = submission.fields;
  const city = clean(f.city) ?? clean(f.ort) ?? "orten";
  const projectLocations = clean(f.projectLocations);
  const place = projectLocations ?? city;
  const people = clean(f.people) ?? clean(f.antal_personer);
  const company = clean(f.company) ?? "företaget";
  const locale = submission.locale ?? "sv";
  const label = personLabel(people, locale);
  const english = submission.locale === "en";
  const polish = submission.locale === "pl";

  if (submission.formType === "project-brief") {
    const text = [
      "Hej,",
      "",
      `Tack för projektbriefen om boende för ${label} i ${place}.`,
      "",
      "Jag går igenom ort, datum, sökradie, parkering, rotation och budget innan jag återkommer med nästa steg.",
      "",
      "Med vänliga hälsningar",
      "Kajsa Sihlén",
      "StayOnSite",
      "076-249 84 86",
      "kajsa@stayonsite.se",
      "www.stayonsite.se",
    ].join("\n");

    const html = `<div style="font-family:Arial,sans-serif;color:#111827;line-height:1.55;">
  <p>Hej,</p>
  <p>Tack för projektbriefen om boende för ${esc(label)} i <strong>${esc(place)}</strong>.</p>
  <p>Jag går igenom ort, datum, sökradie, parkering, rotation och budget innan jag återkommer med nästa steg.</p>
  <p>Med vänliga hälsningar<br>Kajsa Sihlén<br>StayOnSite<br>076-249 84 86<br><a href="mailto:kajsa@stayonsite.se">kajsa@stayonsite.se</a><br><a href="https://www.stayonsite.se">www.stayonsite.se</a></p>
</div>`;

    return {
      subject: `Projektbrief mottagen – ${place}`,
      text,
      html,
      crmNote: [
        "Automatiskt kvittomejl skickat för komplett projektbrief.",
        "",
        `Förfrågan: ${company}, ${place}, ${label}.`,
        "Nästa steg: granska projektbriefen och kvalificera innan matchning/offert.",
      ].join("\n"),
    };
  }

  if (english) {
    const questions = [
      "From what date is the accommodation needed?",
      "How long is the need expected to last?",
      `Is there a specific area, workplace or address in ${city} we should use as a starting point?`,
      "What type of private accommodation are you looking for: apartment, studio, house or several separate homes?",
      `How many bedrooms/beds do you need for ${label}?`,
      "Do you have any requirements, for example parking, a kitchen or laundry facilities?",
      "Do you have an approximate monthly budget?",
    ];
    const text = [
      "Hi,",
      "",
      `Thank you for your inquiry via StayOnSite about accommodation in ${city} for ${label}.`,
      "",
      "To check whether we have a relevant setup for you, I just need a few quick details:",
      "",
      ...questions.map((q, i) => `${i + 1}. ${q}`),
      "",
      "Please reply directly to this email with short answers, and I will get back to you with what is possible.",
      "",
      "Best regards",
      "Kajsa Sihlén",
      "StayOnSite",
      "076-249 84 86",
      "kajsa@stayonsite.se",
      "www.stayonsite.se",
    ].join("\n");

    const html = `<div style="font-family:Arial,sans-serif;color:#111827;line-height:1.55;">
  <p>Hi,</p>
  <p>Thank you for your inquiry via StayOnSite about accommodation in <strong>${esc(city)}</strong> for ${esc(label)}.</p>
  <p>To check whether we have a relevant setup for you, I just need a few quick details:</p>
  <ol>${questions.map((q) => `<li>${esc(q)}</li>`).join("")}</ol>
  <p>Please reply directly to this email with short answers, and I will get back to you with what is possible.</p>
  <p>Best regards<br>Kajsa Sihlén<br>StayOnSite<br>076-249 84 86<br><a href="mailto:kajsa@stayonsite.se">kajsa@stayonsite.se</a><br><a href="https://www.stayonsite.se">www.stayonsite.se</a></p>
</div>`;

    return {
      subject: `Accommodation in ${city} – a few quick questions`,
      text,
      html,
      crmNote: [
        "Automatiskt kvalificeringsmejl skickat på engelska.",
        "",
        `Förfrågan: ${company}, ${city}, ${label}.`,
        "Frågor skickade: startdatum, längd, område/arbetsplats/adress, typ av eget boende, sovrum/bäddar, krav och budget.",
        "Nästa steg: invänta svar och kvalificera innan matchning.",
      ].join("\n"),
    };
  }

  if (polish) {
    const questions = [
      "Od jakiej daty potrzebne jest zakwaterowanie?",
      "Jak długo mniej więcej potrwa zapotrzebowanie?",
      `Czy jest konkretna okolica, miejsce pracy lub adres w ${city}, od którego powinniśmy zacząć poszukiwania?`,
      "Jakiego rodzaju samodzielnego zakwaterowania Państwo szukają: mieszkania, studia, domu czy kilku oddzielnych lokali?",
      `Ile sypialni i osobnych łóżek potrzeba dla ${label}?`,
      "Czy są szczególne wymagania, na przykład parking, kuchnia lub możliwość prania?",
      "Jaki jest orientacyjny miesięczny budżet?",
    ];
    const text = [
      "Dzień dobry,",
      "",
      `Dziękujemy za zapytanie przesłane przez StayOnSite dotyczące zakwaterowania w ${city} dla ${label}.`,
      "",
      "Aby sprawdzić, czy możemy zaproponować odpowiednie rozwiązanie, potrzebuję kilku krótkich informacji:",
      "",
      ...questions.map((q, i) => `${i + 1}. ${q}`),
      "",
      "Proszę odpowiedzieć bezpośrednio na tę wiadomość, podając krótkie odpowiedzi. Wrócę wtedy z informacją o dostępnych możliwościach.",
      "",
      "Z poważaniem",
      "Kajsa Sihlén",
      "StayOnSite",
      "076-249 84 86",
      "kajsa@stayonsite.se",
      "www.stayonsite.se",
    ].join("\n");

    const html = `<div style="font-family:Arial,sans-serif;color:#111827;line-height:1.55;">
  <p>Dzień dobry,</p>
  <p>Dziękujemy za zapytanie przesłane przez StayOnSite dotyczące zakwaterowania w <strong>${esc(city)}</strong> dla ${esc(label)}.</p>
  <p>Aby sprawdzić, czy możemy zaproponować odpowiednie rozwiązanie, potrzebuję kilku krótkich informacji:</p>
  <ol>${questions.map((q) => `<li>${esc(q)}</li>`).join("")}</ol>
  <p>Proszę odpowiedzieć bezpośrednio na tę wiadomość, podając krótkie odpowiedzi. Wrócę wtedy z informacją o dostępnych możliwościach.</p>
  <p>Z poważaniem<br>Kajsa Sihlén<br>StayOnSite<br>076-249 84 86<br><a href="mailto:kajsa@stayonsite.se">kajsa@stayonsite.se</a><br><a href="https://www.stayonsite.se">www.stayonsite.se</a></p>
</div>`;

    return {
      subject: `Zakwaterowanie w ${city} – kilka krótkich pytań`,
      text,
      html,
      crmNote: [
        "Automatiskt kvalificeringsmejl skickat på polska.",
        "",
        `Förfrågan: ${company}, ${city}, ${label}.`,
        "Frågor skickade: startdatum, längd, område/arbetsplats/adress, typ av eget boende, sovrum/bäddar, krav och budget.",
        "Nästa steg: invänta svar och kvalificera innan matchning.",
      ].join("\n"),
    };
  }

  const questions = [
    "Från vilket datum behövs boendet?",
    "Hur länge gäller behovet ungefär?",
    `Finns det ett särskilt område, arbetsplats eller adress i ${city} vi ska utgå från?`,
    "Vilken typ av eget boende söker ni: lägenhet, studio, hus eller flera separata boenden?",
    `Hur många sovrum/bäddar behöver ni för ${label}?`,
    "Finns det särskilda krav, till exempel på parkering, kök eller tvättmöjlighet?",
    "Har ni en ungefärlig budget per månad?",
  ];
  const text = [
    "Hej,",
    "",
    `Tack för er förfrågan via StayOnSite om boende i ${city} för ${label}.`,
    "",
    "För att kunna se om vi har ett relevant upplägg behöver jag några snabba detaljer:",
    "",
    ...questions.map((q, i) => `${i + 1}. ${q}`),
    "",
    "Svara gärna direkt på det här mejlet med korta svar, så återkommer jag med vad som är möjligt.",
    "",
    "Med vänliga hälsningar",
    "Kajsa Sihlén",
    "StayOnSite",
    "076-249 84 86",
    "kajsa@stayonsite.se",
    "www.stayonsite.se",
  ].join("\n");

  const html = `<div style="font-family:Arial,sans-serif;color:#111827;line-height:1.55;">
  <p>Hej,</p>
  <p>Tack för er förfrågan via StayOnSite om boende i <strong>${esc(city)}</strong> för ${esc(label)}.</p>
  <p>För att kunna se om vi har ett relevant upplägg behöver jag några snabba detaljer:</p>
  <ol>${questions.map((q) => `<li>${esc(q)}</li>`).join("")}</ol>
  <p>Svara gärna direkt på det här mejlet med korta svar, så återkommer jag med vad som är möjligt.</p>
  <p>Med vänliga hälsningar<br>Kajsa Sihlén<br>StayOnSite<br>076-249 84 86<br><a href="mailto:kajsa@stayonsite.se">kajsa@stayonsite.se</a><br><a href="https://www.stayonsite.se">www.stayonsite.se</a></p>
</div>`;

  return {
    subject: `Boende i ${city} – några snabba frågor`,
    text,
    html,
    crmNote: [
      "Automatiskt kvalificeringsmejl skickat på svenska.",
      "",
      `Förfrågan: ${company}, ${city}, ${label}.`,
      "Frågor skickade: startdatum, längd, område/arbetsplats/adress, typ av eget boende, sovrum/bäddar, krav och budget.",
      "Nästa steg: invänta svar och kvalificera innan matchning.",
    ].join("\n"),
  };
}
