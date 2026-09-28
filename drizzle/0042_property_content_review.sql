ALTER TABLE crm_properties ADD COLUMN content_review_status text NOT NULL DEFAULT 'pending';
--> statement-breakpoint
ALTER TABLE crm_properties ADD COLUMN content_review_hash text;
--> statement-breakpoint
ALTER TABLE crm_properties ADD COLUMN content_review_report text;
--> statement-breakpoint
ALTER TABLE crm_properties ADD COLUMN content_reviewed_at text;
--> statement-breakpoint
ALTER TABLE crm_properties ADD COLUMN content_review_original text;
--> statement-breakpoint
ALTER TABLE crm_properties ADD COLUMN auto_publish_enabled integer NOT NULL DEFAULT 1;
--> statement-breakpoint
CREATE INDEX crm_properties_content_review_idx ON crm_properties(content_review_status);
