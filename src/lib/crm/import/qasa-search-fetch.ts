// Server-only: kör Qasa-sökningen. Rena byggstenar och fällorna i API:t: se qasa-search.ts.
import { safeFetchPublic } from "@/lib/crm/safe-fetch";
import {
  buildQasaControlRequest,
  buildQasaSearchRequest,
  pickQasaSearchResult,
  qasaAreaCandidates,
  QasaUnknownAreaError,
  type QasaSearchCriteria,
  type QasaSearchResponse,
  type QasaSearchResult,
} from "./qasa-search";

const QASA_GRAPHQL = "https://api.qasa.com/graphql";

async function postQasa(body: { query: string; variables: unknown }): Promise<QasaSearchResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  let res: Response;
  try {
    // Fast värd, men via safeFetchPublic för samma protokoll-/port-/redirect-skydd som importen.
    res = await safeFetchPublic(QASA_GRAPHQL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124.0 Safari/537.36",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) throw new Error(`Qasa svarade ${res.status}`);
  return (await res.json()) as QasaSearchResponse;
}

export async function searchQasa(c: QasaSearchCriteria, offset = 0): Promise<QasaSearchResult> {
  const areas = qasaAreaCandidates(c.city);
  if (!areas.length) throw new QasaUnknownAreaError(c.city);
  const [control, ...responses] = await Promise.all([
    postQasa(buildQasaControlRequest(c)),
    ...areas.map((a) => postQasa(buildQasaSearchRequest(c, a, offset))),
  ]);
  return pickQasaSearchResult(responses, control, areas, c.city);
}
