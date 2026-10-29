import { describe, expect, it } from "vitest";
import { dealNextStep, dealRequests, dealStepIndex } from "./DealProgress";

const req = (id: string, status: string, moveInChecklist: string[] | null = null) =>
  ({ id, requestNumber: 1, city: "Boden", status, moveInChecklist }) as Parameters<typeof dealStepIndex>[0];

describe("stegraden på företagskortet", () => {
  it("placerar varje status på rätt steg", () => {
    expect(dealStepIndex(req("a", "incoming"))).toBe(0);
    expect(dealStepIndex(req("a", "matching"))).toBe(1);
    expect(dealStepIndex(req("a", "won", []))).toBe(2);
    expect(dealStepIndex(req("a", "invoiced"))).toBe(4);
    expect(dealStepIndex(req("a", "lost"))).toBeNull();
  });

  it("säger vad som är nästa steg", () => {
    expect(dealNextStep(req("a", "matching"))).toMatch(/Hitta boende/);
    expect(dealNextStep(req("a", "won", []))).toBe("Skicka avtalet");
  });

  it("visar öppna förfrågningar med den valda först och döljer stängda", () => {
    const rows = dealRequests([req("a", "incoming"), req("b", "won", []), req("c", "lost")], "a");
    expect(rows.map((r) => r.id)).toEqual(["a", "b"]);
    expect(dealRequests([req("a", "incoming"), req("b", "won", [])], null)[0].id).toBe("b");
  });
});
