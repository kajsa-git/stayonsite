import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { emailHistory, sendAgentEmail } from "../agent-email";
import { GmailAuthError } from "../gmail";
import { crmRoute, errorContent, jsonContent, truncate, type DB } from "./shape";

export function registerEmailReadTools(server: McpServer, opts?: { db?: DB }) {
  server.registerTool(
    "crm_email_history",
    {
      title: "Email history",
      description:
        "The latest emails (in and out) with a contact, landlord (uthyrare) or company, newest first. " +
        "Use gmailThreadId to reply in the same thread with crm_send_email.",
      inputSchema: {
        contactId: z.string().optional(),
        ownerId: z.string().optional(),
        companyId: z.string().optional(),
        limit: z.number().int().min(1).max(30).optional().describe("Max emails, default 10"),
      },
    },
    async (args) => {
      const rows = await emailHistory(args, { db: opts?.db });
      if (!rows) return errorContent("Ange contactId, ownerId eller companyId.");
      return jsonContent(rows.map((r) => ({ ...r, body: truncate(r.body, 1500) })));
    },
  );
}

export function registerEmailWriteTools(server: McpServer, opts?: { db?: DB }) {
  server.registerTool(
    "crm_send_email",
    {
      title: "Send an email from Kajsa's Gmail",
      description:
        "Sends a plain-text email from kajsa@stayonsite.se to a contact or landlord that exists in the CRM. " +
        "The address is taken from the CRM record, never from input. Give exactly one of contactId or ownerId. " +
        "Pass threadId (gmailThreadId from crm_email_history) to reply in an existing thread with that recipient. " +
        "The email is logged in the CRM. An identical email to the same recipient within 15 minutes is not sent twice. " +
        "This SENDS immediately: only call it after Kajsa has approved the exact text.",
      inputSchema: {
        contactId: z.string().optional().describe("Recipient: company contact id"),
        ownerId: z.string().optional().describe("Recipient: landlord (uthyrare) id"),
        subject: z.string().min(1).max(200),
        body: z.string().min(1).max(8000).describe("Plain text, including greeting and signature"),
        threadId: z.string().optional().describe("Reply in this Gmail thread"),
        requestId: z.string().optional().describe("Link the email to a request (förfrågan)"),
      },
    },
    async (args) => {
      try {
        const result = await sendAgentEmail(args, { db: opts?.db });
        if (result.ok === false) return errorContent(result.message);
        const crmUrl = result.ownerId ? crmRoute.owner(result.ownerId) : result.companyId ? crmRoute.company(result.companyId) : null;
        return jsonContent({ ...result, crmUrl });
      } catch (error) {
        if (error instanceof GmailAuthError) return errorContent(`Gmail-kopplingen behöver loggas in igen i CRM:et: ${error.message}`);
        return errorContent(`Mejlet kunde inte skickas: ${truncate(error instanceof Error ? error.message : String(error), 200)}`);
      }
    },
  );
}
