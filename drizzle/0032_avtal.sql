CREATE TABLE IF NOT EXISTS `crm_agreement_acceptances` (
	`id` text PRIMARY KEY NOT NULL,
	`agreement_type` text NOT NULL,
	`version` text NOT NULL,
	`request_id` text,
	`owner_id` text,
	`property_id` text,
	`share_link_id` text,
	`accepted_name` text NOT NULL,
	`accepted_at` text NOT NULL,
	`user_agent` text,
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `crm_agreement_acceptances_request_id_idx` ON `crm_agreement_acceptances` (`request_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `crm_agreement_acceptances_owner_id_idx` ON `crm_agreement_acceptances` (`owner_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `crm_agreement_acceptances_type_idx` ON `crm_agreement_acceptances` (`agreement_type`);
