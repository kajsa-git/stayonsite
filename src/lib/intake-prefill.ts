// Överlämning från det korta husägarformuläret (/for-husagare) till den
// fullständiga bostadsregistreringen (/registrera-bostad). sessionStorage i
// stället för URL-parametrar så att namn, telefon och e-post inte hamnar i
// analysverktyg eller serverloggar.

const KEY = "sos:intake-prefill";
const MAX_AGE_MS = 60 * 60 * 1000;

export type IntakePrefill = {
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  postalCode: string;
  bedrooms: string;
  city: string;
};

export function saveIntakePrefill(prefill: Partial<IntakePrefill>) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ ...prefill, savedAt: Date.now() }));
  } catch {
    // Privat läge eller blockerad lagring: formuläret startar då tomt.
  }
}

export function readIntakePrefill(): Partial<IntakePrefill> | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<IntakePrefill> & { savedAt?: number };
    if (!parsed.savedAt || Date.now() - parsed.savedAt > MAX_AGE_MS) {
      sessionStorage.removeItem(KEY);
      return null;
    }
    const pick = (value: unknown) => (typeof value === "string" ? value.trim().slice(0, 200) : "");
    return {
      ownerName: pick(parsed.ownerName),
      ownerPhone: pick(parsed.ownerPhone),
      ownerEmail: pick(parsed.ownerEmail),
      postalCode: pick(parsed.postalCode),
      bedrooms: pick(parsed.bedrooms).replace(/\D/g, "").slice(0, 2),
      city: pick(parsed.city),
    };
  } catch {
    return null;
  }
}

export function clearIntakePrefill() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Ingenting att städa om lagringen inte går att nå.
  }
}
