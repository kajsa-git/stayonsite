CREATE TABLE crm_rental_reviews (
  property_id text PRIMARY KEY NOT NULL REFERENCES crm_properties(id) ON DELETE CASCADE,
  rented_since text NOT NULL,
  check_on text NOT NULL,
  source text NOT NULL
);
--> statement-breakpoint
CREATE INDEX crm_rental_reviews_check_on_idx ON crm_rental_reviews (check_on);
