import { firstNameOf } from "./sms-templates";

// This identifies the exact HUS publication choice shown at registration.
export const HUS_INTAKE_VERSION = "2026-11-02.1";
export const HUS_PUBLICATION_SMS_SOURCE = "hus_publication";
export const HUS_UPLOAD_LINK_ACTOR = "system:hus-upload";

export function husPublicationSmsId(propertyId: string): string {
  return `hus-publication:${propertyId}`;
}

export function husPublishedLinkSms(name: string | null | undefined, slug: string): string {
  const first = firstNameOf(name);
  const greeting = first ? `Hej ${first}!` : "Hej!";
  return `${greeting} Din bostad är nu publicerad efter granskning: www.stayonsite.se/boenden/${slug}\nDin exakta adress och dina kontaktuppgifter visas inte. Vill du ändra något eller ta bort annonsen? Svara på detta sms. /hus, en tjänst av StayOnSite`;
}
