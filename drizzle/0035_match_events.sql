CREATE TABLE IF NOT EXISTS `crm_match_events` (
	`id` text PRIMARY KEY NOT NULL,
	`match_id` text NOT NULL,
	`request_id` text,
	`actor` text NOT NULL,
	`type` text NOT NULL,
	`data` text,
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `crm_match_events_match_id_idx` ON `crm_match_events` (`match_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `crm_match_events_request_id_idx` ON `crm_match_events` (`request_id`);
