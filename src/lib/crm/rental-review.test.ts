import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { createTestDb, type TestDB } from "./test-db";
import { companies, ownerOutreach, owners, outboxMessages, properties, rentalReviews, requests } from "./schema";
import { addDaysYmd, todayStockholm } from "./date";
import { addMonthsYmd, isRentalReviewDue } from "./rental-review-date";
import { dueRentalReviews, initialRentalReview } from "./rental-review";
import { computeQueueCounts } from "./queue-counts";

const state = vi.hoisted(() => ({ db: null as unknown as TestDB }));
vi.mock("./db", () => ({ get db() { return state.db; } }));
vi.mock("./auth", () => ({ requireApprovedSession: vi.fn(async () => ({ user: { email: "test@example.com" } })) }));
vi.mock("./search-index", () => ({ indexProperty: vi.fn(async () => {}), indexOwner: vi.fn(async () => {}), indexRequest: vi.fn(async () => {}) }));
vi.mock("./schedule-property-review", () => ({ schedulePropertyReview: vi.fn() }));
import { GET as listProperties, POST as createProperty } from "../../../app/api/crm/properties/route";
import { PATCH as patchProperty } from "../../../app/api/crm/properties/[id]/route";
import { POST as postponeReview } from "../../../app/api/crm/properties/[id]/rental-review/route";
import { GET as getQueues } from "../../../app/api/crm/queues/route";
import { applyRequestUpdate } from "./request-update";

let cleanup: () => void;
const context = (id = "p1") => ({ params: Promise.resolve({ id }) });
const req = (body: unknown, method = "PATCH") => new NextRequest("http://localhost/api/crm/properties", {
  method, body: JSON.stringify(body), headers: { "Content-Type": "application/json" },
});

beforeEach(async () => {
  const setup = await createTestDb("rental-review"); state.db = setup.db; cleanup = setup.cleanup;
  await state.db.insert(owners).values({ id: "o1", name: "Lisa", followUpDate: "2026-11-04" });
  await state.db.insert(properties).values([
    { id: "p1", ownerId: "o1", address: "Lilla huset", city: "Boden", status: "available", moveInFrom: "2020-10-01" },
    { id: "p2", ownerId: "o1", address: "Stora huset", city: "Boden", status: "available" },
  ]);
  await state.db.insert(ownerOutreach).values({ id: "outreach", propertyId: "p2", ownerId: "o1", nextFollowUpDate: "2026-11-04", nextFollowUpReason: "Stora huset" });
});
afterEach(() => cleanup());

describe("uppföljning av uthyrda bostäder", () => {
  it("använder kalendermånader och bara aktuella uttryckliga datum", () => {
    expect(addMonthsYmd("2026-12-31", 2)).toBe("2027-02-28");
    expect(addMonthsYmd("2027-12-31", 2)).toBe("2028-02-29");
    expect(initialRentalReview("2026-11-03", "2026-10-01").checkOn).toBe("2027-01-03");
    expect(initialRentalReview("2026-11-03", "2027-05-14")).toMatchObject({ checkOn: "2027-05-14", source: "specified" });
    expect(initialRentalReview("2026-11-03", "2026-11-03").checkOn).toBe("2026-11-03");
    expect(initialRentalReview("2026-11-03", "2026-11-99").checkOn).toBe("2027-01-03");
  });

  it("lägger en kontroll vid statusändring, utan att röra andra återkomster eller skicka meddelanden", async () => {
    const today = todayStockholm();
    const response = await patchProperty(req({ status: "rented" }), context());
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ status: "rented", rentalReviewCheckOn: addMonthsYmd(today, 2) });
    expect((await state.db.select().from(rentalReviews))[0]).toMatchObject({ propertyId: "p1", rentedSince: today, checkOn: addMonthsYmd(today, 2) });
    expect((await state.db.select().from(owners))[0].followUpDate).toBe("2026-11-04");
    expect((await state.db.select().from(ownerOutreach))[0]).toMatchObject({ propertyId: "p2", nextFollowUpReason: "Stora huset" });
    expect(await state.db.select().from(outboxMessages)).toHaveLength(0);
    expect(await dueRentalReviews(state.db, today)).toHaveLength(0);
    expect((await dueRentalReviews(state.db, addMonthsYmd(today, 2))).map((r) => r.propertyId)).toEqual(["p1"]);
  });

  it("respekterar nytt ledigdatum, återställer till två månader om det tas bort och startar inte om vid sparning", async () => {
    const today = todayStockholm();
    await patchProperty(req({ status: "rented" }), context());
    const specific = addDaysYmd(today, 120);
    await patchProperty(req({ status: "rented", moveInFrom: specific }), context());
    expect((await state.db.select().from(rentalReviews))[0]).toMatchObject({ checkOn: specific, source: "specified" });
    await state.db.update(rentalReviews).set({ checkOn: addDaysYmd(today, 7), source: "postponed" });
    await patchProperty(req({ status: "rented", moveInFrom: specific, notes: "Ny anteckning" }), context());
    expect((await state.db.select().from(rentalReviews))[0]).toMatchObject({ checkOn: addDaysYmd(today, 7), source: "postponed" });
    await patchProperty(req({ moveInFrom: null }), context());
    expect((await state.db.select().from(rentalReviews))[0]).toMatchObject({ checkOn: addMonthsYmd(today, 2), source: "two_months" });
  });

  it("skapar separat kontroll även för en ny bostad som registreras som uthyrd", async () => {
    const today = todayStockholm();
    const explicit = addDaysYmd(today, 180);
    const response = await createProperty(req({ address: "Ny gata 1", postalCode: "961 00", status: "rented", moveInFrom: explicit }, "POST"));
    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({ status: "rented", rentalReviewCheckOn: explicit });
  });

  it("visar förfallen kontroll i listor och Min dag, utan att kalla bostaden ledig; uppskov påverkar bara kontrollen", async () => {
    const today = todayStockholm();
    await patchProperty(req({ status: "rented" }), context());
    await state.db.update(rentalReviews).set({ checkOn: today });
    const list = await (await listProperties(new NextRequest("http://localhost/api/crm/properties"))).json();
    const property = list.find((p: { id: string }) => p.id === "p1");
    expect(property).toMatchObject({ status: "rented", rentalReviewCheckOn: today });
    expect(isRentalReviewDue(property, today)).toBe(true);
    const queues = await (await getQueues()).json();
    expect(queues.rentalReviews).toEqual([expect.objectContaining({ propertyId: "p1", source: "rentalReview" })]);
    const counts = await computeQueueCounts({ db: state.db, today });
    expect(counts.chaseLandlords).toBe(queues.chaseLandlords.length + queues.rentalReviews.length);
    const response = await postponeReview(req({ action: "snooze2months" }, "POST"), context());
    expect(await response.json()).toMatchObject({ checkOn: addMonthsYmd(today, 2) });
    expect((await state.db.select().from(properties).where(eq(properties.id, "p1")))[0].status).toBe("rented");
    expect((await state.db.select().from(owners))[0].followUpDate).toBe("2026-11-04");
    expect((await state.db.select().from(ownerOutreach))[0].nextFollowUpDate).toBe("2026-11-04");
    expect(await dueRentalReviews(state.db, today)).toHaveLength(0);
    expect(await state.db.select().from(outboxMessages)).toHaveLength(0);
  });

  it("stoppar kontrollen när status ändras, och startar ny kontroll vid en ny uthyrning", async () => {
    await patchProperty(req({ status: "rented" }), context());
    await state.db.update(rentalReviews).set({ checkOn: "2000-01-01" });
    await patchProperty(req({ status: "available" }), context());
    expect(await dueRentalReviews(state.db, todayStockholm())).toHaveLength(0);
    expect((await postponeReview(req({ action: "snooze7" }, "POST"), context())).status).toBe(404);
    await patchProperty(req({ status: "rented" }), context());
    expect((await state.db.select().from(rentalReviews))[0].checkOn).toBe(addMonthsYmd(todayStockholm(), 2));
  });

  it("kan planera kontroll för en redan uthyrd bostad, utan att en upprepning flyttar kontrollen", async () => {
    const today = todayStockholm();
    await state.db.update(properties).set({ status: "rented" }).where(eq(properties.id, "p1"));
    const first = await postponeReview(req({ action: "start" }, "POST"), context());
    expect(await first.json()).toMatchObject({ checkOn: addMonthsYmd(today, 2) });
    await state.db.update(rentalReviews).set({ checkOn: addDaysYmd(today, 7), source: "postponed" });
    const again = await postponeReview(req({ action: "start" }, "POST"), context());
    expect(await again.json()).toMatchObject({ checkOn: addDaysYmd(today, 7) });
    expect((await state.db.select().from(ownerOutreach))[0].nextFollowUpDate).toBe("2026-11-04");
    expect(await state.db.select().from(outboxMessages)).toHaveLength(0);
  });

  it("planerar även när fakturering markerar bostaden som uthyrd, utan att senare fakturering startar om kontrollen", async () => {
    await state.db.insert(companies).values({ id: "c1", name: "Företag" });
    await state.db.insert(requests).values({ id: "r1", companyId: "c1", wonPropertyId: "p1", status: "won", startDate: "2026-11-01", endDateOngoing: true, moveInChecklist: ["contract"] });
    const opts = { db: state.db, indexRequest: async () => {}, indexProperty: async () => {}, revokeLinksForRequest: async () => {} };
    expect((await applyRequestUpdate("r1", { status: "invoiced" }, opts)).ok).toBe(true);
    expect((await state.db.select().from(properties).where(eq(properties.id, "p1")))[0].status).toBe("rented");
    await state.db.update(rentalReviews).set({ checkOn: "2030-01-01", source: "postponed" });
    await applyRequestUpdate("r1", { status: "invoiced" }, opts);
    expect((await state.db.select().from(rentalReviews))[0]).toMatchObject({ checkOn: "2030-01-01", source: "postponed" });
  });
});
