CREATE TABLE `crm_owners` (
  `id` text PRIMARY KEY NOT NULL,
  `owner_type` text,
  `owner_arrangement` text,
  `name` text NOT NULL,
  `org_nr` text,
  `contact_person` text,
  `phone` text,
  `email` text,
  `rating` integer,
  `follow_up_date` text,
  `follow_up_reason` text,
  `follow_up_note` text,
  `notes` text,
  `created_at` text DEFAULT (datetime('now')),
  `updated_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE INDEX `crm_owners_name_idx` ON `crm_owners` (`name`);
--> statement-breakpoint
CREATE INDEX `crm_owners_org_nr_idx` ON `crm_owners` (`org_nr`);
--> statement-breakpoint
CREATE INDEX `crm_owners_phone_idx` ON `crm_owners` (`phone`);
--> statement-breakpoint
CREATE INDEX `crm_owners_email_idx` ON `crm_owners` (`email`);
--> statement-breakpoint
CREATE INDEX `crm_owners_follow_up_date_idx` ON `crm_owners` (`follow_up_date`);
--> statement-breakpoint
ALTER TABLE `crm_properties` ADD `owner_id` text REFERENCES `crm_owners`(`id`) ON DELETE SET NULL;
--> statement-breakpoint
CREATE INDEX `crm_properties_owner_id_idx` ON `crm_properties` (`owner_id`);
--> statement-breakpoint
INSERT INTO `crm_owners` (
  `id`,
  `owner_type`,
  `owner_arrangement`,
  `name`,
  `org_nr`,
  `contact_person`,
  `phone`,
  `email`,
  `rating`,
  `follow_up_date`,
  `follow_up_reason`,
  `follow_up_note`,
  `created_at`,
  `updated_at`
)
SELECT
  lower(hex(randomblob(16))),
  `owner_type`,
  `owner_arrangement`,
  COALESCE(NULLIF(trim(`owner_name`), ''), '(uthyrare utan namn)'),
  NULLIF(trim(`owner_org_nr`), ''),
  NULLIF(trim(`owner_contact_person`), ''),
  NULLIF(trim(`owner_phone`), ''),
  NULLIF(trim(`owner_email`), ''),
  `rating`,
  `owner_follow_up_date`,
  `owner_follow_up_reason`,
  `owner_follow_up_note`,
  COALESCE(`created_at`, datetime('now')),
  COALESCE(`updated_at`, datetime('now'))
FROM `crm_properties`
WHERE `owner_id` IS NULL
  AND (
    NULLIF(trim(COALESCE(`owner_name`, '')), '') IS NOT NULL
    OR NULLIF(trim(COALESCE(`owner_org_nr`, '')), '') IS NOT NULL
    OR NULLIF(trim(COALESCE(`owner_phone`, '')), '') IS NOT NULL
    OR NULLIF(trim(COALESCE(`owner_email`, '')), '') IS NOT NULL
  )
GROUP BY
  lower(COALESCE(`owner_name`, '')),
  COALESCE(`owner_org_nr`, ''),
  COALESCE(`owner_phone`, ''),
  COALESCE(`owner_email`, '');
--> statement-breakpoint
UPDATE `crm_properties`
SET `owner_id` = (
  SELECT `crm_owners`.`id`
  FROM `crm_owners`
  WHERE lower(COALESCE(`crm_owners`.`name`, '')) = lower(COALESCE(`crm_properties`.`owner_name`, '(uthyrare utan namn)'))
    AND COALESCE(`crm_owners`.`org_nr`, '') = COALESCE(`crm_properties`.`owner_org_nr`, '')
    AND COALESCE(`crm_owners`.`phone`, '') = COALESCE(`crm_properties`.`owner_phone`, '')
    AND COALESCE(`crm_owners`.`email`, '') = COALESCE(`crm_properties`.`owner_email`, '')
  LIMIT 1
)
WHERE `owner_id` IS NULL
  AND (
    NULLIF(trim(COALESCE(`owner_name`, '')), '') IS NOT NULL
    OR NULLIF(trim(COALESCE(`owner_org_nr`, '')), '') IS NOT NULL
    OR NULLIF(trim(COALESCE(`owner_phone`, '')), '') IS NOT NULL
    OR NULLIF(trim(COALESCE(`owner_email`, '')), '') IS NOT NULL
  );
