import sharp from "sharp";
import { afterEach, describe, expect, it, vi } from "vitest";
import { inspectLandlordImage } from "./landlord-image-classifier";

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
const image = (width: number, height: number) => sharp({ create: { width, height, channels: 3, background: "#eeeeee" } }).jpeg().toBuffer();

describe("landlord image checks", () => {
  it("recognizes tiny named signatures and flags small photographs for human review", async () => {
    const bytes = await image(200, 100);
    expect((await inspectLandlordImage(bytes, "logo.jpg")).decision).toBe("ignore");
    expect((await inspectLandlordImage(bytes, "hus.jpg")).decision).toBe("review");
  });
  it("accepts a large image only after a structured positive model assessment", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ stop_reason: "end_turn", content: [{ type: "text", text: JSON.stringify({ suitable: true, reason: "" }) }] }) }));
    expect((await inspectLandlordImage(await image(1200, 800), "rum.jpg")).decision).toBe("accept");
  });
});
