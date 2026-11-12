import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PUBLICATION_CONSENT_VERSION } from "./publication-consent-text";
import { HUS_UPLOAD_LINK_ACTOR } from "./hus-publication";
import * as schema from "./schema";
import { createTestDb, type TestDB } from "./test-db";

const state = vi.hoisted(() => ({ db: null as unknown as TestDB, session: true }));
vi.mock("./db", () => ({ get db() { return state.db; } }));
vi.mock("./auth", () => ({ requireApprovedSession: vi.fn(async () => state.session ? { user: { id: "kajsa" } } : null) }));
vi.mock("./schedule-property-review", () => ({ schedulePropertyReview: vi.fn() }));
import { POST as grantFromLink } from "../../../app/api/share/[token]/publish-consent/route";
import { POST as recordInCrm } from "../../../app/api/crm/properties/[id]/publication-consent/route";
import { DELETE as deleteNote } from "../../../app/api/crm/property-notes/[noteId]/route";

let cleanup: () => void;
beforeEach(async () => {
  ({ db: state.db, cleanup } = await createTestDb("publication-consent-routes"));
  state.session = true;
  await state.db.insert(schema.owners).values([{ id: "o1", name: "Anna" }, { id: "o2", name: "Berit" }]);
  await state.db.insert(schema.properties).values([
    { id: "p1", ownerId: "o1", published: false }, { id: "p2", ownerId: "o1", published: false },
    { id: "other", ownerId: "o2", published: false },
  ]);
  await state.db.insert(schema.shareLinks).values({ id: "l1", token: "owner-token", audience: "landlord", ownerId: "o1" });
});
afterEach(() => cleanup());

function web(body: object) {
  return grantFromLink(new NextRequest("http://localhost/test", { method: "POST", body: JSON.stringify(body) }), { params: Promise.resolve({ token: "owner-token" }) });
}
function crm(body: object, id = "p1") {
  return recordInCrm(new NextRequest("http://localhost/test", { method: "POST", body: JSON.stringify(body) }), { params: Promise.resolve({ id }) });
}

describe("publikationsflödets endpoints", () => {
  it("avvisar ett gammalt öppet formulär och en bostad som inte tillhör länken", async () => {
    expect((await web({ name: "Anna", propertyIds: ["p1"], version: "gammal" })).status).toBe(409);
    expect((await web({ name: "Anna", propertyIds: ["p1", "other"], version: PUBLICATION_CONSENT_VERSION })).status).toBe(404);
    expect((await state.db.select().from(schema.properties).where(eq(schema.properties.id, "p1")))[0].publishConsentAt).toBeNull();
  });

  it("sparar bara de valda bostäderna utan att registrera ett förmedlingsavtal", async () => {
    expect((await web({ name: "Anna", propertyIds: ["p1"], version: PUBLICATION_CONSENT_VERSION })).status).toBe(201);
    const rows = await state.db.select().from(schema.properties);
    expect(rows.find((p) => p.id === "p1")?.publishConsentAt).toBeTruthy();
    expect(rows.find((p) => p.id === "p2")?.publishConsentAt).toBeNull();
    expect((await state.db.select().from(schema.agreementAcceptances)).map((a) => a.agreementType)).toEqual(["publiceringsmedgivande"]);
  });

  it("låter uthyraren återkalla sin egen bostad men aldrig någon annans", async () => {
    await web({ name: "Anna", propertyIds: ["p1"], version: PUBLICATION_CONSENT_VERSION });
    await state.db.update(schema.properties).set({ published: true, prospektPublished: true }).where(eq(schema.properties.id, "p1"));
    expect((await web({ action: "withdraw", propertyIds: ["other"] })).status).toBe(404);
    expect((await web({ action: "withdraw", propertyIds: ["p1"] })).status).toBe(200);
    const [row] = await state.db.select().from(schema.properties).where(eq(schema.properties.id, "p1"));
    expect(row).toMatchObject({ published: false, prospektPublished: false, publishConsentAt: null, publishConsentSource: "withdrawn" });
    expect(await state.db.select().from(schema.propertyNotes)).toHaveLength(2);
  });

  it("hindrar en HUS-uppladdningslänk från att ändra publiceringsmedgivanden", async () => {
    await state.db.update(schema.shareLinks).set({ createdBy: HUS_UPLOAD_LINK_ACTOR }).where(eq(schema.shareLinks.id, "l1"));
    expect((await web({ name: "Anna", propertyIds: ["p1"], version: PUBLICATION_CONSENT_VERSION })).status).toBe(404);
    expect((await web({ action: "withdraw", propertyIds: ["p1"] })).status).toBe(404);
  });

  it("kräver session och faktiskt underlag när ett ja registreras manuellt", async () => {
    const input = { action: "grant", source: "chatt", name: "Anna", date: "2020-01-02", evidence: "Hon godkände webbpublicering i chatten." };
    state.session = false;
    expect((await crm(input)).status).toBe(401);
    state.session = true;
    expect((await crm({ ...input, evidence: "ja" })).status).toBe(400);
    expect((await crm(input)).status).toBe(201);
    const [note] = await state.db.select().from(schema.propertyNotes);
    expect(note).toMatchObject({ propertyId: "p1", source: "publication-consent", authorId: "kajsa" });
    expect(note.content).toContain(input.evidence);
    const deleted = await deleteNote(new NextRequest("http://localhost/test", { method: "DELETE" }), { params: Promise.resolve({ noteId: note.id }) });
    expect(deleted.status).toBe(409);
    expect(await state.db.select().from(schema.propertyNotes)).toHaveLength(1);
  });
});
