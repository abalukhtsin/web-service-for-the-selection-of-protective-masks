CREATE TABLE `anymask`.`mask` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `manufacturer` VARCHAR(45) NOT NULL,
  `shop` VARCHAR(45) NOT NULL,
  `type` VARCHAR(45) NOT NULL,
  `protection_class` VARCHAR(45) NOT NULL,
  `material` VARCHAR(45) NOT NULL,
  `number_layer` BIGINT(20) NOT NULL,
  `color` VARCHAR(45) NOT NULL,
  `price` BIGINT(20) NOT NULL,
  `image_id` BIGINT(20) NULL,
  PRIMARY KEY (`id`));
