import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { linkMessengerThread, logMessengerMessage, type MessengerThread } from "../messenger";
import { crmRoute, errorContent, jsonContent, type DB } from "./shape";

const medLankar = (t: MessengerThread) => ({
  ...t,
  ownerCrmUrl: t.ownerId ? crmRoute.owner(t.ownerId) : undefined,
});

export function registerMessengerWriteTools(server: McpServer, opts?: { db?: DB }) {
  server.registerTool(
    "crm_messenger_log",
    {
      title: "Log a Messenger message",
      description:
        "Logs a work-related Messenger message (read by Kajsa's Facebook computer) on its thread. Returns the thread " +
        "and, if the thread is linked, the landlord or contact it belongs to. The same eventKey is only logged once.",
      inputSchema: {
        url: z.string().min(10).max(300).describe("Messenger thread link, e.g. https://www.facebook.com/messages/t/123"),
        name: z.string().max(120).optional().describe("The person's name as shown in Messenger"),
        text: z.string().min(1).max(2000).describe("The latest message / preview"),
        detail: z.string().max(6000).optional().describe("The end of the conversation"),
        eventKey: z.string().min(4).max(100),
      },
    },
    async (args) => {
      const r = await logMessengerMessage(args, { db: opts?.db });
      if (r.status === "invalid") return errorContent(r.message);
      return jsonContent({ status: r.status, thread: medLankar(r.thread) });
    },
  );

  server.registerTool(
    "crm_messenger_link",
    {
      title: "Link a Messenger thread to a landlord or contact",
      description:
        "Links a Messenger thread to a landlord (ownerId) and/or contact (contactId) in the CRM, so later messages are " +
        "matched by the thread instead of the name and show up in the landlord's timeline. Only after Kajsa has " +
        "confirmed who it is.",
      inputSchema: {
        url: z.string().min(10).max(300),
        ownerId: z.string().optional(),
        contactId: z.string().optional(),
        name: z.string().max(120).optional(),
      },
    },
    async (args) => {
      const r = await linkMessengerThread(args, { db: opts?.db });
      if (r.status === "invalid") return errorContent(r.message);
      return jsonContent({ status: r.status, thread: medLankar(r.thread) });
    },
  );
}
