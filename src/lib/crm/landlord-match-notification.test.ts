import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import { GmailAuthError } from "./gmail";
import { createMatchWithLandlordNotification } from "./landlord-match-notification";
import { companies, emails, matchEvents, matches, outboxMessages, owners, properties, requests } from "./schema";
import { createTestDb, type TestDB } from "./test-db";

let db: TestDB;
let cleanup: () => void;
const input = { requestId: "request", propertyId: "house" };
type Mail = { to: string; subject: string; text: string };

beforeEach(async () => {
  ({ db, cleanup } = await createTestDb("landlord-match"));
  await db.insert(companies).values({ id: "company", name: "Hemligt företag" });
  await db.insert(owners).values({ id: "owner", name: "Anna Andersson", phone: "0701234567", email: "anna@example.test" });
  await db.insert(properties).values({ id: "house", ownerId: "owner", address: "Storgatan 1", city: "Boden" });
  await db.insert(requests).values({
    id: "request", companyId: "company", city: "Boden", startDate: "2026-12-01", projectDurationMonths: 6,
    bedsFrom: 4, bedsTo: 4, landlordBedroomPreference: "separate", landlordParkingPreference: "yes",
    landlordOtherWishes: "Nära arbetsplatsen", notes: "Hemligt internt pris och kundnamn",
  });
});
afterEach(() => cleanup());

describe("notification when a property is matched", () => {
  it("uses the owner's approved texts and the company's shareable requirements, then logs both channels", async () => {
    const sendEmail = vi.fn(async (_message: Mail) => ({ authorId: "user", messageId: "gmail-message", threadId: "gmail-thread" }));
    const result = await createMatchWithLandlordNotification(input, { db, sendEmail });
    expect(result.landlordNotification).toEqual({ sms: "queued", email: "sent" });
    expect(sendEmail).toHaveBeenCalledTimes(1);
    const mail = sendEmail.mock.calls[0][0];
    expect(mail).toMatchObject({ to: "anna@example.test", subject: "Företagskund matchad – se förfrågan 🏡" });
    expect(mail.text).toContain("Hej Anna!");
    expect(mail.text).toContain("Önskad inflyttning: 2026-12-01");
    expect(mail.text).toContain("Projekttid: ca 6 månader");
    expect(mail.text).toContain("Behov: 4 bäddar, separata sovrum");
    expect(mail.text).toContain("Önskar parkering: ja");
    expect(mail.text).toContain("Övriga önskemål: Nära arbetsplatsen");
    expect(mail.text).toContain("Vill både du och företaget gå vidare är nästa steg att skriva kontrakt.");
    expect(mail.text).not.toContain("Hemligt");
    const [sms] = await db.select().from(outboxMessages);
    expect(sms).toMatchObject({ ownerId: "owner", toPhone: "+46701234567", status: "queued", source: "landlord_match" });
    expect(sms.body).toContain("Vi har en potentiell matchning i Boden");
    expect(sms.body).toContain("Önskar parkering: ja");
    expect(sms.body).not.toContain("Hemligt");
    expect(sms.body).toContain("Kajsa, HyrUtSmart - en del av StayOnSite");
    expect(await db.select().from(emails)).toHaveLength(1);
    const [event] = await db.select().from(matchEvents);
    expect(event.data?.emailStatus).toBe("sent");
  });

  it("does not treat missing information or a legacy unchecked parking flag as a no", async () => {
    await db.update(requests).set({ bedsFrom: null, bedsTo: null, startDate: null, projectDurationMonths: null,
      parkingRequired: false, landlordParkingPreference: null, landlordBedroomPreference: null, landlordOtherWishes: null,
    }).where(eq(requests.id, input.requestId));
    const sendEmail = vi.fn(async (_message: Mail) => ({ authorId: "user", messageId: "msg", threadId: "thread" }));
    await createMatchWithLandlordNotification(input, { db, sendEmail });
    const text = sendEmail.mock.calls[0][0].text;
    expect(text).toContain("Önskad inflyttning: inte angiven");
    expect(text).toContain("Projekttid: inte angiven");
    expect(text).toContain("antal bäddar inte angivet");
    expect(text).toContain("önskemål om sovrum inte angivet");
    expect(text).toContain("Önskar parkering: inte angivet");
    expect(text).not.toContain("Övriga önskemål:");
  });

  it("can describe the project in weeks without duplicating the approximation", async () => {
    await db.update(requests).set({ landlordProjectDuration: "ca 3 veckor" }).where(eq(requests.id, input.requestId));
    const sendEmail = vi.fn(async (_message: Mail) => ({ authorId: "user", messageId: "msg", threadId: "thread" }));
    await createMatchWithLandlordNotification(input, { db, sendEmail });
    expect(sendEmail.mock.calls[0][0].text).toContain("Projekttid: ca 3 veckor");
    expect((await db.select().from(outboxMessages))[0].body).toContain("Projekttid: ca 3 veckor");
  });

  it("never sends or queues a duplicate when an existing match is retried", async () => {
    const sendEmail = vi.fn(async () => ({ authorId: "user", messageId: "msg", threadId: "thread" }));
    await createMatchWithLandlordNotification(input, { db, sendEmail });
    await expect(createMatchWithLandlordNotification(input, { db, sendEmail })).rejects.toMatchObject({ status: 409 });
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(await db.select().from(outboxMessages)).toHaveLength(1);
    expect(await db.select().from(matches)).toHaveLength(1);
  });

  it("allows only one notification when the same match is created concurrently", async () => {
    const sendEmail = vi.fn(async (_message: Mail) => ({ authorId: "user", messageId: "msg", threadId: "thread" }));
    const results = await Promise.allSettled([
      createMatchWithLandlordNotification(input, { db, sendEmail }),
      createMatchWithLandlordNotification(input, { db, sendEmail }),
    ]);
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(await db.select().from(matches)).toHaveLength(1);
    expect(await db.select().from(outboxMessages)).toHaveLength(1);
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });

  it("records missing contact information without sending to invented recipients", async () => {
    await db.update(owners).set({ phone: null, email: null }).where(eq(owners.id, "owner"));
    const sendEmail = vi.fn();
    const result = await createMatchWithLandlordNotification(input, { db, sendEmail });
    expect(result.landlordNotification).toEqual({ sms: "missing_phone", email: "missing_email" });
    expect(sendEmail).not.toHaveBeenCalled();
    expect(await db.select().from(outboxMessages)).toHaveLength(0);
  });

  it("surfaces authentication failure and keeps the independently queued sms", async () => {
    const sendEmail = vi.fn(async () => { throw new GmailAuthError("no account"); });
    const result = await createMatchWithLandlordNotification(input, { db, sendEmail });
    expect(result.landlordNotification).toEqual({ sms: "queued", email: "failed" });
    expect((await db.select().from(outboxMessages))[0].status).toBe("queued");
    expect((await db.select().from(matchEvents))[0].data?.emailStatus).toBe("failed");
    expect(await db.select().from(emails)).toHaveLength(0);
  });

  it("marks an uncertain mail delivery for manual checking instead of retrying it", async () => {
    const sendEmail = vi.fn(async () => { throw new Error("connection interrupted"); });
    const result = await createMatchWithLandlordNotification(input, { db, sendEmail });
    expect(result.landlordNotification.email).toBe("unknown");
    await expect(createMatchWithLandlordNotification(input, { db, sendEmail })).rejects.toMatchObject({ status: 409 });
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });
});
