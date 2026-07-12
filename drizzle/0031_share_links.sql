CREATE TABLE IF NOT EXISTS `crm_share_links` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`audience` text NOT NULL,
	`request_id` text NOT NULL,
	`match_id` text,
	`created_by` text,
	`revoked_at` text,
	`expires_at` text,
	`last_viewed_at` text,
	`view_count` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `crm_share_links_token_idx` ON `crm_share_links` (`token`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `crm_share_links_request_id_idx` ON `crm_share_links` (`request_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `crm_share_links_match_id_idx` ON `crm_share_links` (`match_id`);
