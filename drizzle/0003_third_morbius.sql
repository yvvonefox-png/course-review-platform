CREATE TABLE `coursePlatforms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`displayName` varchar(100) NOT NULL,
	`description` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coursePlatforms_id` PRIMARY KEY(`id`),
	CONSTRAINT `coursePlatforms_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
ALTER TABLE `courses` ADD `platformId` int;