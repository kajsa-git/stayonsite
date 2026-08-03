import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { getCompanyDetail } from "../company-detail";
import { db as defaultDb } from "../db";
import { getOwnerDetail } from "../owner-detail";
import { companies, contacts, matches, owners, properties, propertyImages, propertyNotes, requests, type Property } from "../schema";
import { BASE_URL_NOTE, crmRoute, errorContent, jsonContent, truncate, type DB } from "./shape";

const NOTE_CAP = 20;
const NOTE_CHARS = 500;
const MATCH_CAP = 10;

// Lokaliserade AI-varianter (en/pl) är stora och redundanta i en LLM-kontext —
// källtexten på svenska räcker.
function stripLocalized(p: Property): Omit<Property, "publicDescriptionEn" | "publicDescriptionPl" | "skickEn" | "skickPl" | "inclusionsEn" | "inclusionsPl"> {
  const { publicDescriptionEn, publicDescriptionPl, skickEn, skickPl, inclusionsEn, inclusionsPl, ...rest } = p;
  return rest;
}

export function registerEntityTools(server: McpServer, opts?: { db?: DB }) {
  const db = () => opts?.db ?? defaultDb;

  server.registerTool(
    "crm_get_company",
    {
      title: "Get company",
      description:
        "A company (kund) with its contacts, requests (förfrågningar, incl. proposal counts) " +
        `and latest notes. ${BASE_URL_NOTE}`,
      inputSchema: { id: z.string().describe("Company id") },
    },
    async ({ id }) => {
      const detail = await getCompanyDetail(id, { db: db() });
      if (!detail) return errorContent(`not found: company ${id}`);
      const sortedNotes = [...detail.notes].sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
      return jsonContent({
        ...detail,
        notes: sortedNotes.slice(0, NOTE_CAP).map((n) => ({ ...n, content: truncate(n.content, NOTE_CHARS) })),
        crmUrl: crmRoute.company(detail.id),
      });
    },
  );

  server.registerTool(
    "crm_get_owner",
    {
      title: "Get owner",
      description: `An owner/landlord (uthyrare) with a compact list of their properties (objekt). ${BASE_URL_NOTE}`,
      inputSchema: { id: z.string().describe("Owner id") },
    },
    async ({ id }) => {
      const detail = await getOwnerDetail(id, { db: db() });
      if (!detail) return errorContent(`not found: owner ${id}`);
      return jsonContent({
        ...detail,
        properties: detail.properties.map((p) => ({ ...p, crmUrl: crmRoute.property(p.id) })),
        crmUrl: crmRoute.owner(detail.id),
      });
    },
  );

  server.registerTool(
    "crm_get_property",
    {
      title: "Get property",
      description:
        "A property (objekt) with its owner (uthyrare), latest notes and image count. " +
        `No image URLs are returned. ${BASE_URL_NOTE}`,
      inputSchema: { id: z.string().describe("Property id") },
    },
    async ({ id }) => {
      const [property] = await db().select().from(properties).where(eq(properties.id, id));
      if (!property) return errorContent(`not found: property ${id}`);

      const [owner, notes, [imageCount]] = await Promise.all([
        property.ownerId
          ? db().select().from(owners).where(eq(owners.id, property.ownerId)).then((r) => r[0] ?? null)
          : Promise.resolve(null),
        db()
          .select()
          .from(propertyNotes)
          .where(eq(propertyNotes.propertyId, id))
          .orderBy(desc(propertyNotes.createdAt))
          .limit(MATCH_CAP),
        db()
          .select({ count: sql<number>`count(*)` })
          .from(propertyImages)
          .where(eq(propertyImages.propertyId, id)),
      ]);

      return jsonContent({
        ...stripLocalized(property),
        owner,
        notes: notes.map((n) => ({ ...n, content: truncate(n.content, NOTE_CHARS) })),
        imageCount: imageCount?.count ?? 0,
        crmUrl: crmRoute.property(id),
      });
    },
  );

  server.registerTool(
    "crm_get_request",
    {
      title: "Get request",
      description:
        "A housing request (förfrågan) with company name and its latest proposals/matches " +
        `(förslag) incl. property address. ${BASE_URL_NOTE}`,
      inputSchema: { id: z.string().describe("Request id") },
    },
    async ({ id }) => {
      const [request] = await db().select().from(requests).where(eq(requests.id, id));
      if (!request) return errorContent(`not found: request ${id}`);

      const [[company], matchRows] = await Promise.all([
        db().select({ name: companies.name }).from(companies).where(eq(companies.id, request.companyId)),
        db()
          .select({
            id: matches.id,
            propertyId: matches.propertyId,
            propertyAddress: properties.address,
            propertyCity: properties.city,
            status: matches.status,
            matchScore: matches.matchScore,
            sentAt: matches.sentAt,
            followUpDate: matches.followUpDate,
            offerRentOut: matches.offerRentOut,
            promisedRentIn: matches.promisedRentIn,
            notes: matches.notes,
            createdAt: matches.createdAt,
          })
          .from(matches)
          .innerJoin(properties, eq(matches.propertyId, properties.id))
          .where(eq(matches.requestId, id))
          .orderBy(desc(matches.createdAt))
          .limit(MATCH_CAP),
      ]);

      return jsonContent({
        ...request,
        notes: truncate(request.notes, NOTE_CHARS),
        companyName: company?.name ?? null,
        matches: matchRows.map((m) => ({ ...m, notes: truncate(m.notes, 300), crmUrl: crmRoute.property(m.propertyId) })),
        crmUrl: crmRoute.company(request.companyId),
      });
    },
  );

  server.registerTool(
    "crm_get_contact",
    {
      title: "Get contact",
      description: `A company contact person with their company name. ${BASE_URL_NOTE}`,
      inputSchema: { id: z.string().describe("Contact id") },
    },
    async ({ id }) => {
      const [contact] = await db().select().from(contacts).where(eq(contacts.id, id));
      if (!contact) return errorContent(`not found: contact ${id}`);
      const [company] = await db().select({ name: companies.name }).from(companies).where(eq(companies.id, contact.companyId));
      return jsonContent({ ...contact, companyName: company?.name ?? null, crmUrl: crmRoute.company(contact.companyId) });
    },
  );
}
