ALTER TABLE `crm_owners` ADD COLUMN `follow_up_time` text;
--> statement-breakpoint
ALTER TABLE `crm_owner_outreach` ADD COLUMN `next_follow_up_time` text;
--> statement-breakpoint
ALTER TABLE `crm_outbox_messages` ADD COLUMN `reply_to_inbox_ids` text;
--> statement-breakpoint
ALTER TABLE `crm_outbox_messages` ADD COLUMN `delivered_at` text;
