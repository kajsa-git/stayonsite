// Delning av publika objektlänkar. Web Share API på mobil (öppnar systemets
// delningsmeny → WhatsApp/SMS/Mail/AirDrop), clipboard-fallback på desktop.
// Anropas bara från klientkomponenter (rör navigator).

export type ShareOutcome = "shared" | "copied" | "failed";

// Returnerar utfallet så anroparen kan visa rätt toast.
export async function shareLink({
  url,
  title,
  text,
}: {
  url: string;
  title?: string;
  text?: string;
}): Promise<ShareOutcome> {
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({ url, title, text });
      return "shared";
    } catch (e) {
      // Användaren avbröt delningsmenyn → räkna inte som fel, kopiera inte heller.
      if (e instanceof Error && e.name === "AbortError") return "failed";
      // Andra fel (t.ex. share ej tillåten i kontexten) → fall vidare till clipboard.
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    return "failed";
  }
}

// Deep links. text bör redan innehålla länken (vi lägger inte till den här).
export const waHref = (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`;
// "sms:?&body=" fungerar på både iOS och Android.
export const smsHref = (text: string) => `sms:?&body=${encodeURIComponent(text)}`;
