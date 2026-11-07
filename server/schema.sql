-- MySQL Schema for Drag-and-Drop Form Builder
-- Run this in MySQL: mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS `form_builder_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `form_builder_db`;

-- Users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `name` VARCHAR(100) DEFAULT 'Creator',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Forms table
CREATE TABLE IF NOT EXISTS `forms` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL DEFAULT 'Untitled Form',
  `description` TEXT,
  `fields_json` LONGTEXT NOT NULL,
  `theme_json` LONGTEXT,
  `settings_json` LONGTEXT,
  `public_slug` VARCHAR(64) NOT NULL UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Responses table
CREATE TABLE IF NOT EXISTS `responses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `form_id` INT NOT NULL,
  `answers_json` LONGTEXT NOT NULL,
  `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`form_id`) REFERENCES `forms`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Index for fast slug lookups and form responses
CREATE INDEX IF NOT EXISTS `idx_forms_slug` ON `forms` (`public_slug`);
CREATE INDEX IF NOT EXISTS `idx_responses_form` ON `responses` (`form_id`);
