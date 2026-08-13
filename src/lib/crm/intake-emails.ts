// Automatiska utskick vid bostadsintag — husägaren ska känna sig sedd direkt,
// utan att Kajsa handlägger något. Rena byggfunktioner (testbara utan nät);
// själva skicket görs av anroparen via Resend. Copy följer textriktlinjerna:
// konkret, inga överdrifter — och INGA tidslöften ("inom 24 timmar" skapar en
// handläggningsskuld; nästa kontakt är händelsestyrd: annons ute / hyresgäst).
import { firstNameOf } from "./sms-templates";

export interface BuiltEmail {
  subject: string;
  text: string;
  html: string;
}

const ORANGE_BTN =
  'style="display:inline-block;background:#ff6300;color:#ffffff;padding:12px 24px;border-radius:9999px;text-decoration:none;font-weight:600"';

// Kvittot till husägaren: bostaden är mottagen + de två snabba stegen på den
// egna sidan (publiceringsgodkännande + uppdragssignering). Samma länk som
// påminnelse-cronen använder — hela flödet pekar på ETT ställe.
export function buildIntakeConfirmationEmail(args: {
  ownerName: string | null;
  address: string | null;
  city: string | null;
  imageCount: number;
  token: string | null;
}): BuiltEmail {
  const first = firstNameOf(args.ownerName);
  const greeting = first ? `Hej ${first},` : "Hej,";
  const what = [args.address, args.city].filter(Boolean).join(", ") || "din bostad";
  const url = args.token ? `https://www.stayonsite.se/uthyrare/${args.token}` : null;
  const bilder = args.imageCount > 0 ? ` med ${args.imageCount} ${args.imageCount === 1 ? "bild" : "bilder"}` : "";

  const steps = url
    ? [
        "Två snabba steg när det passar dig — båda tar under en minut:",
        `1. Godkänn att annonsen får visas online (exakt adress visas aldrig publikt).`,
        `2. Signera uthyrningsuppdraget — kostnadsfritt och inte exklusivt.`,
        "",
        `Din sida: ${url}`,
      ]
    : [];

  const text = [
    greeting,
    "",
    `Tack — vi har tagit emot ${what}${bilder}. Vi granskar uppgifter och bilder — inget visas online utan ditt godkännande, och du behöver inte göra något mer just nu.`,
    "",
    ...steps,
    steps.length ? "" : null,
    "Har du frågor? Svara på det här mejlet eller ring Kajsa på 076-249 84 86.",
    "",
    "Vänliga hälsningar",
    "Kajsa Sihlén",
    "StayOnSite",
  ]
    .filter((l) => l !== null)
    .join("\n");

  const html = [
    `<p>${greeting}</p>`,
    `<p>Tack — vi har tagit emot <strong>${what}</strong>${bilder}. Vi granskar uppgifter och bilder — inget visas online utan ditt godkännande, och du behöver inte göra något mer just nu.</p>`,
    ...(url
      ? [
          "<p>Två snabba steg när det passar dig — båda tar under en minut:</p>",
          "<ol style=\"margin:0 0 12px;padding-left:20px\">" +
            "<li>Godkänn att annonsen får visas online — exakt adress visas aldrig publikt.</li>" +
            "<li>Signera uthyrningsuppdraget — kostnadsfritt och inte exklusivt.</li>" +
            "</ol>",
          `<p><a href="${url}" ${ORANGE_BTN}>Öppna din sida</a></p>`,
          `<p>Fungerar inte knappen? Öppna länken direkt: <a href="${url}">${url}</a></p>`,
        ]
      : []),
    "<p>Har du frågor? Svara på det här mejlet eller ring Kajsa på 076-249 84 86.</p>",
    "<p>Vänliga hälsningar<br>Kajsa Sihlén<br>StayOnSite</p>",
  ].join("\n");

  return { subject: "Tack — vi har tagit emot din bostad", text, html };
}

// Notisen till Kajsa: ett komplett intag med bilder ska aldrig kunna passera
// osett (tidigare skickades ingenting). Djuplänk rakt in i objektet i CRM:et.
export function buildIntakeNotificationEmail(args: {
  propertyId: string;
  ownerName: string | null;
  ownerPhone: string | null;
  ownerEmail: string | null;
  ownerType: string | null;
  address: string | null;
  city: string | null;
  imageCount: number;
  imageErrors: string[];
}): BuiltEmail {
  const where = [args.address, args.city].filter(Boolean).join(", ") || "adress saknas";
  const crmUrl = `https://www.stayonsite.se/crm/properties?id=${args.propertyId}`;
  const rows: [string, string][] = [
    ["Objekt", where],
    ["Uthyrare", args.ownerName ?? "—"],
    ["Typ", args.ownerType === "foretag" ? "Företag" : "Privatperson"],
    ["Telefon", args.ownerPhone ?? "—"],
    ["E-post", args.ownerEmail ?? "— (bekräftelse gick som SMS om nummer finns)"],
    ["Bilder", `${args.imageCount} uppladdade${args.imageErrors.length ? `, ${args.imageErrors.length} fel` : ""}`],
  ];

  const text = [
    `Nytt bostadsintag: ${where}`,
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    `Öppna i CRM: ${crmUrl}`,
  ].join("\n");

  const html = [
    `<p><strong>Nytt bostadsintag:</strong> ${where}</p>`,
    "<table style=\"border-collapse:collapse\">" +
      rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:4px 12px 4px 0;font-weight:600">${k}</td><td style="padding:4px 0">${v}</td></tr>`,
        )
        .join("") +
      "</table>",
    `<p><a href="${crmUrl}" ${ORANGE_BTN}>Öppna i CRM</a></p>`,
  ].join("\n");

  return { subject: `Nytt bostadsintag: ${where} — ${args.imageCount} bilder`, text, html };
}
