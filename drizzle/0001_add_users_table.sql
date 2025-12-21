-- Create users table for profile images
CREATE TABLE `users` (
	`user_id` text PRIMARY KEY NOT NULL,
	`profile_image_url` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
