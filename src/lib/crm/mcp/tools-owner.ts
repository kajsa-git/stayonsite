import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createAgentOwner } from "../agent-owner";
import { crmRoute, errorContent, jsonContent, type DB } from "./shape";

export function registerOwnerWriteTools(server: McpServer, opts?: { db?: DB }) {
  server.registerTool(
    "crm_create_owner",
    {
      title: "Create a landlord (uthyrare) lead",
      description:
        "Creates a landlord (uthyrare) in the CRM, e.g. someone who answered a Facebook post. Does NOT create a " +
        "duplicate: if the phone or email already exists the existing landlord is returned (status exists); if the " +
        "same name exists you get possible_duplicates and must check them, then call again with createAnyway only if " +
        "it is a different person. The offer (place, rooms, beds, rent, period, furnished) and source are saved in the " +
        "notes; searchCities makes the landlord show up in matching for those cities.",
      inputSchema: {
        name: z.string().min(1).max(120),
        phone: z.string().max(40).optional(),
        email: z.string().max(200).optional(),
        ownerType: z.enum(["privatperson", "foretag"]).optional(),
        source: z.string().min(1).max(200).describe("Where the lead came from, e.g. 'Facebook: Lägenheter i Gävle'"),
        offer: z.string().max(1500).optional().describe("What they offer, in short Swedish"),
        searchCities: z.array(z.string().min(1).max(60)).max(5).optional(),
        followUpDate: z.string().optional().describe("YYYY-MM-DD"),
        followUpReason: z.string().max(300).optional(),
        createAnyway: z.boolean().optional(),
      },
    },
    async (args) => {
      const result = await createAgentOwner(args, { db: opts?.db });
      if (result.status === "invalid") return errorContent(result.message);
      if (result.status === "possible_duplicates") {
        return jsonContent({ ...result, candidates: result.candidates.map((c) => ({ ...c, crmUrl: crmRoute.owner(c.id) })) });
      }
      return jsonContent({ ...result, crmUrl: crmRoute.owner(result.owner.id) });
    },
  );
}
