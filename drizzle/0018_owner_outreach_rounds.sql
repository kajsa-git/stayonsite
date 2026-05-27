-- Kontaktrundor mot uthyrare (per objekt). Ersätter property.ownerFollowUp*-fälten.
-- Databevarande: migrera befintliga uppföljningar till öppna rundor INNAN kolumnerna droppas.
-- OBS: körs via scripts/migrate-0017.mjs (INTE drizzle-kit push, som skulle droppa data).

CREATE TABLE `crm_owner_outreach` (
	`id` text PRIMARY KEY NOT NULL,
	`property_id` text NOT NULL REFERENCES `crm_properties`(`id`) ON DELETE CASCADE,
	`owner_id` text REFERENCES `crm_owners`(`id`) ON DELETE SET NULL,
	`request_id` text REFERENCES `crm_requests`(`id`) ON DELETE SET NULL,
	`status` text DEFAULT 'ej_kontaktad' NOT NULL,
	`started_at` text DEFAULT (datetime('now')),
	`next_follow_up_date` text,
	`next_follow_up_reason` text,
	`concluded_at` text,
	`note` text,
	`created_at` text DEFAULT (datetime('now'))
);
CREATE INDEX `crm_owner_outreach_property_id_idx` ON `crm_owner_outreach` (`property_id`);
CREATE INDEX `crm_owner_outreach_owner_id_idx` ON `crm_owner_outreach` (`owner_id`);
CREATE INDEX `crm_owner_outreach_request_id_idx` ON `crm_owner_outreach` (`request_id`);
CREATE INDEX `crm_owner_outreach_next_follow_up_date_idx` ON `crm_owner_outreach` (`next_follow_up_date`);
CREATE INDEX `crm_owner_outreach_status_idx` ON `crm_owner_outreach` (`status`);

-- Migrera befintliga objekt-uppföljningar till öppna rundor (status 'kontaktad').
INSERT INTO `crm_owner_outreach`
	(`id`, `property_id`, `owner_id`, `status`, `started_at`, `next_follow_up_date`, `next_follow_up_reason`, `note`, `created_at`)
SELECT
	lower(hex(randomblob(12))),
	`id`,
	`owner_id`,
	'kontaktad',
	COALESCE(`created_at`, datetime('now')),
	`owner_follow_up_date`,
	`owner_follow_up_reason`,
	`owner_follow_up_note`,
	datetime('now')
FROM `crm_properties`
WHERE `owner_follow_up_date` IS NOT NULL;

-- Droppa de gamla speglade kolumnerna.
DROP INDEX IF EXISTS `crm_properties_owner_follow_up_date_idx`;
ALTER TABLE `crm_properties` DROP COLUMN `owner_follow_up_date`;
ALTER TABLE `crm_properties` DROP COLUMN `owner_follow_up_reason`;
ALTER TABLE `crm_properties` DROP COLUMN `owner_follow_up_note`;
