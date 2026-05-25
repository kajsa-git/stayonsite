ALTER TABLE `crm_matches` ADD `follow_up_reason` text;--> statement-breakpoint
ALTER TABLE `crm_properties` ADD `owner_follow_up_date` text;--> statement-breakpoint
ALTER TABLE `crm_properties` ADD `owner_follow_up_reason` text;--> statement-breakpoint
ALTER TABLE `crm_properties` ADD `owner_follow_up_note` text;--> statement-breakpoint
CREATE INDEX `crm_properties_owner_follow_up_date_idx` ON `crm_properties` (`owner_follow_up_date`);