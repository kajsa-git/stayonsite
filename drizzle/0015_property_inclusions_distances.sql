-- "Vad ingår" (manuell lista, lokaliserad) + "Avstånd" (manuella platser med auto-km/min).
ALTER TABLE `crm_properties` ADD `inclusions` text;
ALTER TABLE `crm_properties` ADD `inclusions_en` text;
ALTER TABLE `crm_properties` ADD `inclusions_pl` text;
ALTER TABLE `crm_properties` ADD `distances` text;
