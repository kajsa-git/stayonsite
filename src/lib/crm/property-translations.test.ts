import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PropertyTranslationError, translatePropertyText, withDescriptionTranslations } from "./property-translations";

const translations = { publicDescriptionEn: "Furnished studio with a private kitchen.", publicDescriptionPl: "Umeblowana kawalerka z własną kuchnią.", skickEn: "", skickPl: "", inclusionsEn: [], inclusionsPl: [] };
let result: unknown;
let stopReason: string;

beforeEach(() => {
  result = { ...translations }; stopReason = "end_turn";
  vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
  vi.stubGlobal("fetch", vi.fn(async () => Response.json({ stop_reason: stopReason, content: [{ type: "text", text: JSON.stringify(result) }] })));
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("automatic external descriptions", () => {
  it("translates a new property even before it has images", async () => {
    expect(await withDescriptionTranslations({ publicDescription: "Möblerad etta med eget kök." })).toMatchObject({ publicDescriptionEn: translations.publicDescriptionEn, publicDescriptionPl: translations.publicDescriptionPl });
    const sent = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string);
    expect(JSON.parse(sent.messages[0].content)).toEqual({ publicDescription: "Möblerad etta med eget kök.", skick: "", inclusions: [] });
  });
  it("replaces stale translations sent along with a changed source", async () => {
    const old = { publicDescription: "Gammal text", publicDescriptionEn: "Old", publicDescriptionPl: "Stary" };
    expect(await withDescriptionTranslations({ ...old, publicDescription: "Ny text" }, old)).toMatchObject({ publicDescriptionEn: translations.publicDescriptionEn, publicDescriptionPl: translations.publicDescriptionPl });
  });
  it("keeps complete translations and manual corrections when the source is unchanged", async () => {
    const old = { publicDescription: "Text", publicDescriptionEn: "English", publicDescriptionPl: "Polski" };
    expect(await withDescriptionTranslations({ ...old, publicDescriptionEn: "Reviewed English" }, old)).toMatchObject({ publicDescriptionEn: "Reviewed English" });
    expect(fetch).not.toHaveBeenCalled();
  });
  it("fills an empty translation while preserving the other reviewed language", async () => {
    expect(await withDescriptionTranslations({ publicDescription: "Text" }, { publicDescription: "Text", publicDescriptionEn: "Reviewed English", publicDescriptionPl: " " })).toMatchObject({ publicDescriptionEn: "Reviewed English", publicDescriptionPl: translations.publicDescriptionPl });
  });
  it("clears translations when the source is removed", async () => {
    expect(await withDescriptionTranslations({ publicDescription: null }, { publicDescription: "Text", publicDescriptionEn: "English", publicDescriptionPl: "Polski" })).toEqual({ publicDescription: null, publicDescriptionEn: null, publicDescriptionPl: null });
    expect(fetch).not.toHaveBeenCalled();
  });
  it("does not translate unrelated property updates", async () => {
    expect(await withDescriptionTranslations({})).toEqual({});
    expect(fetch).not.toHaveBeenCalled();
  });
  it("never sends private CRM fields to the translation provider", async () => {
    const property = { publicDescription: "Lägenhet", notes: "PRIVATE", ownerEmail: "private@example.com", rentIn: 9000, address: "Privatgatan 1" };
    await translatePropertyText(property);
    expect(JSON.stringify(vi.mocked(fetch).mock.calls)).not.toMatch(/PRIVATE|private@example|9000|Privatgatan/);
  });
  it.each(["", null, 42])("rejects a missing or invalid translation: %j", async (missing) => {
    result = { ...translations, publicDescriptionPl: missing };
    await expect(withDescriptionTranslations({ publicDescription: "Text" })).rejects.toBeInstanceOf(PropertyTranslationError);
  });
  it("rejects truncated results and incomplete inclusion lists", async () => {
    stopReason = "max_tokens";
    await expect(translatePropertyText({ publicDescription: "Text" })).rejects.toThrow(/ofullständig/);
    stopReason = "end_turn";
    await expect(translatePropertyText({ inclusions: ["Bredband"] })).rejects.toThrow(/ofullständig/);
  });
  it("reports a provider outage instead of returning stale copy", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("down", { status: 503 })));
    await expect(withDescriptionTranslations({ publicDescription: "New text" })).rejects.toMatchObject({ status: 502 });
  });
  it("reports missing configuration and validates source types", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    await expect(translatePropertyText({ publicDescription: "Text" })).rejects.toMatchObject({ status: 503 });
    await expect(translatePropertyText({ publicDescription: 42 } as never)).rejects.toMatchObject({ status: 400 });
    expect(fetch).not.toHaveBeenCalled();
  });
});
