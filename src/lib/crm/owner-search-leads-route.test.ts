import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb, type TestDB } from "./test-db";
import { owners } from "./schema";

const state = vi.hoisted(() => ({ db: null as unknown as TestDB, approved: true }));
vi.mock("./db", () => ({ get db() { return state.db; } }));
vi.mock("@/lib/crm/auth", () => ({ requireApprovedSession: async () => state.approved ? { user: { id: "kajsa" } } : null }));
import { GET } from "../../../app/api/crm/owner-search-leads/route";

let cleanup: () => void;
beforeEach(async () => {
  ({ db: state.db, cleanup } = await createTestDb("owner-search-leads"));
  state.approved = true;
  await state.db.insert(owners).values([
    { id: "daniel", name: "GM Invest AB", contactPerson: "Daniel", phone: "+46766108808", notes: "Sökorter: Örebro, Knivsta, Uppsala.\nKreditlina: intern anteckning." },
    { id: "other", name: "Annan", notes: "Ingen bostad i Uppsala." },
  ]);
});
afterEach(() => cleanup());

describe("API för uthyrarkontakter i bostadssökning", () => {
  it("returnerar orter och kontaktuppgifter utan att lämna ut hela anteckningen", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([{ id: "daniel", name: "GM Invest AB", contactPerson: "Daniel", phone: "+46766108808", email: null, cities: ["Örebro", "Knivsta", "Uppsala"] }]);
  });

  it("kräver en godkänd session", async () => {
    state.approved = false;
    expect((await GET()).status).toBe(401);
  });
});
