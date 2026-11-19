import { eq } from "drizzle-orm";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { notifyAgentPropertyIntake } from "./agent-notify";
import { propertyContentHash } from "./property-content-policy";
import { getPropertyIntakeFollowUp, runPropertyIntakeFollowUpSweep, startPropertyIntakeFollowUp } from "./property-intake-follow-up";
import { outboxMessages, ownerOutreach, owners, properties, propertyImages, propertyNotes } from "./schema";
import { createTestDb, type TestDB } from "./test-db";

let db: TestDB;
let cleanup: () => void;
const start = new Date("2026-11-19T10:00:00Z");
const date = (minutes: number) => new Date(start.getTime() + minutes * 60_000);

beforeEach(async () => {
  ({ db, cleanup } = await createTestDb("intake-follow-up"));
  await db.insert(owners).values({ id: "owner", name: "Exempel", phone: "+46700000001" });
  await db.insert(properties).values({
    id: "home", ownerId: "owner", address: "Testvägen 2", postalCode: "12345", city: "Testort",
    bedrooms: 0, beds: 2, egetBoende: true, status: "available", autoPublishEnabled: false,
  });
  await db.insert(ownerOutreach).values({ id: "outreach", propertyId: "home", ownerId: "owner", status: "i_dialog" });
  await db.transaction((tx) => startPropertyIntakeFollowUp(tx, "home", "hus", { now: start, web: true }));
});
afterEach(() => cleanup());

it("follows a property through a logged reply, pictures and content approval without closing the landlord dialogue", async () => {
  const notify = vi.fn<typeof notifyAgentPropertyIntake>().mockResolvedValue("sent");
  expect((await runPropertyIntakeFollowUpSweep({ db, now: date(14), notify })).checked).toBe(0);
  await runPropertyIntakeFollowUpSweep({ db, now: date(15), notify });
  expect(await getPropertyIntakeFollowUp("home", db)).toMatchObject({
    source: "hus", status: "waiting", nextFollowUpOn: "2026-11-20",
    missing: ["Tillgänglighet för kommande uthyrning", "Bostadsbilder"],
  });

  await db.insert(propertyNotes).values({
    id: "reply", propertyId: "home", channel: "sms", source: "landlord_agent",
    content: "Ledig efter nyår", createdAt: date(17).toISOString(),
  });
  await db.update(properties).set({ moveInFrom: "2027-01-01" }).where(eq(properties.id, "home"));
  await runPropertyIntakeFollowUpSweep({ db, now: date(20), notify });
  expect(notify).toHaveBeenLastCalledWith("home", expect.objectContaining({ kind: "reply" }));
  expect((await getPropertyIntakeFollowUp("home", db))?.missing).toEqual(["Bostadsbilder"]);

  const picture = { id: "picture", key: "properties/home/kitchen.jpg" };
  await db.insert(propertyImages).values({ ...picture, propertyId: "home" });
  await runPropertyIntakeFollowUpSweep({ db, now: date(25), notify });
  expect((await getPropertyIntakeFollowUp("home", db))?.missing).toEqual(["Inväntar kontroll av text och bilder"]);
  const [property] = await db.select().from(properties).where(eq(properties.id, "home"));
  await db.update(properties).set({
    contentReviewStatus: "approved", contentReviewHash: propertyContentHash(property, [picture]),
  }).where(eq(properties.id, "home"));
  await runPropertyIntakeFollowUpSweep({ db, now: date(30), notify });
  expect(await getPropertyIntakeFollowUp("home", db)).toMatchObject({ status: "ready", nextFollowUpOn: null, missing: [] });

  expect((await runPropertyIntakeFollowUpSweep({ db, now: date(40), notify })).checked).toBe(0);
  expect((await db.select().from(ownerOutreach))[0].status).toBe("i_dialog");
  expect(await db.select().from(outboxMessages)).toEqual([]);
  expect((await db.select().from(properties))[0].published).toBe(false);
});

it("retries the saved notification after an outage and sends one reminder on the follow-up date", async () => {
  const notify = vi.fn<typeof notifyAgentPropertyIntake>().mockResolvedValue("sent").mockResolvedValueOnce("failed");
  await Promise.all([
    runPropertyIntakeFollowUpSweep({ db, now: date(15), notify }),
    runPropertyIntakeFollowUpSweep({ db, now: date(15), notify }),
  ]);
  expect(notify).toHaveBeenCalledTimes(1);
  expect((await runPropertyIntakeFollowUpSweep({ db, now: date(20), notify })).sent).toBe(1);
  expect(notify.mock.calls[1]).toEqual(notify.mock.calls[0]);
  await runPropertyIntakeFollowUpSweep({ db, now: date(25), notify });
  expect(notify).toHaveBeenCalledTimes(2);

  await runPropertyIntakeFollowUpSweep({ db, now: date(24 * 60), notify });
  expect(notify).toHaveBeenLastCalledWith("home", expect.objectContaining({ kind: "due" }));
  await runPropertyIntakeFollowUpSweep({ db, now: date(24 * 60 + 5), notify });
  expect(notify).toHaveBeenCalledTimes(3);
  expect((await getPropertyIntakeFollowUp("home", db))?.nextFollowUpOn).toBe("2026-11-20");
});
