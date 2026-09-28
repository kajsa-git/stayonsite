import { sql } from "drizzle-orm";
import { properties } from "./schema";

// Preserve an active worker's lease while it finishes. Its fingerprint check
// will discard stale output and rerun against the latest upload/edits.
export function pendingContentReview() {
  return {
    contentReviewStatus: sql<string>`CASE WHEN ${properties.contentReviewStatus} = 'checking' THEN 'checking' ELSE 'pending' END`,
    contentReviewHash: null,
  };
}
