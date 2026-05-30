-- crm_properties: prospekt_published — den delbara /prospekt-länken styrs nu OBEROENDE
-- av hemsidan (published) och status. Backfill: befintliga publicerade objekt får
-- prospekt-länken på, så att nuvarande delade länkar fortsätter fungera.
-- Paras med scripts/apply-0023-prospekt-published.mjs (idempotent mot live).
ALTER TABLE `crm_properties` ADD `prospekt_published` integer DEFAULT 0;--> statement-breakpoint
UPDATE `crm_properties` SET `prospekt_published` = 1 WHERE `published` = 1;
