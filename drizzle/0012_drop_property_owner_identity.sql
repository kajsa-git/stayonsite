-- Owner-identitet bor nu enbart i crm_owners (objektet länkar via owner_id).
-- Dessa speglade kolumner på objektet tas bort. Kör mot live efter verifiering.
ALTER TABLE `crm_properties` DROP COLUMN `owner_type`;
ALTER TABLE `crm_properties` DROP COLUMN `owner_arrangement`;
ALTER TABLE `crm_properties` DROP COLUMN `owner_name`;
ALTER TABLE `crm_properties` DROP COLUMN `owner_org_nr`;
ALTER TABLE `crm_properties` DROP COLUMN `owner_contact_person`;
ALTER TABLE `crm_properties` DROP COLUMN `owner_phone`;
ALTER TABLE `crm_properties` DROP COLUMN `owner_email`;
ALTER TABLE `crm_properties` DROP COLUMN `rating`;
