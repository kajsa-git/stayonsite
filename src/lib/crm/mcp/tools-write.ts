// Icke-destruktiva skrivverktyg — registreras BARA med skriv-token
// (CRM_MCP_WRITE_TOKEN). Inga raderingar, inga utskick: crm_draft_message lägger
// utkast som Kajsa godkänner i Utkast-panelen innan något lämnar systemet.
// Handlers är exporterade funktioner med injicerbara sidoeffekter så de kan
// enhetstestas mot en tempfils-DB.
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { db as defaultDb } from "../db";
import { normalizePhoneE164 } from "../phone-links";
import { applyRequestUpdate } from "../request-update";
import { companies, notes, outboxMessages, owners, properties, propertyNotes, type Note, type PropertyNote } from "../schema";
import {
  indexCompany as defaultIndexCompany,
  indexNote as defaultIndexNote,
  indexOwner as defaultIndexOwner,
} from "../search-index";
import { BASE_URL_NOTE, crmRoute, errorContent, jsonContent, type DB } from "./shape";

const MAX_SMS_CHARS = 1600;

type WriteResult<T> = { ok: true; row: T } | { ok: false; message: string };

// libSQL kör med foreign_keys OFF — existenskoll krävs, annars skapas
// föräldralösa rader tyst.
export async function addNote(
  args: { companyId: string; channel: string; content: string },
  opts?: { db?: DB; indexNote?: (id: string) => Promise<unknown> },
): Promise<WriteResult<Note>> {
  const db = opts?.db ?? defaultDb;
  const indexNote = opts?.indexNote ?? defaultIndexNote;

  const [company] = await db.select({ id: companies.id }).from(companies).where(eq(companies.id, args.companyId));
  if (!company) return { ok: false, message: `not found: company ${args.companyId}` };

  const id = nanoid();
  const [row] = await db
    .insert(notes)
    .values({ id, companyId: args.companyId, channel: args.channel, content: args.content, source: "mcp" })
    .returning();
  await indexNote(id).catch((e) => console.error("search-index note:", e));
  return { ok: true, row };
}

export async function addPropertyNote(
  args: { propertyId: string; channel: string; content: string },
  opts?: { db?: DB },
): Promise<WriteResult<PropertyNote>> {
  const db = opts?.db ?? defaultDb;

  const [property] = await db.select({ id: properties.id }).from(properties).where(eq(properties.id, args.propertyId));
  if (!property) return { ok: false, message: `not found: property ${args.propertyId}` };

  const [row] = await db
    .insert(propertyNotes)
    .values({ id: nanoid(), propertyId: args.propertyId, channel: args.channel, content: args.content, source: "mcp" })
    .returning();
  return { ok: true, row };
}

export async function setFollowUp(
  args: { entity: "company" | "owner"; id: string; date: string; time?: string; reason?: string },
  opts?: {
    db?: DB;
    indexCompany?: (id: string) => Promise<unknown>;
    indexOwner?: (id: string) => Promise<unknown>;
  },
): Promise<WriteResult<Record<string, unknown>>> {
  const db = opts?.db ?? defaultDb;
  const now = new Date().toISOString();

  if (args.entity === "company") {
    const [row] = await db
      .update(companies)
      .set({
        followUpDate: args.date,
        ...(args.time !== undefined ? { followUpTime: args.time } : {}),
        ...(args.reason !== undefined ? { followUpReason: args.reason } : {}),
        updatedAt: now,
      })
      .where(eq(companies.id, args.id))
      .returning();
    if (!row) return { ok: false, message: `not found: company ${args.id}` };
    await (opts?.indexCompany ?? defaultIndexCompany)(args.id).catch((e) => console.error("search-index company:", e));
    return { ok: true, row };
  }

  const [row] = await db
    .update(owners)
    .set({
      followUpDate: args.date,
      ...(args.reason !== undefined ? { followUpReason: args.reason } : {}),
      updatedAt: now,
    })
    .where(eq(owners.id, args.id))
    .returning();
  if (!row) return { ok: false, message: `not found: owner ${args.id}` };
  await (opts?.indexOwner ?? defaultIndexOwner)(args.id).catch((e) => console.error("search-index owner:", e));
  return { ok: true, row };
}

export async function draftMessage(
  args: { toPhone: string; body: string; ownerId?: string; contactId?: string },
  opts?: { db?: DB },
): Promise<WriteResult<typeof outboxMessages.$inferSelect>> {
  const db = opts?.db ?? defaultDb;

  const toPhone = normalizePhoneE164(args.toPhone);
  if (!toPhone) return { ok: false, message: "invalid phone number" };
  const body = args.body.trim();
  if (!body) return { ok: false, message: "empty message body" };
  if (body.length > MAX_SMS_CHARS) return { ok: false, message: `message too long (max ${MAX_SMS_CHARS} chars)` };

  const [row] = await db
    .insert(outboxMessages)
    .values({
      id: nanoid(),
      toPhone,
      body,
      status: "draft", // aldrig "queued" härifrån — Mac-agenten ser bara godkända
      ownerId: args.ownerId ?? null,
      contactId: args.contactId ?? null,
      source: "mcp",
    })
    .returning();
  return { ok: true, row };
}

const YMD = /^\d{4}-\d{2}-\d{2}$/;
const HM = /^\d{2}:\d{2}$/;

export function registerWriteTools(server: McpServer, opts?: { db?: DB }) {
  server.registerTool(
    "crm_add_note",
    {
      title: "Add company note",
      description:
        "Log a note on a company (kund) — a call summary, agreement or observation. " +
        `Marked as created via MCP. ${BASE_URL_NOTE}`,
      inputSchema: {
        companyId: z.string(),
        channel: z.string().min(1).describe("How the contact happened: samtal | mail | sms | övrigt"),
        content: z.string().min(1).max(4000),
      },
    },
    async (args) => {
      const result = await addNote(args, { db: opts?.db });
      if (result.ok === false) return errorContent(result.message);
      return jsonContent({ ...result.row, crmUrl: crmRoute.company(args.companyId) });
    },
  );

  server.registerTool(
    "crm_add_property_note",
    {
      title: "Add property note",
      description:
        "Log a landlord-contact note on a property (objekt) — e.g. a call with the owner " +
        `(uthyrare). Marked as created via MCP. ${BASE_URL_NOTE}`,
      inputSchema: {
        propertyId: z.string(),
        channel: z.string().min(1).describe("How the contact happened: samtal | mail | sms | övrigt"),
        content: z.string().min(1).max(4000),
      },
    },
    async (args) => {
      const result = await addPropertyNote(args, { db: opts?.db });
      if (result.ok === false) return errorContent(result.message);
      return jsonContent({ ...result.row, crmUrl: crmRoute.property(args.propertyId) });
    },
  );

  server.registerTool(
    "crm_set_follow_up",
    {
      title: "Set follow-up",
      description:
        "Set the follow-up date (återkomst) on a company (kund) or owner (uthyrare) so it " +
        `appears in the follow-up queue on that day. ${BASE_URL_NOTE}`,
      inputSchema: {
        entity: z.enum(["company", "owner"]),
        id: z.string(),
        date: z.string().regex(YMD).describe("YYYY-MM-DD (Swedish calendar day)"),
        time: z.string().regex(HM).optional().describe("HH:MM — companies only, sorts within the day"),
        reason: z.string().max(500).optional().describe("Why we should follow up"),
      },
    },
    async (args) => {
      const result = await setFollowUp(args, { db: opts?.db });
      if (result.ok === false) return errorContent(result.message);
      const crmUrl = args.entity === "company" ? crmRoute.company(args.id) : crmRoute.owner(args.id);
      return jsonContent({ ...result.row, crmUrl });
    },
  );

  server.registerTool(
    "crm_update_request_status",
    {
      title: "Update request status",
      description:
        "Move a request (förfrågan) between non-terminal statuses. Terminal statuses " +
        "(lost/archived) and deletes are intentionally NOT available via MCP — those are " +
        `done by a human in the CRM UI. ${BASE_URL_NOTE}`,
      inputSchema: {
        id: z.string().describe("Request id"),
        status: z.enum(["incoming", "matching", "won", "invoiced"]),
      },
    },
    async ({ id, status }) => {
      const result = await applyRequestUpdate(id, { status }, { db: opts?.db });
      if (result.ok === false) return errorContent(`${result.body.error}${result.body.message ? `: ${result.body.message}` : ""}`);
      return jsonContent({ ...result.row, crmUrl: crmRoute.company(result.row.companyId) });
    },
  );

  server.registerTool(
    "crm_draft_message",
    {
      title: "Draft an SMS/iMessage",
      description:
        "Create a message DRAFT in the outbox. Nothing is sent: drafts wait in the Utkast " +
        "panel until a human approves them. Use owner/contact phone numbers from the CRM.",
      inputSchema: {
        toPhone: z.string().describe("Recipient phone (Swedish numbers normalized to E.164)"),
        body: z.string().min(1).max(MAX_SMS_CHARS),
        ownerId: z.string().optional().describe("Link the draft to an owner (uthyrare)"),
        contactId: z.string().optional().describe("Link the draft to a company contact"),
      },
    },
    async (args) => {
      const result = await draftMessage(args, { db: opts?.db });
      if (result.ok === false) return errorContent(result.message);
      return jsonContent(result.row);
    },
  );
}
