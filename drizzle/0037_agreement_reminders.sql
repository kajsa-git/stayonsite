CREATE TABLE `crm_agreement_reminders` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`share_link_id` text,
	`channel` text NOT NULL,
	`recipient` text,
	`reminder_no` integer NOT NULL,
	`sent_at` text NOT NULL,
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `crm_agreement_reminders_owner_id_idx` ON `crm_agreement_reminders` (`owner_id`);
