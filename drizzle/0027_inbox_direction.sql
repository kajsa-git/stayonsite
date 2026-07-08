ALTER TABLE `crm_inbox_messages` ADD COLUMN `direction` text NOT NULL DEFAULT 'in';
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `crm_inbox_messages_direction_idx` ON `crm_inbox_messages` (`direction`);
