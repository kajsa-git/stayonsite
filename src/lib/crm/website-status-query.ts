import { and, inArray, or, sql } from "drizzle-orm";
import { WEBSITE_PROPERTY_STATUSES } from "./publication";
import { properties } from "./schema";
import { HUS_TEST_MARKER } from "./test-property";

// Samma status- och medgivanderegel som hasWebsitePropertyStatus.
export function websiteStatusWhere() {
  return and(
    or(
      inArray(properties.status, WEBSITE_PROPERTY_STATUSES),
      sql`length(trim(${properties.publishConsentAt})) > 0`,
    ),
    sql`instr(coalesce(${properties.notes}, ''), ${HUS_TEST_MARKER}) = 0`,
  );
}
