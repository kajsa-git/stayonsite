-- crm_requests: annonsattribution för Offline Conversion Import (OCI).
-- gclid bärs från landningssidan hela vägen till leadet; *_uploaded_at ger
-- idempotens så samma konvertering aldrig laddas upp till Google Ads två gånger.
-- Paras med scripts/apply-0024-gclid-attribution.mjs (idempotent mot live).
ALTER TABLE `crm_requests` ADD `gclid` text;--> statement-breakpoint
ALTER TABLE `crm_requests` ADD `gclid_captured_at` text;--> statement-breakpoint
ALTER TABLE `crm_requests` ADD `gads_lead_uploaded_at` text;--> statement-breakpoint
ALTER TABLE `crm_requests` ADD `gads_won_uploaded_at` text;
