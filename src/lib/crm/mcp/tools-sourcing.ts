// Källsökning för en förfrågan: de tre första stegen när en ny förfrågan kommer in.
// Samma logik som matchningsvyn i CRM:et (matching.ts, owner-search-leads.ts,
// qasa-search.ts) så att Kajsas agent och CRM:et alltid räknar likadant.
// Alla tre är läsverktyg. Inget skrivs och inget skickas.
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { eq, isNotNull, like } from "drizzle-orm";
import { z } from "zod";
import { db as defaultDb } from "../db";
import { detectListing } from "../import";
import { qasaCriteriaFromRequest, QasaUnknownAreaError } from "../import/qasa-search";
import { searchQasa } from "../import/qasa-search-fetch";
import { availableForRequest, matchDetails } from "../matching";
import { filterOwnerSearchLeads, ownerSearchCities, type OwnerSearchLead } from "../owner-search-leads";
import { companies, matches, owners, properties, requests, type Request } from "../schema";
import { BASE_URL_NOTE, clampLimit, crmRoute, errorContent, jsonContent, truncate, type DB } from "./shape";

const INACTIVE_STATUSES = new Set(["rented", "off_market"]);

async function loadRequest(db: DB, id: string): Promise<(Request & { companyName: string | null }) | null> {
  const [row] = await db
    .select({ request: requests, companyName: companies.name })
    .from(requests)
    .leftJoin(companies, eq(requests.companyId, companies.id))
    .where(eq(requests.id, id));
  return row ? { ...row.request, companyName: row.companyName } : null;
}

export async function requestMatches(
  db: DB,
  requestId: string,
  opts: { limit?: number; includeInactive?: boolean } = {},
) {
  const request = await loadRequest(db, requestId);
  if (!request) return null;

  const [rows, suggested] = await Promise.all([
    db.select({ property: properties, owner: owners }).from(properties).leftJoin(owners, eq(properties.ownerId, owners.id)),
    db.select({ propertyId: matches.propertyId, status: matches.status }).from(matches).where(eq(matches.requestId, requestId)),
  ]);
  const suggestedStatus = new Map(suggested.map((m) => [m.propertyId, m.status]));

  const scored = rows
    .filter(({ property }) => opts.includeInactive || !INACTIVE_STATUSES.has(property.status?.trim() ?? ""))
    .map(({ property, owner }) => {
      const details = matchDetails(request, property);
      return {
        propertyId: property.id,
        address: property.address,
        city: property.city,
        beds: property.beds,
        rentOut: property.rentOut,
        status: property.status,
        score: details.score,
        good: details.chips.filter((c) => c.tone === "good").map((c) => c.label),
        warnings: details.chips.filter((c) => c.tone !== "good").map((c) => c.label),
        availableForDates: availableForRequest(request, property),
        alreadySuggested: suggestedStatus.get(property.id) ?? null,
        ownerName: owner?.name ?? null,
        ownerPhone: owner?.phone ?? null,
        crmUrl: crmRoute.property(property.id),
      };
    })
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score);

  return {
    request: {
      id: request.id,
      requestNumber: request.requestNumber,
      company: request.companyName,
      city: request.city,
      persons: request.persons,
      bedsFrom: request.bedsFrom,
      bedroomsFrom: request.bedroomsFrom,
      startDate: request.startDate,
      endDate: request.endDate,
      budgetMax: request.budgetMax,
      crmUrl: crmRoute.company(request.companyId),
    },
    totalScored: scored.length,
    properties: scored.slice(0, clampLimit(opts.limit, 10, 25)),
  };
}

export async function ownerLeadsForCity(db: DB, city: string): Promise<OwnerSearchLead[]> {
  const rows = await db
    .select({
      id: owners.id,
      name: owners.name,
      contactPerson: owners.contactPerson,
      phone: owners.phone,
      email: owners.email,
      notes: owners.notes,
    })
    .from(owners)
    .where(isNotNull(owners.notes));
  const leads = rows.flatMap(({ notes, ...owner }) => {
    const cities = ownerSearchCities(notes);
    return cities.length ? [{ ...owner, cities }] : [];
  });
  return filterOwnerSearchLeads(leads, { city });
}

export function registerSourcingTools(server: McpServer, opts?: { db?: DB }) {
  const db = () => opts?.db ?? defaultDb;

  server.registerTool(
    "crm_request_matches",
    {
      title: "Matching properties for a request",
      description:
        "Ranks the CRM's properties (objekt) against a housing request (förfrågan) with the same " +
        "scoring as the CRM's matching view: score 0-100, what fits (good) and what is off or unknown " +
        "(warnings). Rented and off-market properties are left out unless includeInactive is set. " +
        `Distance is not part of the score here. ${BASE_URL_NOTE}`,
      inputSchema: {
        requestId: z.string().describe("Request id"),
        limit: z.number().int().min(1).max(25).optional().describe("Max properties, default 10"),
        includeInactive: z.boolean().optional().describe("Also include rented/off-market properties"),
      },
    },
    async ({ requestId, limit, includeInactive }) => {
      const result = await requestMatches(db(), requestId, { limit, includeInactive });
      if (!result) return errorContent(`not found: request ${requestId}`);
      return jsonContent(result);
    },
  );

  server.registerTool(
    "crm_owner_search_leads",
    {
      title: "Landlords who offer housing in a city",
      description:
        "Landlords (uthyrare) whose card lists the city under 'Sökorter:', i.e. they have said they can " +
        "offer housing there. Give a city, or a requestId to use the request's city. " +
        `Contacting them is a separate, human-approved step. ${BASE_URL_NOTE}`,
      inputSchema: {
        city: z.string().optional().describe("City, e.g. Gävle"),
        requestId: z.string().optional().describe("Use this request's city"),
      },
    },
    async ({ city, requestId }) => {
      let searchCity = city?.trim() ?? "";
      if (!searchCity && requestId) {
        const request = await loadRequest(db(), requestId);
        if (!request) return errorContent(`not found: request ${requestId}`);
        searchCity = request.city?.trim() ?? "";
      }
      if (!searchCity) return errorContent("Ange city eller en requestId som har en ort.");
      const leads = await ownerLeadsForCity(db(), searchCity);
      return jsonContent({ city: searchCity, owners: leads.map((l) => ({ ...l, crmUrl: crmRoute.owner(l.id) })) });
    },
  );

  server.registerTool(
    "qasa_search_for_request",
    {
      title: "Search Qasa for a request",
      description:
        "Searches Qasa's public listing index with the request's city, size, dates and budget (the same " +
        "search as the CRM's Qasa panel). Returns listing links; hits that already exist as CRM properties " +
        "are marked inCrmPropertyId. Nothing is imported or contacted.",
      inputSchema: {
        requestId: z.string().describe("Request id"),
        offset: z.number().int().min(0).max(600).optional().describe("Paging offset, default 0"),
        limit: z.number().int().min(1).max(30).optional().describe("Max hits, default 10"),
      },
    },
    async ({ requestId, offset, limit }) => {
      const request = await loadRequest(db(), requestId);
      if (!request) return errorContent(`not found: request ${requestId}`);
      const criteria = qasaCriteriaFromRequest(request);
      if (!criteria.city) return errorContent("Förfrågan saknar ort, Qasa kan inte sökas.");
      try {
        const result = await searchQasa(criteria, offset ?? 0);
        const inCrm = new Map<string, string>();
        const rows = await db()
          .select({ id: properties.id, links: properties.links })
          .from(properties)
          .where(like(properties.links, "%qasa.%"));
        for (const row of rows) {
          for (const link of row.links ?? []) {
            const d = detectListing(link);
            if (d?.source === "qasa") inCrm.set(d.id, row.id);
          }
        }
        return jsonContent({
          criteria,
          area: result.area,
          total: result.total,
          hits: result.hits.slice(0, clampLimit(limit, 10, 30)).map((h) => ({
            url: h.url,
            street: h.street,
            locality: h.locality,
            rent: h.rent,
            rooms: h.rooms,
            bedrooms: h.bedrooms,
            householdSize: h.householdSize,
            furnished: h.furnished,
            homeType: h.homeType,
            startDate: h.startDate,
            endDate: h.endDate,
            publishedAt: h.publishedAt,
            inCrmPropertyId: inCrm.get(h.qasaId) ?? null,
          })),
        });
      } catch (error) {
        if (error instanceof QasaUnknownAreaError) return errorContent(`Qasa känner inte igen orten "${criteria.city}".`);
        return errorContent(`Qasa-sökningen misslyckades: ${truncate(error instanceof Error ? error.message : String(error), 200)}`);
      }
    },
  );
}
