-- Diskmaskin + diskreta "vad ingår"-fält på objekt + textfält för undantag/särskilt-att-veta.
-- Allt nullable och additivt — körs säkert mot live.
ALTER TABLE `crm_properties` ADD `dishwasher` integer;
ALTER TABLE `crm_properties` ADD `all_included` integer;
ALTER TABLE `crm_properties` ADD `excluded_note` text;
ALTER TABLE `crm_properties` ADD `linens_included` integer;
ALTER TABLE `crm_properties` ADD `heat_water_included` integer;
ALTER TABLE `crm_properties` ADD `special_note` text;
