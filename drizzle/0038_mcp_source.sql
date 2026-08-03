ALTER TABLE `crm_notes` ADD `source` text NOT NULL DEFAULT 'crm';
--> statement-breakpoint
ALTER TABLE `crm_property_notes` ADD `source` text NOT NULL DEFAULT 'crm';
--> statement-breakpoint
ALTER TABLE `crm_outbox_messages` ADD `source` text NOT NULL DEFAULT 'crm';
