CREATE TABLE `crm_share_links_new` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`audience` text NOT NULL,
	`request_id` text,
	`match_id` text,
	`owner_id` text,
	`created_by` text,
	`revoked_at` text,
	`expires_at` text,
	`last_viewed_at` text,
	`view_count` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
INSERT INTO `crm_share_links_new` (id, token, audience, request_id, match_id, created_by, revoked_at, expires_at, last_viewed_at, view_count, created_at)
	SELECT id, token, audience, request_id, match_id, created_by, revoked_at, expires_at, last_viewed_at, view_count, created_at FROM `crm_share_links`;
--> statement-breakpoint
DROP TABLE `crm_share_links`;
--> statement-breakpoint
ALTER TABLE `crm_share_links_new` RENAME TO `crm_share_links`;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `crm_share_links_token_idx` ON `crm_share_links` (`token`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `crm_share_links_request_id_idx` ON `crm_share_links` (`request_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `crm_share_links_match_id_idx` ON `crm_share_links` (`match_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `crm_share_links_owner_id_idx` ON `crm_share_links` (`owner_id`);
--> statement-breakpoint
ALTER TABLE `crm_agreement_acceptances` ADD COLUMN `company_id` text;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `crm_agreement_acceptances_company_id_idx` ON `crm_agreement_acceptances` (`company_id`);
