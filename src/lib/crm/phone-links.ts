// Bygger WhatsApp-/SMS-länkar från ett fritt inskrivet telefonnummer.
// Normaliserar till E.164 med svensk landskod som default (numren i CRM:et skrivs
// oftast som "070-123 45 67" eller "+46 70…"). Rena funktioner — testas isolerat.

const SWEDEN_CC = "46";

// "070-123 45 67" → "+46701234567". Returnerar null om det inte går att tolka rimligt.
export function normalizePhoneE164(raw: string | null | undefined, defaultCc = SWEDEN_CC): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  const hasPlus = trimmed.startsWith("+");
  let digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;

  if (hasPlus) {
    // redan internationellt (+46…, +1…)
  } else if (digits.startsWith("00")) {
    digits = digits.slice(2); // 00 = internationellt utlandsprefix → bort
  } else if (digits.startsWith("0")) {
    digits = defaultCc + digits.slice(1); // nationellt svenskt → lägg på landskod
  }
  // annars: antar att landskod redan finns (t.ex. "46701234567")

  // E.164 tillåter max 15 siffror; under 8 är inget riktigt nummer.
  if (digits.length < 8 || digits.length > 15) return null;
  return `+${digits}`;
}

// wa.me kräver enbart siffror med landskod, utan inledande +.
export function whatsappHref(raw: string | null | undefined, defaultCc = SWEDEN_CC): string | null {
  const e164 = normalizePhoneE164(raw, defaultCc);
  return e164 ? `https://wa.me/${e164.slice(1)}` : null;
}

// sms: öppnar telefonens/Macens meddelandeapp med numret förifyllt.
export function smsHref(raw: string | null | undefined, defaultCc = SWEDEN_CC): string | null {
  const e164 = normalizePhoneE164(raw, defaultCc);
  return e164 ? `sms:${e164}` : null;
}
