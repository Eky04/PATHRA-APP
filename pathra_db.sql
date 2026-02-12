-- =========================================================
-- PATHRA Database Schema
-- AI-Powered Health & Fitness Tracking Application
-- Generated for phpMyAdmin / Laragon MySQL
-- =========================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+08:00";

-- Membuat database
CREATE DATABASE IF NOT EXISTS `pathra_db`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `pathra_db`;

-- =========================================================
-- 1. TABEL USERS (Autentikasi & Profil)
-- =========================================================
CREATE TABLE `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(100) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `avatar` VARCHAR(255) DEFAULT NULL,
  `role` ENUM('admin','user') NOT NULL DEFAULT 'user',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 2. TABEL USER_PROFILES (Target & Preferensi dari Onboarding)
-- =========================================================
CREATE TABLE `user_profiles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `daily_calorie_target` INT NOT NULL DEFAULT 2500,
  `daily_steps_target` INT NOT NULL DEFAULT 10000,
  `daily_water_target` INT NOT NULL DEFAULT 2000 COMMENT 'dalam ml',
  `daily_protein_target` INT NOT NULL DEFAULT 100 COMMENT 'dalam gram',
  `daily_carbs_target` INT NOT NULL DEFAULT 300 COMMENT 'dalam gram',
  `daily_fat_target` INT NOT NULL DEFAULT 80 COMMENT 'dalam gram',
  `favorite_sports` VARCHAR(500) DEFAULT NULL COMMENT 'JSON array, misal ["Jogging","Cycling"]',
  `health_motivation` VARCHAR(255) DEFAULT NULL,
  `onboarding_completed` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_profile` (`user_id`),
  CONSTRAINT `fk_profile_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 3. TABEL BODY_METRICS (Berat Badan, IMT, Body Fat, Muscle)
-- =========================================================
CREATE TABLE `body_metrics` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `weight` DECIMAL(5,2) DEFAULT NULL COMMENT 'dalam kg',
  `bmi` DECIMAL(4,1) DEFAULT NULL,
  `body_fat` DECIMAL(4,1) DEFAULT NULL COMMENT 'dalam %',
  `muscle_mass` DECIMAL(5,2) DEFAULT NULL COMMENT 'dalam kg',
  `weight_target` DECIMAL(5,2) DEFAULT NULL,
  `bmi_target` DECIMAL(4,1) DEFAULT NULL,
  `body_fat_target` DECIMAL(4,1) DEFAULT NULL,
  `muscle_target` DECIMAL(5,2) DEFAULT NULL,
  `recorded_at` DATE NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_body_user_date` (`user_id`, `recorded_at`),
  CONSTRAINT `fk_body_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 4. TABEL FOOD_ITEMS (Database Makanan)
-- =========================================================
CREATE TABLE `food_items` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(200) NOT NULL,
  `calories` INT NOT NULL DEFAULT 0,
  `protein` DECIMAL(6,2) NOT NULL DEFAULT 0 COMMENT 'dalam gram',
  `carbs` DECIMAL(6,2) NOT NULL DEFAULT 0 COMMENT 'dalam gram',
  `fat` DECIMAL(6,2) NOT NULL DEFAULT 0 COMMENT 'dalam gram',
  `portion` VARCHAR(100) DEFAULT NULL COMMENT 'misal: 1 piring, 150g',
  `image` VARCHAR(255) DEFAULT NULL,
  `category` VARCHAR(100) DEFAULT NULL,
  `is_popular` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_food_name` (`name`),
  KEY `idx_food_popular` (`is_popular`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 5. TABEL FOOD_LOGS (Log Makanan Harian User)
-- =========================================================
CREATE TABLE `food_logs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `food_item_id` INT UNSIGNED DEFAULT NULL,
  `food_name` VARCHAR(200) NOT NULL COMMENT 'nama makanan (bisa custom)',
  `meal_category` ENUM('sarapan','makan_siang','makan_malam','snack') NOT NULL DEFAULT 'snack',
  `calories` INT NOT NULL DEFAULT 0,
  `protein` DECIMAL(6,2) NOT NULL DEFAULT 0,
  `carbs` DECIMAL(6,2) NOT NULL DEFAULT 0,
  `fat` DECIMAL(6,2) NOT NULL DEFAULT 0,
  `portion` VARCHAR(100) DEFAULT NULL,
  `photo_url` VARCHAR(500) DEFAULT NULL COMMENT 'foto makanan yang diupload',
  `logged_at` DATETIME NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_foodlog_user_date` (`user_id`, `logged_at`),
  CONSTRAINT `fk_foodlog_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_foodlog_item` FOREIGN KEY (`food_item_id`) REFERENCES `food_items` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 6. TABEL ACTIVITY_LOGS (Log Aktivitas Fisik)
-- =========================================================
CREATE TABLE `activity_logs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `activity_type` VARCHAR(100) NOT NULL COMMENT 'Jogging, Cycling, Gym, Renang, dll',
  `duration` INT NOT NULL DEFAULT 0 COMMENT 'dalam menit',
  `calories_burned` INT NOT NULL DEFAULT 0,
  `distance` DECIMAL(6,2) DEFAULT NULL COMMENT 'dalam km',
  `avg_heart_rate` INT DEFAULT NULL COMMENT 'BPM',
  `logged_at` DATETIME NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_activity_user_date` (`user_id`, `logged_at`),
  KEY `idx_activity_type` (`activity_type`),
  CONSTRAINT `fk_activity_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 7. TABEL WATER_LOGS (Log Air Minum)
-- =========================================================
CREATE TABLE `water_logs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `amount` INT NOT NULL COMMENT 'dalam ml',
  `logged_at` DATETIME NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_water_user_date` (`user_id`, `logged_at`),
  CONSTRAINT `fk_water_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 8. TABEL DAILY_STATS (Ringkasan Harian)
-- =========================================================
CREATE TABLE `daily_stats` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `stat_date` DATE NOT NULL,
  `total_calories_consumed` INT NOT NULL DEFAULT 0,
  `total_calories_burned` INT NOT NULL DEFAULT 0,
  `total_steps` INT NOT NULL DEFAULT 0,
  `total_water_ml` INT NOT NULL DEFAULT 0,
  `total_activities` INT NOT NULL DEFAULT 0,
  `total_protein` DECIMAL(6,2) NOT NULL DEFAULT 0,
  `total_carbs` DECIMAL(6,2) NOT NULL DEFAULT 0,
  `total_fat` DECIMAL(6,2) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_daily_user_date` (`user_id`, `stat_date`),
  CONSTRAINT `fk_daily_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 9. TABEL COMMUNITY_POSTS (Postingan Komunitas)
-- =========================================================
CREATE TABLE `community_posts` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `content` TEXT NOT NULL,
  `image_url` VARCHAR(500) DEFAULT NULL,
  `likes_count` INT NOT NULL DEFAULT 0,
  `comments_count` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_post_user` (`user_id`),
  KEY `idx_post_created` (`created_at`),
  CONSTRAINT `fk_post_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 10. TABEL POST_LIKES (Like pada Postingan)
-- =========================================================
CREATE TABLE `post_likes` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `post_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_like_post_user` (`post_id`, `user_id`),
  CONSTRAINT `fk_like_post` FOREIGN KEY (`post_id`) REFERENCES `community_posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_like_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 11. TABEL POST_COMMENTS (Komentar pada Postingan)
-- =========================================================
CREATE TABLE `post_comments` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `post_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `content` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_comment_post` (`post_id`),
  CONSTRAINT `fk_comment_post` FOREIGN KEY (`post_id`) REFERENCES `community_posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comment_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 12. TABEL CHALLENGES (Tantangan Komunitas)
-- =========================================================
CREATE TABLE `challenges` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `icon` VARCHAR(50) DEFAULT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `created_by` INT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_challenge_dates` (`start_date`, `end_date`),
  CONSTRAINT `fk_challenge_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 13. TABEL CHALLENGE_PARTICIPANTS (Peserta Challenge)
-- =========================================================
CREATE TABLE `challenge_participants` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `challenge_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `progress` INT NOT NULL DEFAULT 0 COMMENT 'persentase 0-100',
  `joined_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_challenge_user` (`challenge_id`, `user_id`),
  CONSTRAINT `fk_cp_challenge` FOREIGN KEY (`challenge_id`) REFERENCES `challenges` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cp_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 14. TABEL LEADERBOARD (Poin & Streak Pengguna)
-- =========================================================
CREATE TABLE `leaderboard` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `total_points` INT NOT NULL DEFAULT 0,
  `current_streak` INT NOT NULL DEFAULT 0 COMMENT 'hari berturut-turut aktif',
  `longest_streak` INT NOT NULL DEFAULT 0,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_leaderboard_user` (`user_id`),
  KEY `idx_leaderboard_points` (`total_points` DESC),
  CONSTRAINT `fk_leaderboard_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 15. TABEL ACHIEVEMENTS (Definisi Pencapaian)
-- =========================================================
CREATE TABLE `achievements` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `icon` VARCHAR(50) DEFAULT NULL,
  `criteria` VARCHAR(500) DEFAULT NULL COMMENT 'deskripsi syarat pencapaian',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 16. TABEL USER_ACHIEVEMENTS (Pencapaian yang Diperoleh User)
-- =========================================================
CREATE TABLE `user_achievements` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `achievement_id` INT UNSIGNED NOT NULL,
  `unlocked_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_achievement` (`user_id`, `achievement_id`),
  CONSTRAINT `fk_ua_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ua_achievement` FOREIGN KEY (`achievement_id`) REFERENCES `achievements` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 17. TABEL COACH_CONVERSATIONS (Percakapan dengan AI Coach)
-- =========================================================
CREATE TABLE `coach_conversations` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `started_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_convo_user` (`user_id`),
  CONSTRAINT `fk_convo_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 18. TABEL COACH_MESSAGES (Pesan dalam Percakapan AI Coach)
-- =========================================================
CREATE TABLE `coach_messages` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `conversation_id` INT UNSIGNED NOT NULL,
  `sender_type` ENUM('user','ai') NOT NULL,
  `content` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_msg_convo` (`conversation_id`, `created_at`),
  CONSTRAINT `fk_msg_convo` FOREIGN KEY (`conversation_id`) REFERENCES `coach_conversations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- DATA AWAL (Seed Data)
-- =========================================================

-- Admin account (username: eky admin, password: admin gacor)
-- Password di-hash dengan bcrypt di production, plaintext di sini untuk demo
INSERT INTO `users` (`id`, `username`, `password`, `name`, `email`, `role`) VALUES
(1, 'eky admin', 'admin gacor', 'Eky Admin', 'admin@pathra.app', 'admin');

-- Profil admin
INSERT INTO `user_profiles` (`user_id`, `daily_calorie_target`, `daily_steps_target`, `daily_water_target`, `onboarding_completed`) VALUES
(1, 2500, 10000, 2000, 1);

-- Leaderboard admin
INSERT INTO `leaderboard` (`user_id`, `total_points`, `current_streak`) VALUES
(1, 0, 0);

-- =========================================================
-- Data makanan populer
-- =========================================================
INSERT INTO `food_items` (`name`, `calories`, `protein`, `carbs`, `fat`, `portion`, `image`, `is_popular`) VALUES
('Nasi Goreng Sayuran', 450, 15.00, 65.00, 12.00, '1 piring', '🍚', 1),
('Ayam Grilled', 250, 35.00, 0.00, 8.00, '150g', '🍗', 1),
('Salad Sayuran Segar', 120, 8.00, 18.00, 3.00, '1 mangkuk', '🥗', 1),
('Apel Merah', 95, 0.00, 25.00, 0.00, '1 buah', '🍎', 1);

-- =========================================================
-- Data achievements
-- =========================================================
INSERT INTO `achievements` (`title`, `description`, `icon`, `criteria`) VALUES
('Pemula Sehat', 'Selesaikan 7 hari pertama', '🌱', 'Aktif selama 7 hari berturut-turut'),
('10K Hero', 'Capai 10,000 langkah dalam sehari', '🚀', 'Total langkah >= 10000 dalam satu hari'),
('Konsisten 14 Hari', 'Log aktivitas 14 hari berturut-turut', '🔥', 'Log aktivitas 14 hari berturut-turut'),
('Master Nutrition', 'Log makanan 50 kali', '🏆', 'Total food_logs >= 50');

-- =========================================================
-- Data challenges contoh
-- =========================================================
INSERT INTO `challenges` (`title`, `description`, `icon`, `start_date`, `end_date`, `created_by`) VALUES
('30 Hari Sehat', 'Konsumsi 5 porsi buah dan sayuran setiap hari selama 30 hari', '🥗', '2026-02-15', '2026-03-15', 1),
('Running Challenge', 'Jogging minimal 5km setiap hari atau 20km per minggu', '🏃', '2026-02-15', '2026-03-22', 1),
('Gym Warrior', 'Latihan gym 4 hari per minggu selama 2 bulan', '💪', '2026-02-15', '2026-04-30', 1);

COMMIT;
