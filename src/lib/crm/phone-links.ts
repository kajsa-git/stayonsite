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
  } else if (digits.length === 9 && digits.startsWith("7")) {
    // svensk mobil som tappat inledande nollan ("706629338") — kan inte vara ett
    // giltigt +7-nummer (Ryssland/Kazakstan har 11 siffror), så tolka som 07…
    digits = defaultCc + digits;
  }
  // annars: antar att landskod redan finns (t.ex. "46701234567")

  // E.164 tillåter max 15 siffror; under 8 är inget riktigt nummer.
  if (digits.length < 8 || digits.length > 15) return null;
  return `+${digits}`;
}

// Kanoniskt lagringsformat för telefonnummer i CRM:et: E.164 ("+46701234567").
// Otolkbar text (t.ex. "ring efter 17") bevaras trimmad hellre än att tappas —
// då syns den i UI:t och kan rättas manuellt.
export function normalizePhoneForStorage(raw: string | null | undefined): string | null {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return null;
  return normalizePhoneE164(trimmed) ?? trimmed;
}

// Gruppera abonnentnummer bakifrån i par ("123 45 67", "12 34 56 78").
function groupSubscriber(s: string): string {
  const groups: string[] = [];
  let i = s.length;
  while (i > 3) {
    groups.unshift(s.slice(i - 2, i));
    i -= 2;
  }
  if (i > 0) groups.unshift(s.slice(0, i));
  return groups.join(" ");
}

// Visningsformat: +46-nummer renderas nationellt ("070-123 45 67", "08-12 34 56 78",
// "026-123 45 67"). Andra landskoder och otolkbar text returneras som de är.
export function formatPhoneSv(stored: string | null | undefined): string | null {
  if (!stored) return null;
  const m = stored.match(/^\+46(\d{7,12})$/);
  if (!m) return stored;
  const national = "0" + m[1];
  // Riktnummer: 08 är tvåsiffrigt, mobil (07x) och övriga behandlas som tresiffriga.
  const areaLen = national.startsWith("08") ? 2 : 3;
  return `${national.slice(0, areaLen)}-${groupSubscriber(national.slice(areaLen))}`;
}

// whatsapp://-schemat öppnar WhatsApp-skrivbordsappen (eller mobilappen) direkt,
// utan omväg via wa.me/webben. Kräver siffror med landskod, utan inledande +.
export function whatsappHref(raw: string | null | undefined, defaultCc = SWEDEN_CC): string | null {
  const e164 = normalizePhoneE164(raw, defaultCc);
  return e164 ? `whatsapp://send?phone=${e164.slice(1)}` : null;
}

// sms: öppnar telefonens/Macens meddelandeapp med numret förifyllt.
export function smsHref(raw: string | null | undefined, defaultCc = SWEDEN_CC): string | null {
  const e164 = normalizePhoneE164(raw, defaultCc);
  return e164 ? `sms:${e164}` : null;
}
