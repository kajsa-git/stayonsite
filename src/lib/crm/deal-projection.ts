// Rollfiltrerade projektioner av en affär — EN modul äger sanningen om vem som
// ser vad. Generaliserar allowlist-mönstret från public-property.ts:
//
//   internt   → rå sanning, ingen projektion (skyddas av requireApprovedSession)
//   tenant    → kundens erbjudande: stämplade offer_*-villkor + tenant-säkra
//               objektfält. ALDRIG rentIn, marginal, kalkyl, matchScore, notes,
//               adress eller något owner-fält.
//   landlord  → (fas 3) uthyrarens löfte: promised_*-villkor + eget objekt.
//               ALDRIG rentOut, marginal eller kundföretagets identitet.
//
// Projektioner byggs fält-för-fält från explicita typer — aldrig genom att
// stryka nycklar ur hela rader. Nya fält läcker alltså inte av misstag.
//
// Medvetet beslut: objektets presentation (bilder, beskrivning) är LEVANDE och
// följer objektet, medan affärsvillkoren (pris, period) är stämplade på matchen
// och aldrig skrivs om av senare objektändringar.
import { and, desc, eq } from "drizzle-orm";
import { isAcceptanceValid, UPPDRAGSBEKRAFTELSE, UTHYRNINGSUPPDRAG } from "./avtal";
import { db } from "./db";
import { loadPublicProperty, type PublicProperty } from "./public-property";
import {
  agreementAcceptances,
  companies,
  matches,
  owners,
  properties,
  requests,
  type AgreementAcceptance,
  type Match,
} from "./schema";

// ---- Intern sanning -------------------------------------------------------

export interface DealTruth {
  request: {
    id: string;
    requestNumber: number | null;
    status: string;
    city: string | null;
    persons: number | null;
    startDate: string | null;
    endDate: string | null;
    endDateOngoing: boolean | null;
  };
  companyName: string | null;
  matches: Match[];
  // Senaste godkännande av uppdragsbekräftelsen för AKTUELL version, om något.
  acceptance: AgreementAcceptance | null;
}

export async function loadDealTruth(requestId: string): Promise<DealTruth | null> {
  const [request] = await db
    .select({
      id: requests.id,
      requestNumber: requests.requestNumber,
      status: requests.status,
      city: requests.city,
      persons: requests.persons,
      startDate: requests.startDate,
      endDate: requests.endDate,
      endDateOngoing: requests.endDateOngoing,
      companyId: requests.companyId,
    })
    .from(requests)
    .where(eq(requests.id, requestId))
    .limit(1);
  if (!request) return null;

  const [company] = await db
    .select({ name: companies.name })
    .from(companies)
    .where(eq(companies.id, request.companyId))
    .limit(1);

  const matchRows = await db.select().from(matches).where(eq(matches.requestId, requestId));

  // Uppdragsbekräftelsen gäller FÖRETAGET i 12 mån — en signering täcker alla
  // förfrågningar under giltighetstiden. Bara en GILTIG acceptans räknas
  // (rätt version + inom 12 mån); annars visas gaten igen.
  const [latest] = await db
    .select()
    .from(agreementAcceptances)
    .where(
      and(
        eq(agreementAcceptances.companyId, request.companyId),
        eq(agreementAcceptances.agreementType, UPPDRAGSBEKRAFTELSE.type)
      )
    )
    .orderBy(desc(agreementAcceptances.acceptedAt))
    .limit(1);
  const acceptance = isAcceptanceValid(latest, UPPDRAGSBEKRAFTELSE) ? latest : null;

  return {
    request: {
      id: request.id,
      requestNumber: request.requestNumber,
      status: request.status,
      city: request.city,
      persons: request.persons,
      startDate: request.startDate,
      endDate: request.endDate,
      endDateOngoing: request.endDateOngoing,
    },
    companyName: company?.name ?? null,
    matches: matchRows,
    acceptance: acceptance ?? null,
  };
}

// ---- Kundens projektion ----------------------------------------------------

// Ett erbjudet objekt så som kunden ser det. property är tenant-säker per
// PUBLIC_COLUMNS (postnummer + stad, aldrig adress; aldrig owner-*; aldrig priser
// från objektet — priset kunden ser är det STÄMPLADE offerRentOut).
export interface TenantOfferItem {
  matchId: string;
  status: "sent" | "accepted" | "unavailable";
  offerRentOut: number | null;
  offerStartDate: string | null;
  offerEndDate: string | null;
  offerOngoing: boolean | null;
  offerNote: string | null;
  property: PublicProperty | null; // null om objektet raderats — kortet visas ändå som otillgängligt
}

export interface TenantOfferView {
  requestNumber: number | null;
  companyName: string | null; // kundens EGET namn — personaliserar sidan, läcker inget
  city: string | null;
  persons: number | null;
  startDate: string | null;
  endDate: string | null;
  endDateOngoing: boolean | null;
  agreementAccepted: boolean;
  acceptedName: string | null;
  acceptedAt: string | null;
  offers: TenantOfferItem[];
}

// Kundens statusläsning av en match. Avvisad EFTER skick (t.ex. "Objektet togs av
// annan kund") blir "unavailable" — kortet gråas ut men försvinner aldrig; länken
// är ett sanningsenligt protokoll över vad som erbjudits.
function tenantStatus(m: Match): TenantOfferItem["status"] {
  if (m.status === "accepted") return "accepted";
  if (m.status === "sent") return "sent";
  return "unavailable";
}

export function projectTenant(truth: DealTruth, publicProps: Map<string, PublicProperty | null>): TenantOfferView {
  const offers = truth.matches
    .filter((m) => m.sentAt != null) // kunden ser bara det som faktiskt skickats
    .sort((a, b) => (a.sentAt! < b.sentAt! ? -1 : 1))
    .map((m): TenantOfferItem => ({
      matchId: m.id,
      status: tenantStatus(m),
      offerRentOut: m.offerRentOut,
      offerStartDate: m.offerStartDate,
      offerEndDate: m.offerEndDate,
      offerOngoing: m.offerOngoing,
      offerNote: m.offerNote,
      property: publicProps.get(m.propertyId) ?? null,
    }));

  return {
    requestNumber: truth.request.requestNumber,
    companyName: truth.companyName,
    city: truth.request.city,
    persons: truth.request.persons,
    startDate: truth.request.startDate,
    endDate: truth.request.endDate,
    endDateOngoing: truth.request.endDateOngoing,
    agreementAccepted: truth.acceptance != null,
    acceptedName: truth.acceptance?.acceptedName ?? null,
    acceptedAt: truth.acceptance?.acceptedAt ?? null,
    offers,
  };
}

// ---- Uthyrarens projektion (uthyrarlänken /uthyrare/<token>) ----------------

// Uthyraren ser SITT objekt (adressen är deras egen — ok), vad de lovats
// (promised_*) och affärens läge. ALDRIG: utpris/offer_*, marginal, kalkyl,
// matchpoäng, kundföretagets identitet eller interna anteckningar.
export interface LandlordDealView {
  ownerName: string | null;
  propertyAddress: string | null;
  propertyCity: string | null;
  persons: number | null;
  promisedRentIn: number | null;
  promisedStartDate: string | null;
  promisedEndDate: string | null;
  promisedConditions: string | null;
  promisedAt: string | null;
  status: "vantar" | "accepterad" | "avslutad";
  agreementAccepted: boolean;
  acceptedName: string | null;
  acceptedAt: string | null;
}

export async function loadLandlordDeal(matchId: string): Promise<LandlordDealView | null> {
  const [match] = await db.select().from(matches).where(eq(matches.id, matchId)).limit(1);
  if (!match) return null;

  const [request] = await db
    .select({ status: requests.status, persons: requests.persons })
    .from(requests)
    .where(eq(requests.id, match.requestId))
    .limit(1);
  if (!request) return null;
  if (request.status === "lost" || request.status === "archived") return null;

  const [property] = await db
    .select({ address: properties.address, city: properties.city, ownerId: properties.ownerId })
    .from(properties)
    .where(eq(properties.id, match.propertyId))
    .limit(1);
  if (!property) return null;

  let ownerName: string | null = null;
  if (property.ownerId) {
    const [owner] = await db.select({ name: owners.name }).from(owners).where(eq(owners.id, property.ownerId)).limit(1);
    ownerName = owner?.name ?? null;
  }

  // Uthyrningsuppdraget gäller UTHYRAREN (alla objekt) i 12 mån — en signering
  // täcker allt under giltighetstiden. Objekt utan ägare faller till objektscope.
  const [latest] = await db
    .select()
    .from(agreementAcceptances)
    .where(
      and(
        property.ownerId
          ? eq(agreementAcceptances.ownerId, property.ownerId)
          : eq(agreementAcceptances.propertyId, match.propertyId),
        eq(agreementAcceptances.agreementType, UTHYRNINGSUPPDRAG.type)
      )
    )
    .orderBy(desc(agreementAcceptances.acceptedAt))
    .limit(1);
  const acceptance = isAcceptanceValid(latest, UTHYRNINGSUPPDRAG) ? latest : null;

  return {
    ownerName,
    propertyAddress: property.address,
    propertyCity: property.city,
    persons: request.persons,
    promisedRentIn: match.promisedRentIn,
    promisedStartDate: match.promisedStartDate,
    promisedEndDate: match.promisedEndDate,
    promisedConditions: match.promisedConditions,
    promisedAt: match.promisedAt,
    status: match.status === "accepted" ? "accepterad" : match.status === "rejected" ? "avslutad" : "vantar",
    agreementAccepted: acceptance != null,
    acceptedName: acceptance?.acceptedName ?? null,
    acceptedAt: acceptance?.acceptedAt ?? null,
  };
}

// Fristående uthyrarlänk (utan affär): uthyraren signerar uppdragsavtalet tidigt,
// innan någon matchning finns. Efter signering visas en enkel bekräftelsevy.
export interface LandlordStandingView {
  ownerName: string | null;
  agreementAccepted: boolean;
  acceptedName: string | null;
  acceptedAt: string | null;
}

export async function loadLandlordStanding(ownerId: string): Promise<LandlordStandingView | null> {
  const [owner] = await db.select({ name: owners.name }).from(owners).where(eq(owners.id, ownerId)).limit(1);
  if (!owner) return null;

  const [latest] = await db
    .select()
    .from(agreementAcceptances)
    .where(
      and(eq(agreementAcceptances.ownerId, ownerId), eq(agreementAcceptances.agreementType, UTHYRNINGSUPPDRAG.type))
    )
    .orderBy(desc(agreementAcceptances.acceptedAt))
    .limit(1);
  const acceptance = isAcceptanceValid(latest, UTHYRNINGSUPPDRAG) ? latest : null;

  return {
    ownerName: owner.name,
    agreementAccepted: acceptance != null,
    acceptedName: acceptance?.acceptedName ?? null,
    acceptedAt: acceptance?.acceptedAt ?? null,
  };
}

// Allt-i-ett för erbjudandesidan: sanning + tenant-säkra objekt + projektion.
// Returnerar null för okänd förfrågan eller avslutat ärende (länkarna ska då
// redan vara återkallade — det här är bältet till hängslena).
export async function loadTenantOffer(requestId: string): Promise<TenantOfferView | null> {
  const truth = await loadDealTruth(requestId);
  if (!truth) return null;
  if (truth.request.status === "lost" || truth.request.status === "archived") return null;

  const sentPropertyIds = [...new Set(truth.matches.filter((m) => m.sentAt != null).map((m) => m.propertyId))];
  const publicProps = new Map<string, PublicProperty | null>();
  await Promise.all(
    sentPropertyIds.map(async (id) => {
      publicProps.set(id, await loadPublicProperty(id, { surface: "offer" }));
    })
  );

  return projectTenant(truth, publicProps);
}
