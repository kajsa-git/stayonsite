import { sql } from "drizzle-orm";
import { properties } from "./schema";

// Preserve an active worker's lease while it finishes. Its fingerprint check
// will discard stale output and rerun against the latest upload/edits.
export function pendingContentReview() {
  // HUS publication requires a fresh human decision after changed content or
  // images. Other intakes keep their existing publication behaviour.
  const hus = sql`(${properties.publishConsentSource} = 'hus' OR instr(coalesce(${properties.notes}, ''), 'HUS webbpublicering (') > 0)`;
  return {
    contentReviewStatus: sql<string>`CASE WHEN ${properties.contentReviewStatus} = 'checking' THEN 'checking' ELSE 'pending' END`,
    contentReviewHash: null,
    published: sql<boolean>`CASE WHEN ${hus} THEN 0 ELSE ${properties.published} END`,
    prospektPublished: sql<boolean>`CASE WHEN ${hus} THEN 0 ELSE ${properties.prospektPublished} END`,
    autoPublishEnabled: sql<boolean>`CASE WHEN ${hus} THEN 0 ELSE ${properties.autoPublishEnabled} END`,
  };
}
