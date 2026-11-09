import { describe, expect, it, vi } from "vitest";
import { parsePropertyFact, planLandlordReply, propertyPatchFromFacts, validateLandlordPlan } from "./landlord-dialog-model";

describe("landlord extraction safety", () => {
  it("requires evidence from the new message", () => {
    const input = { action: "reply", summary: "Två bäddar.", reply: "Tack!", facts: [{ field: "beds", value: "2", evidence: "två bäddar" }] };
    expect(validateLandlordPlan(input, "Vi har två bäddar i huset.").facts).toHaveLength(1);
    expect(() => validateLandlordPlan(input, "Vi har plats för två personer.")).toThrow();
  });
  it("accepts bounded numeric and explicit boolean values only", () => {
    expect(parsePropertyFact("beds", "2")).toBe(2);
    expect(parsePropertyFact("beds", "2.5")).toBeNull();
    expect(parsePropertyFact("furnished", "true")).toBe(true);
    expect(parsePropertyFact("furnished", "ja")).toBeNull();
    expect(parsePropertyFact("squareMeters", "9999")).toBeNull();
  });
  it("does not accept an empty automatic reply", () => {
    expect(() => validateLandlordPlan({ action: "reply", summary: "Svar", reply: "", facts: [] }, "Hej")).toThrow();
  });
  it("removes the unwanted rent wording while keeping the rest of the reply", () => {
    const reply = "Tack för svaret!\n\nVi ser gärna en fast hyra där allt ingår. Vet du vad hyran skulle bli vid möblerad företagsuthyrning? Annars kan vi stämma av när vi har en konkret förfrågan.\n\nMvh Kajsa";
    const plan = validateLandlordPlan({ action: "reply", summary: "Svar", reply, facts: [] }, "Hej");
    expect(plan.reply).toBe("Tack för svaret!\n\nVi ser gärna en fast hyra där allt ingår.\n\nMvh Kajsa");
    expect(() => validateLandlordPlan({ action: "reply", summary: "Svar", reply: "Annars kan vi stämma av när vi har en konkret förfrågan.", facts: [] }, "Hej")).toThrow();
  });
  it("uses the selected brand and refuses an answer signed by the other business", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    const response = (reply: string) => ({ ok: true, json: async () => ({ stop_reason: "end_turn", content: [{ type: "text",
      text: JSON.stringify({ action: "reply", summary: "Svar.", reply, facts: [] }) }] }) }) as Response;
    const mock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response("Tack!\nMvh\nKajsa\nHyrUtSmart"))
      .mockResolvedValueOnce(response("Tack!\nMvh\nKajsa\nStayOnSite"));
    const input = { ownerName: "Uthyrare", property: {}, conversation: "", newReply: "Hej", possibleImageAttachments: 0, brand: "HyrUtSmart" as const };
    try {
      expect((await planLandlordReply(input)).reply).toContain("HyrUtSmart");
      const request = JSON.parse(String(mock.mock.calls[0][1]?.body));
      expect(request.system).toContain("Kajsa på HyrUtSmart");
      await expect(planLandlordReply(input)).rejects.toThrow("fel avsändare");
    } finally { mock.mockRestore(); vi.unstubAllEnvs(); }
  });
  it("fills only clear, empty numeric fields, never capacity or an approximate count", () => {
    const facts = [
      { field: "beds" as const, value: "2", evidence: "2 bäddar" },
      { field: "bedrooms" as const, value: "2", evidence: "plats för 2 personer" },
      { field: "squareMeters" as const, value: "80", evidence: "cirka 80 kvm" },
    ];
    const reply = "2 bäddar\nplats för 2 personer\ncirka 80 kvm";
    expect(propertyPatchFromFacts(facts, {}, reply)).toEqual({ beds: 2 });
    expect(propertyPatchFromFacts(facts, { beds: 3 }, reply)).toEqual({});
    expect(propertyPatchFromFacts([facts[0]], {}, "Högst 2 bäddar om vi kompletterar senare.")).toEqual({});
  });
});
