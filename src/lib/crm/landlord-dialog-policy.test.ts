import { describe, expect, it } from "vitest";
import type { GmailMessage } from "./gmail";
import { asksToStopContact, currentLandlordTurn, eligibleLandlordReply, evidenceAppearsInReply, isAcknowledgementOnly, stripLandlordQuote } from "./landlord-dialog-policy";

const message = (overrides: Partial<GmailMessage> = {}): GmailMessage => ({
  id: "m1", threadId: "thread", from: "Anna <anna@example.com>", to: "Kajsa <kajsa@example.com>",
  subject: "Re: Bostaden", date: "2026-11-07T12:00:00Z", text: "Den är ledig i mars.",
  html: null, autoSubmitted: "", precedence: "", cc: "", listUnsubscribe: "", labelIds: [], snippet: "", receivedAt: null, ...overrides,
});
const eligible = (messages: GmailMessage[]) => eligibleLandlordReply(messages, "anna@example.com", "kajsa@example.com", "2026-11-06T12:00:00Z");

describe("landlord reply eligibility", () => {
  it("accepts only a new reply from the enrolled landlord", () => {
    expect(eligible([message()])?.id).toBe("m1");
    expect(eligible([message({ from: "other@example.com" })])).toBeNull();
    expect(eligible([message({ date: "2026-11-06T11:00:00Z" })])).toBeNull();
  });
  it("does not answer when a person already replied or the message is automatic", () => {
    expect(eligible([message(), message({ from: "kajsa@example.com" })])).toBeNull();
    expect(eligible([message({ autoSubmitted: "auto-replied" })])).toBeNull();
    expect(eligible([message({ precedence: "bulk" })])).toBeNull();
    expect(eligible([message({ text: "" })])).toBeNull();
    expect(eligible([message({ labelIds: ["DRAFT"] }), message()])).toBeNull();
    expect(eligible([message({ labelIds: ["SPAM"] })])).toBeNull();
    expect(eligible([message({ labelIds: ["TRASH"] })])).toBeNull();
  });
  it("does not let quoted earlier correspondence substantiate a new fact", () => {
    const text = stripLandlordQuote("Nu är den ledig.\n\n6 nov. 2026 kl. 09:48 skrev Kajsa:\nHyran är 7 000 kr.");
    expect(text).toBe("Nu är den ledig.");
    expect(evidenceAppearsInReply("7 000 kr", text)).toBe(false);
    expect(evidenceAppearsInReply("den ledig", text)).toBe(true);
  });
  it("includes a burst of consecutive messages, but rejects other participants", () => {
    const two = [message({ id: "first", text: "Två sovrum." }), message({ id: "second", text: "Fyra bäddar." })];
    expect(currentLandlordTurn(two, "anna@example.com", "kajsa@example.com", "2026-11-06T12:00:00Z")).toHaveLength(2);
    expect(currentLandlordTurn([message({ from: "other@example.com" }), ...two], "anna@example.com", "kajsa@example.com", "2026-11-06T12:00:00Z")).toEqual([]);
  });
  it("routes explicit requests to stop contact for manual handling", () => {
    expect(asksToStopContact("Sluta kontakta mig, tack.")).toBe(true);
    expect(asksToStopContact("Please don't contact me again.")).toBe(true);
    expect(asksToStopContact("Sluta inte leta, vi hörs snart.")).toBe(false);
  });
  it("distinguishes acknowledgements from answers and image-only messages", () => {
    expect(isAcknowledgementOnly("👍🏻👍🏻")).toBe(true);
    expect(isAcknowledgementOnly("Gillade ”Okej tack”")).toBe(true);
    expect(isAcknowledgementOnly("Tack!" )).toBe(true);
    expect(isAcknowledgementOnly("Ja")).toBe(false);
    expect(isAcknowledgementOnly("\uFFFC")).toBe(false);
  });
});
