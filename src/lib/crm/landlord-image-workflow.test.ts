import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb, type TestDB } from "./test-db";
import { landlordDialogs, landlordImageCandidates, landlordReplyRuns, owners, properties, propertyImages } from "./schema";

const state = vi.hoisted(() => ({ db: null as unknown as TestDB, send: vi.fn() }));
vi.mock("./db", () => ({ get db() { return state.db; } }));
vi.mock("./r2", () => ({ r2: { send: state.send }, R2_BUCKET: "test-bucket" }));
vi.mock("./gmail", () => ({ gmailAutomationUserId: vi.fn().mockResolvedValue("user"), gmailGetImageAttachment: vi.fn() }));
vi.mock("./landlord-image-classifier", () => ({ inspectLandlordImage: vi.fn() }));
vi.mock("./landlord-dialog-alerts", () => ({ sendLandlordImageReviewNotice: vi.fn() }));
vi.mock("./image-variants", () => ({ createImageVariants: vi.fn().mockResolvedValue({ thumbKey: null, displayKey: null }) }));

import { gmailGetImageAttachment } from "./gmail";
import { inspectLandlordImage } from "./landlord-image-classifier";
import { sendLandlordImageReviewNotice } from "./landlord-dialog-alerts";
import { runLandlordImageSweep } from "./landlord-image-workflow";

let cleanup: () => void;
beforeEach(async () => {
  ({ db: state.db, cleanup } = await createTestDb("landlord-image"));
  vi.clearAllMocks(); state.send.mockResolvedValue({ Contents: [] });
  vi.mocked(gmailGetImageAttachment).mockResolvedValue(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]));
  vi.mocked(inspectLandlordImage).mockResolvedValue({ decision: "accept", reason: "" });
  vi.mocked(sendLandlordImageReviewNotice).mockResolvedValue(undefined);
  await state.db.insert(owners).values({ id: "owner", name: "Anna", email: "anna@example.com" });
  await state.db.insert(properties).values({ id: "property", ownerId: "owner", autoPublishEnabled: false });
  await state.db.insert(landlordDialogs).values({ id: "dialog", ownerId: "owner", propertyId: "property", gmailThreadId: "thread", landlordEmail: "anna@example.com", enrolledAt: "2026-11-06T00:00:00Z", createdAt: "2026-11-06T00:00:00Z", updatedAt: "2026-11-06T00:00:00Z" });
  await state.db.insert(landlordReplyRuns).values({ gmailMessageId: "reply", dialogId: "dialog", status: "sent", createdAt: "2026-11-06T00:00:00Z", updatedAt: "2026-11-06T00:00:00Z" });
  await state.db.insert(landlordImageCandidates).values({ id: "image", propertyId: "property", gmailMessageId: "reply", replyRunId: "reply", attachmentId: "attachment", fileName: "rum.png", mimeType: "image/png", sizeBytes: 10000, status: "pending", createdAt: "2026-11-06T00:00:00Z", updatedAt: "2026-11-06T00:00:00Z" });
});
afterEach(() => cleanup());

describe("landlord image intake", () => {
  it("imports a suitable photo only into a property whose automatic publication is off", async () => {
    expect(await runLandlordImageSweep()).toMatchObject({ imported: 1 });
    expect((await state.db.select().from(propertyImages))[0]).toMatchObject({ propertyId: "property", isPrimary: true });
    expect((await state.db.select().from(properties))[0]).toMatchObject({ published: false, prospektPublished: false });
    expect(await runLandlordImageSweep()).toMatchObject({ checked: 0 });
    expect(await state.db.select().from(propertyImages)).toHaveLength(1);
  });
  it.each([{ published: true, autoPublishEnabled: false }, { published: false, autoPublishEnabled: true }])("stores a candidate privately when gallery changes might affect publication", async (change) => {
    await state.db.update(properties).set(change);
    expect(await runLandlordImageSweep()).toMatchObject({ review: 1 });
    expect(await state.db.select().from(propertyImages)).toHaveLength(0);
    expect((await state.db.select().from(landlordImageCandidates))[0]).toMatchObject({ status: "needs_review", objectKey: expect.any(String) });
    expect((await state.db.select().from(landlordReplyRuns))[0].attachmentsNeedReview).toBe(true);
    expect(sendLandlordImageReviewNotice).toHaveBeenCalledWith("property", "reply");
  });
  it("leaves a poor or uncertain image private for review", async () => {
    vi.mocked(inspectLandlordImage).mockResolvedValueOnce({ decision: "review", reason: "Otydlig bild" });
    expect(await runLandlordImageSweep()).toMatchObject({ review: 1 });
    expect(await state.db.select().from(propertyImages)).toHaveLength(0);
  });
  it("does not attach an image when the property changes owner during processing", async () => {
    await state.db.insert(owners).values({ id: "another-owner", name: "Maria", email: "maria@example.com" });
    vi.mocked(inspectLandlordImage).mockImplementationOnce(async () => {
      await state.db.update(properties).set({ ownerId: "another-owner" });
      return { decision: "accept", reason: "" };
    });
    expect(await runLandlordImageSweep()).toMatchObject({ review: 1 });
    expect(await state.db.select().from(propertyImages)).toHaveLength(0);
    expect((await state.db.select().from(landlordImageCandidates))[0].error).toContain("ändrats");
  });
  it("retries a failed review alert using the same source identity", async () => {
    await state.db.update(properties).set({ published: true });
    vi.mocked(sendLandlordImageReviewNotice).mockRejectedValueOnce(new Error("unavailable"));
    expect(await runLandlordImageSweep()).toMatchObject({ errors: 1 });
    expect((await state.db.select().from(landlordImageCandidates))[0].reviewNoticeSentAt).toBeNull();
    await runLandlordImageSweep();
    expect((await state.db.select().from(landlordImageCandidates))[0].reviewNoticeSentAt).toBeTruthy();
  });
  it("does not run two image sweeps simultaneously", async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    vi.mocked(gmailGetImageAttachment).mockImplementationOnce(async () => { await gate; return Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]); });
    const first = runLandlordImageSweep();
    await vi.waitFor(() => expect(gmailGetImageAttachment).toHaveBeenCalled());
    expect(await runLandlordImageSweep()).toMatchObject({ checked: 0 });
    release();
    expect(await first).toMatchObject({ imported: 1 });
    expect(await state.db.select().from(propertyImages)).toHaveLength(1);
  });
});
