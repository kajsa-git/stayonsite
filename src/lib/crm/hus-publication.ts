// This identifies the exact HUS publication choice shown at registration.
export const HUS_INTAKE_VERSION = "2026-11-02.1";
export const HUS_PUBLICATION_SMS_SOURCE = "hus_publication";
export const HUS_UPLOAD_LINK_ACTOR = "system:hus-upload";

export function husPublicationSmsId(propertyId: string): string {
  return `hus-publication:${propertyId}`;
}

export function husPublishedLinkSms(propertyId: string): string {
  // The public detail page redirects an ID to its canonical slug. IDs have a
  // fixed length, unlike slugs and names, so the text fits in one GSM-7 SMS.
  return `Hej! Din bostad är publicerad: www.stayonsite.se/boenden/${propertyId}\nExakt adress visas inte. Svara här. /Kajsa, HyrUtSmart - en del av StayOnSite`;
}
