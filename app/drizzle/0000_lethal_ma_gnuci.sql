CREATE TABLE `basic_translate` (
	`id` text PRIMARY KEY NOT NULL,
	`source_text` text NOT NULL,
	`source_lang` text,
	`to_lang` text NOT NULL,
	`user_native_lang_when_created` text NOT NULL,
	`translate_lang_when_created` text NOT NULL,
	`user_plan_when_created` text NOT NULL,
	`dialect_bcp47` text,
	`translation_excerpt` text,
	`meta_kv_list` text DEFAULT '{}' NOT NULL,
	`ai_reply_results` text DEFAULT '[]' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`last_message_added_at` integer NOT NULL,
	`allow_paraphrase` integer NOT NULL,
	`app_version` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `last_message_added_at_index` ON `basic_translate` (`last_message_added_at`);--> statement-breakpoint
CREATE TABLE `basic_translate_message` (
	`id` text PRIMARY KEY NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer NOT NULL,
	`basic_translate_id` text NOT NULL,
	FOREIGN KEY (`basic_translate_id`) REFERENCES `basic_translate`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `translate_id_index` ON `basic_translate_message` (`basic_translate_id`);--> statement-breakpoint
CREATE TABLE `localkv` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
