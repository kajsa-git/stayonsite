import type { Owner, Property, Request } from "./schema";
import { firstNameOf } from "./sms-templates";

export const LANDLORD_MATCH_SUBJECT = "Företagskund matchad – se förfrågan 🏡";

function range(from: number | null, to: number | null): string | null {
  const min = from != null && from > 0 ? from : null;
  const max = to != null && to > 0 ? to : null;
  if (min != null && max != null) return min === max ? `${min}` : `${min}–${max}`;
  if (min != null) return `minst ${min}`;
  if (max != null) return `upp till ${max}`;
  return null;
}

// Enbart uttryckligen delbara fält. Interna anteckningar och kundens identitet
// får inte följa med automatiskt; saknade uppgifter anges som okända.
export function buildLandlordMatchMessages(request: Request, property: Property, owner: Owner) {
  const name = firstNameOf(owner.contactPerson || (owner.ownerType === "foretag" ? null : owner.name));
  const greeting = name ? `Hej ${name}!` : "Hej!";
  const city = request.city?.trim() || property.city?.trim();
  const location = city ? `i ${city}` : "i ditt område";
  const address = property.address?.trim();
  const home = address ? `din bostad på ${address}` : "din bostad";
  const date = request.startDate?.trim() || "inte angiven";
  const months = request.projectDurationMonths;
  const durationInput = request.landlordProjectDuration?.trim().replace(/^ca\.?\s+/i, "");
  const duration = durationInput ? `ca ${durationInput}` : months && months > 0 ? `ca ${months} ${months === 1 ? "månad" : "månader"}` : "inte angiven";
  const beds = range(request.bedsFrom, request.bedsTo);
  const bedsText = beds ? `${beds} bäddar` : "antal bäddar inte angivet";
  const bedrooms: Record<string, string> = {
    separate: "separata sovrum",
    shared: "delade sovrum fungerar",
    flexible: "flexibla önskemål om sovrum",
  };
  const bedroomText = bedrooms[request.landlordBedroomPreference ?? ""] ?? "önskemål om sovrum inte angivet";
  const parking = request.landlordParkingPreference === "yes" ? "ja"
    : request.landlordParkingPreference === "no" ? "nej"
      : request.parkingRequired === true ? "ja" : "inte angivet";
  const other = request.landlordOtherWishes?.trim();
  const signature = "Med vänlig hälsning,\nKajsa, HyrUtSmart - en del av StayOnSite";
  const sms = `${greeting} Vi har en potentiell matchning ${location} och tror att ${home} kan passa.\n` +
    `Önskad inflyttning: ${date}\nProjekttid: ${duration}\nBehov: ${bedsText}, ${bedroomText}.\n` +
    `Önskar parkering: ${parking}\n\nÄr bostaden tillgänglig? Svara gärna här.\n\n${signature}`;
  const email = `${greeting}\n\nVi har en företagskund som söker boende ${location}, och vi tror att ${home} skulle kunna passa.\n\n` +
    `Företaget söker:\n\n- Önskad inflyttning: ${date}\n- Projekttid: ${duration}\n` +
    `- Behov: ${bedsText}, ${bedroomText}\n- Önskar parkering: ${parking}` +
    (other ? `\n- Övriga önskemål: ${other}` : "") +
    `\n\nFinns bostaden tillgänglig under den ungefärliga perioden? Svara gärna även om den bara är ledig under en del av tiden, så kan vi se om det ändå kan fungera. Om perioden inte passar alls får du gärna meddela oss det också.\n\n` +
    `Nästa steg: Är bostaden tillgänglig presenterar vi den för företaget. Vill både du och företaget gå vidare är nästa steg att skriva kontrakt.\n\n${signature}`;
  return { sms, email, subject: LANDLORD_MATCH_SUBJECT };
}
