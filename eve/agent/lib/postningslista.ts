// Postningslistan i Telegram: ett meddelande med en rad per Facebook-grupp.
// Gruppnamnet är en länk som öppnar gruppen, ✅ markerar att Kajsa har postat.
// Allt läge ligger i själva meddelandets knappar, så inget behöver sparas någon
// annanstans förrän Kajsa trycker "Klar" och listan loggas i CRM:et.
//
// callback_data (max 64 byte i Telegram):
//   p|<requestId>|<rad>  markera rad som postad
//   u|<requestId>|<rad>  ångra
//   k|<requestId>        klar: logga i CRM:et
import { gruppLank } from "./facebook-grupper.ts";

export interface InlineButton {
  text: string;
  url?: string;
  callback_data?: string;
}
export type Keyboard = InlineButton[][];

export const RADER_PER_MEDDELANDE = 40;
const POSTAD = "✔️";
const EJ_POSTAD = "✅";
const MAX_KNAPPTEXT = 48;

export interface ListRad {
  namn: string;
  variant?: string;
}

function kortNamn(namn: string): string {
  return namn.length > MAX_KNAPPTEXT ? `${namn.slice(0, MAX_KNAPPTEXT - 1)}…` : namn;
}

export function byggTangentbord(requestId: string, rader: ListRad[], start = 0): Keyboard {
  const kb: Keyboard = rader.map((rad, i) => {
    const nr = start + i + 1;
    const etikett = `${nr}. ${kortNamn(rad.namn)}${rad.variant ? ` · ${rad.variant}` : ""}`;
    return [
      { text: etikett, url: gruppLank(rad.namn) },
      { text: EJ_POSTAD, callback_data: `p|${requestId}|${start + i}` },
    ];
  });
  kb.push([{ text: "Klar – logga i CRM:et", callback_data: `k|${requestId}` }]);
  return kb;
}

/** Delar listan i meddelanden om högst RADER_PER_MEDDELANDE rader. */
export function delaLista(requestId: string, rader: ListRad[]): Keyboard[] {
  const delar: Keyboard[] = [];
  for (let i = 0; i < rader.length; i += RADER_PER_MEDDELANDE) {
    delar.push(byggTangentbord(requestId, rader.slice(i, i + RADER_PER_MEDDELANDE), i));
  }
  return delar;
}

export type Tryck =
  | { typ: "postad" | "angra"; requestId: string; rad: number }
  | { typ: "klar"; requestId: string };

export function tolkaTryck(data: string | undefined): Tryck | null {
  if (!data) return null;
  const [kod, requestId, rad] = data.split("|");
  if (!requestId) return null;
  if (kod === "k") return { typ: "klar", requestId };
  const n = Number(rad);
  if (!Number.isInteger(n) || n < 0) return null;
  if (kod === "p") return { typ: "postad", requestId, rad: n };
  if (kod === "u") return { typ: "angra", requestId, rad: n };
  return null;
}

/** Ny knappsats efter ett tryck på ✅ eller ✔️. Okänd rad ger null. */
export function vaxla(kb: Keyboard, tryck: Extract<Tryck, { rad: number }>): Keyboard | null {
  const fran = `${tryck.typ === "postad" ? "p" : "u"}|${tryck.requestId}|${tryck.rad}`;
  let hittad = false;
  const ny = kb.map((rad) =>
    rad.map((knapp) => {
      if (knapp.callback_data !== fran) return knapp;
      hittad = true;
      return tryck.typ === "postad"
        ? { text: POSTAD, callback_data: `u|${tryck.requestId}|${tryck.rad}` }
        : { text: EJ_POSTAD, callback_data: `p|${tryck.requestId}|${tryck.rad}` };
    }),
  );
  return hittad ? ny : null;
}

/** Grupperna som är markerade som postade i en knappsats. */
export function postadeGrupper(kb: Keyboard): string[] {
  return kb
    .filter((rad) => rad.some((k) => k.callback_data?.startsWith("u|")))
    .map((rad) => {
      // Hela namnet står i länken; knapptexten kan vara förkortad.
      const fran = rad[0]?.url ? new URL(rad[0].url).searchParams.get("q") : null;
      return fran ?? rad[0]?.text.replace(/^\d+\.\s*/, "").replace(/\s·\s[A-Z]$/, "") ?? "";
    })
    .filter(Boolean);
}

export function markeraLoggad(kb: Keyboard, antal: number): Keyboard {
  return kb.map((rad) =>
    rad.map((k) => (k.callback_data?.startsWith("k|") ? { text: `Loggat i CRM:et (${antal} grupper)`, callback_data: "noop" } : k)),
  );
}

export function lasTangentbord(raw: Record<string, unknown>): Keyboard | null {
  const message = raw.message as { reply_markup?: { inline_keyboard?: unknown } } | undefined;
  const kb = message?.reply_markup?.inline_keyboard;
  return Array.isArray(kb) ? (kb as Keyboard) : null;
}
