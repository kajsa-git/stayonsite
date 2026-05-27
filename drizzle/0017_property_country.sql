-- Land på objekt (tomt/null tolkas som Sverige). Gör postnummer-format + geokodning landsmedvetna.
ALTER TABLE `crm_properties` ADD `country` text;
