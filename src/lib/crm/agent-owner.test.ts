import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createAgentOwner, buildOwnerNotes } from "./agent-owner";
import { ownerSearchCities } from "./owner-search-leads";
import { owners } from "./schema";
import { createTestDb, type TestDB } from "./test-db";

let db: TestDB;
let cleanup: () => void;
const deps = () => ({ db, indexOwner: async () => {}, now: () => new Date("2026-11-18T10:00:00Z") });

beforeEach(async () => {
  ({ db, cleanup } = await createTestDb("crm-agent-owner"));
  await db.insert(owners).values([{ id: "o1", name: "Anna Hyr", phone: "+46701234567", email: "anna@hyr.se" }]);
});
afterEach(() => cleanup());

describe("createAgentOwner", () => {
  it("skapar en uthyrare med källa, erbjudande och sökorter som matchningen hittar", async () => {
    const res = await createAgentOwner(
      { name: "Bertil Berg", phone: "070-111 22 33", source: "Facebook: Lägenheter i Gävle", offer: "Villa, 4 bäddar, möblerad", searchCities: ["Gävle", "Sandviken"] },
      deps(),
    );
    expect(res.status).toBe("created");
    const [row] = await db.select().from(owners).where((await import("drizzle-orm")).eq(owners.name, "Bertil Berg"));
    expect(row.phone).toBe("+46701112233");
    expect(row.notes).toContain("Källa: Facebook: Lägenheter i Gävle (via agenten 2026-11-18)");
    expect(ownerSearchCities(row.notes)).toEqual(["Gävle", "Sandviken"]);
  });

  it("skapar ingen dubblett när telefon eller mejl redan finns", async () => {
    const viaTelefon = await createAgentOwner({ name: "Anna", phone: "0701234567", source: "Facebook" }, deps());
    expect(viaTelefon).toMatchObject({ status: "exists", matchedOn: "phone", owner: { id: "o1" } });
    const viaMejl = await createAgentOwner({ name: "Anna", email: "ANNA@hyr.se", source: "Facebook" }, deps());
    expect(viaMejl).toMatchObject({ status: "exists", matchedOn: "email" });
    expect((await db.select().from(owners)).length).toBe(1);
  });

  it("frågar vid samma namn, och skapar bara med createAnyway", async () => {
    const forsta = await createAgentOwner({ name: "anna hyr", source: "Facebook" }, deps());
    expect(forsta.status).toBe("possible_duplicates");
    const andra = await createAgentOwner({ name: "anna hyr", source: "Facebook", createAnyway: true }, deps());
    expect(andra.status).toBe("created");
  });

  it("kräver namn och källa och ett riktigt datum", async () => {
    expect((await createAgentOwner({ name: " ", source: "x" }, deps())).status).toBe("invalid");
    expect((await createAgentOwner({ name: "X", source: "" }, deps())).status).toBe("invalid");
    expect((await createAgentOwner({ name: "X", source: "y", followUpDate: "imorgon" }, deps())).status).toBe("invalid");
  });

  it("bygger anteckningen utan tomma rader", () => {
    expect(buildOwnerNotes({ source: "Facebook" }, "2026-11-18")).toBe("Källa: Facebook (via agenten 2026-11-18)");
  });
});
