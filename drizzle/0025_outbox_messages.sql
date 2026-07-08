CREATE TABLE IF NOT EXISTS `crm_outbox_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`to_phone` text NOT NULL,
	`body` text NOT NULL,
	`owner_id` text,
	`contact_id` text,
	`status` text NOT NULL DEFAULT 'queued',
	`error` text,
	`created_at` text DEFAULT (datetime('now')),
	`sent_at` text
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `crm_outbox_messages_status_idx` ON `crm_outbox_messages` (`status`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `crm_outbox_messages_to_phone_idx` ON `crm_outbox_messages` (`to_phone`);
