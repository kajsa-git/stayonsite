import { describe, expect, it } from "vitest";
import { parseShareLinkCreateInput } from "./share-link-input";

describe("parseShareLinkCreateInput", () => {
  it("lets explicit tenant links stay tenant even if ownerId is present", () => {
    const result = parseShareLinkCreateInput({
      audience: "tenant",
      requestId: "req_1",
      matchId: "match_1",
      ownerId: "owner_1",
    });

    expect(result).toEqual({
      ok: true,
      input: {
        audience: "tenant",
        requestId: "req_1",
        matchId: null,
        ownerId: null,
      },
    });
  });

  it("infers tenant for request-scoped links", () => {
    const result = parseShareLinkCreateInput({ requestId: "req_1" });

    expect(result).toEqual({
      ok: true,
      input: {
        audience: "tenant",
        requestId: "req_1",
        matchId: null,
        ownerId: null,
      },
    });
  });

  it("infers landlord for standalone owner links", () => {
    const result = parseShareLinkCreateInput({ ownerId: "owner_1" });

    expect(result).toEqual({
      ok: true,
      input: {
        audience: "landlord",
        requestId: null,
        matchId: null,
        ownerId: "owner_1",
      },
    });
  });

  it("infers landlord for match-scoped links", () => {
    const result = parseShareLinkCreateInput({ requestId: "req_1", matchId: "match_1" });

    expect(result).toEqual({
      ok: true,
      input: {
        audience: "landlord",
        requestId: "req_1",
        matchId: "match_1",
        ownerId: null,
      },
    });
  });

  it("rejects tenant links without a request", () => {
    const result = parseShareLinkCreateInput({ audience: "tenant", ownerId: "owner_1" });

    expect(result).toEqual({
      ok: false,
      error: "requestId krävs för kundlänk",
      status: 400,
    });
  });
});
