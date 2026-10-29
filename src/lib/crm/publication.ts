// Hemsidans publicering ändrar inte uthyrningsstatusen i CRM.
// Reserverade objekt visas ännu inte på hemsidan.
export const WEBSITE_PROPERTY_STATUSES = ["available", "off_market", "rented"] as const;

export function hasWebsitePropertyStatus(status: string | null | undefined): boolean {
  return (WEBSITE_PROPERTY_STATUSES as readonly string[]).includes(status ?? "");
}

export function publicListingPatch(published: boolean) {
  return { published };
}
