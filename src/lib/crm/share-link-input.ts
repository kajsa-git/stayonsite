import type { ShareAudience } from "./share-links";

export interface ShareLinkCreateInput {
  audience: ShareAudience;
  requestId: string | null;
  matchId: string | null;
  ownerId: string | null;
}

export type ShareLinkCreateInputResult =
  | { ok: true; input: ShareLinkCreateInput }
  | { ok: false; error: string; status: number };

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function requestedAudience(value: unknown): ShareAudience | null {
  return value === "tenant" || value === "landlord" ? value : null;
}

export function parseShareLinkCreateInput(body: unknown): ShareLinkCreateInputResult {
  const raw = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const requestId = stringOrNull(raw.requestId);
  const matchId = stringOrNull(raw.matchId);
  const ownerId = stringOrNull(raw.ownerId);

  const explicitAudience = requestedAudience(raw.audience);
  const audience: ShareAudience = explicitAudience ?? (ownerId || matchId ? "landlord" : "tenant");

  if (audience === "tenant") {
    if (!requestId) {
      return { ok: false, error: "requestId krävs för kundlänk", status: 400 };
    }
    return {
      ok: true,
      input: {
        audience,
        requestId,
        matchId: null,
        ownerId: null,
      },
    };
  }

  if (ownerId) {
    return {
      ok: true,
      input: {
        audience,
        requestId: null,
        matchId: null,
        ownerId,
      },
    };
  }

  if (!requestId || !matchId) {
    return { ok: false, error: "ownerId eller requestId + matchId krävs för uthyrarlänk", status: 400 };
  }

  return {
    ok: true,
    input: {
      audience,
      requestId,
      matchId,
      ownerId: null,
    },
  };
}
