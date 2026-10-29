import { inArray, or, sql } from "drizzle-orm";
import { WEBSITE_PROPERTY_STATUSES } from "./publication";
import { properties } from "./schema";

// Samma status- och medgivanderegel som hasWebsitePropertyStatus.
export function websiteStatusWhere() {
  return or(
    inArray(properties.status, WEBSITE_PROPERTY_STATUSES),
    sql`length(trim(${properties.publishConsentAt})) > 0`,
  );
}
