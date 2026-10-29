// Hemsidans publicering ändrar inte uthyrningsstatusen i CRM.
// Äldre publicerade objekt är historiskt behandlade som medgivna. Objekt som
// hittills varit dolda behöver ett dokumenterat medgivande innan de visas, så
// att en gammal publiceringsflagga inte ensam publicerar dem på nytt.
export const WEBSITE_PROPERTY_STATUSES = ["available", "off_market", "rented"] as const;

export function hasWebsitePropertyStatus(status: string | null | undefined, publishConsentAt?: string | null): boolean {
  return (WEBSITE_PROPERTY_STATUSES as readonly string[]).includes(status ?? "") || !!publishConsentAt?.trim();
}

export function hasCurrentPublicAvailability(status: string | null | undefined, availableTo: string | null | undefined, today = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Stockholm" })): boolean {
  return status === "available" && (!availableTo || availableTo >= today);
}

export function publicListingPatch(published: boolean) {
  return { published };
}
