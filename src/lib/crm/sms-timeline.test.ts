import { describe, expect, it } from "vitest";
import { matchOutgoingSms } from "./sms-timeline";

const incoming = { id: "in", direction: "out", fromPhone: "+46701111111", body: "Hej", sentAt: "2026-10-28T12:00:05Z" };
const outgoing = { id: "out", toPhone: "+46701111111", body: "Hej", status: "sent", sentAt: "2026-10-28T12:00:03Z", createdAt: null, deliveredAt: null };

describe("koppling mellan utkorg och tidslinje", () => {
  it("kopplar ett entydigt skickat meddelande", () => {
    expect(matchOutgoingSms([incoming], [outgoing]).get("in")?.id).toBe("out");
  });
  it("undviker tvetydiga träffar och nummer som skiljer sig", () => {
    expect(matchOutgoingSms([incoming], [outgoing, { ...outgoing, id: "out2" }]).size).toBe(0);
    expect(matchOutgoingSms([incoming], [{ ...outgoing, toPhone: "+46702222222" }]).size).toBe(0);
  });
});
