import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({ db: { select: () => ({ from: () => ({ where: async () => [{ access_token: "test-token", expires_at: null }] }) }) } }));
import { gmailGetImageAttachment, gmailGetThread, gmailThreadReplyHeaders } from "./gmail";

afterEach(() => vi.unstubAllGlobals());

describe("Gmail thread contents", () => {
  it("does not confuse a text attachment with the message body", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ messages: [{ id: "in", threadId: "thread",
      payload: { headers: [], mimeType: "multipart/mixed", parts: [
        { mimeType: "text/plain", body: { data: Buffer.from("Riktigt svar").toString("base64url") } },
        { mimeType: "text/plain", filename: "bilaga.txt", body: { data: Buffer.from("Fel innehåll").toString("base64url") } },
      ] } }] }) }));
    expect((await gmailGetThread("user", "thread"))[0].text).toBe("Riktigt svar");
  });
  it("refuses reply headers when another message arrived after the content check", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ messages: [{ id: "newer", payload: { headers: [{ name: "Message-ID", value: "<newer>" }] } }] }) }));
    expect(await gmailThreadReplyHeaders("user", "thread", "original")).toEqual({});
    expect(await gmailThreadReplyHeaders("user", "thread", "newer")).toMatchObject({ inReplyTo: "<newer>" });
  });
  it("identifies downloadable image attachments and decodes their bytes", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ messages: [{ id: "m", threadId: "t", payload: { headers: [], mimeType: "multipart/mixed", parts: [
        { mimeType: "image/jpeg", filename: "rum.jpg", body: { size: 3, attachmentId: "a" } },
        { mimeType: "image/png", filename: "inline.png", body: { size: 3, data: "YWJj" } },
      ] } }] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ size: 3, data: "YWJj" }) }));
    const [message] = await gmailGetThread("user", "t");
    expect(message.possibleImageAttachments).toBe(2);
    expect(message.imageAttachments).toEqual([{ attachmentId: "a", fileName: "rum.jpg", mimeType: "image/jpeg", sizeBytes: 3 }]);
    expect((await gmailGetImageAttachment("user", "m", "a")).toString()).toBe("abc");
  });
});
