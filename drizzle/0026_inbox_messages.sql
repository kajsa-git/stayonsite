CREATE TABLE IF NOT EXISTS `crm_inbox_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`guid` text NOT NULL,
	`from_phone` text NOT NULL,
	`body` text NOT NULL,
	`service` text,
	`sent_at` text NOT NULL,
	`owner_id` text,
	`contact_id` text,
	`company_id` text,
	`is_read` integer NOT NULL DEFAULT 0,
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `crm_inbox_messages_guid_idx` ON `crm_inbox_messages` (`guid`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `crm_inbox_messages_from_phone_idx` ON `crm_inbox_messages` (`from_phone`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `crm_inbox_messages_is_read_idx` ON `crm_inbox_messages` (`is_read`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `crm_inbox_messages_owner_id_idx` ON `crm_inbox_messages` (`owner_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `crm_inbox_messages_company_id_idx` ON `crm_inbox_messages` (`company_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `crm_inbox_messages_sent_at_idx` ON `crm_inbox_messages` (`sent_at`);
