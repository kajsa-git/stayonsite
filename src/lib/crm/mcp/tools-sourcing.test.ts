import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { companies, matches, owners, properties, requests } from "../schema";
import { createTestDb, type TestDB } from "../test-db";
import { ownerLeadsForCity, registerSourcingTools, requestMatches } from "./tools-sourcing";

let db: TestDB;
let cleanup: () => void;

beforeEach(async () => {
  ({ db, cleanup } = await createTestDb("crm-sourcing"));
  await db.insert(companies).values([{ id: "c1", name: "BS Logistics" }]);
  await db.insert(requests).values([
    { id: "r1", companyId: "c1", city: "Gävle", persons: 4, bedsFrom: 4, startDate: "2027-03-01", endDate: "2027-06-01" },
  ]);
  await db.insert(owners).values([
    { id: "o1", name: "Anna Hyr", phone: "+46701234567", notes: "Sökorter: Gävle, Sandviken" },
    { id: "o2", name: "Bertil", notes: "Sökorter: Luleå" },
    { id: "o3", name: "Cecilia", notes: "Har hus i Gävle men ingen sökort-rad" },
  ]);
  await db.insert(properties).values([
    { id: "p-gavle", address: "Storgatan 1", city: "Gävle", beds: 4, status: "available", ownerId: "o1" },
    { id: "p-gavle-rented", address: "Lillgatan 2", city: "Gävle", beds: 4, status: "rented" },
    { id: "p-sundsvall", address: "Esplanaden 3", city: "Sundsvall", beds: 2, status: "available" },
  ]);
  await db.insert(matches).values([{ id: "m1", requestId: "r1", propertyId: "p-gavle", status: "sent" }]);
});

afterEach(() => cleanup());

describe("requestMatches", () => {
  it("rankar objekt i förfrågans ort först och hoppar över uthyrda", async () => {
    const result = await requestMatches(db, "r1");
    expect(result).not.toBeNull();
    const ids = result!.properties.map((p) => p.propertyId);
    expect(ids[0]).toBe("p-gavle");
    expect(ids).not.toContain("p-gavle-rented");
    expect(result!.properties[0].alreadySuggested).toBe("sent");
    expect(result!.properties[0].ownerName).toBe("Anna Hyr");
    expect(result!.request.company).toBe("BS Logistics");
  });

  it("tar med uthyrda objekt bara när det efterfrågas", async () => {
    const result = await requestMatches(db, "r1", { includeInactive: true });
    expect(result!.properties.map((p) => p.propertyId)).toContain("p-gavle-rented");
  });

  it("ger null för en okänd förfrågan", async () => {
    expect(await requestMatches(db, "saknas")).toBeNull();
  });
});

describe("ownerLeadsForCity", () => {
  it("hittar bara uthyrare som har orten under Sökorter", async () => {
    const leads = await ownerLeadsForCity(db, "Gävle");
    expect(leads.map((l) => l.id)).toEqual(["o1"]);
  });
});

describe("registerSourcingTools", () => {
  type Registry = Record<string, { handler: (args: unknown, extra: unknown) => Promise<{ content: { text: string }[]; isError?: boolean }> }>;
  const tools = () => {
    const server = new McpServer({ name: "test", version: "0.0.0" });
    registerSourcingTools(server, { db });
    return (server as unknown as { _registeredTools: Registry })._registeredTools;
  };

  it("svarar med fel, inte undantag, för en okänd förfrågan", async () => {
    const t = tools();
    for (const name of ["crm_request_matches", "qasa_search_for_request"]) {
      const res = await t[name].handler({ requestId: "saknas" }, {});
      expect(res.isError, name).toBe(true);
    }
  });

  it("crm_owner_search_leads tar orten från förfrågan", async () => {
    const res = await tools().crm_owner_search_leads.handler({ requestId: "r1" }, {});
    const body = JSON.parse(res.content[0].text);
    expect(body.city).toBe("Gävle");
    expect(body.owners.map((o: { id: string }) => o.id)).toEqual(["o1"]);
  });
});
