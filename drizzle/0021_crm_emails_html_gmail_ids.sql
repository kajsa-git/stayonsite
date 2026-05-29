-- crm_emails: html-kropp + Gmail-id:n (gmail_message_id, gmail_thread_id).
-- Kolumnerna används redan av koden (app/api/crm/emails/sync) men saknade migration.
-- OBS: i live-DB kan de redan finnas (tillagda manuellt via Drizzle Studio). Denna
-- migration är källkods-sanning och körs mot fresh DB / i test. Applicera ADD-satserna
-- mot live ENBART om kolumnerna saknas där (kolla: PRAGMA table_info(crm_emails)).
-- Unik-indexet nedan är nytt och bör läggas på live oavsett.
ALTER TABLE `crm_emails` ADD `html` text;--> statement-breakpoint
ALTER TABLE `crm_emails` ADD `gmail_message_id` text;--> statement-breakpoint
ALTER TABLE `crm_emails` ADD `gmail_thread_id` text;--> statement-breakpoint
-- Idempotent synk: rensa ev. dubletter (behåll lägsta rowid per id) innan unik-index.
DELETE FROM `crm_emails`
WHERE `gmail_message_id` IS NOT NULL
  AND `rowid` NOT IN (
    SELECT MIN(`rowid`) FROM `crm_emails`
    WHERE `gmail_message_id` IS NOT NULL
    GROUP BY `gmail_message_id`
  );--> statement-breakpoint
CREATE UNIQUE INDEX `crm_emails_gmail_message_id_unique_idx` ON `crm_emails` (`gmail_message_id`);
