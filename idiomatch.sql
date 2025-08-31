-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.4.3 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for idiomatch_db
DROP DATABASE IF EXISTS `idiomatch_db`;
CREATE DATABASE IF NOT EXISTS `idiomatch_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `idiomatch_db`;

-- Dumping structure for table idiomatch_db.idioms
DROP TABLE IF EXISTS `idioms`;
CREATE TABLE IF NOT EXISTS `idioms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idiom` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `meaning_id` text COLLATE utf8mb4_general_ci NOT NULL,
  `example_sentence` text COLLATE utf8mb4_general_ci NOT NULL,
  `sentence_translation` text COLLATE utf8mb4_general_ci NOT NULL,
  `example_conversation` text COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table idiomatch_db.idioms: ~3 rows (approximately)
REPLACE INTO `idioms` (`id`, `idiom`, `meaning_id`, `example_sentence`, `sentence_translation`, `example_conversation`) VALUES
	(1, 'Break a leg', 'Semoga berhasil (digunakan untuk mendoakan keberhasilan, terutama sebelum pertunjukan)', 'You have a presentation today, right? Break a leg!', 'Kamu ada presentasi hari ini, kan? Semoga berhasil!', 'A: "I\'m so nervous about my audition." \r\nB: "Don\'t worry, you\'ll be great. Break a leg!"'),
	(2, 'Bite the bullet', 'Menghadapi situasi sulit dengan berani atau tabah', 'I have to work all weekend to finish this project, but I just have to bite the bullet.', 'Aku harus kerja sepanjang akhir pekan untuk menyelesaikan proyek ini, tapi aku harus menghadapinya dengan berani.', 'A: "I hate going to the dentist." \r\nB: "Me too, but we have to bite the bullet for our health."'),
	(3, 'Hit the books', 'Belajar dengan sangat giat', 'I can\'t go out tonight. I have to hit the books for my final exam tomorrow.', 'Aku tidak bisa keluar malam ini. Aku harus belajar giat untuk ujian akhirku besok.', 'A: "Want to watch a movie?" \r\nB: "Sorry, I need to hit the books. Big test on Monday."');

-- Dumping structure for table idiomatch_db.users
DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table idiomatch_db.users: ~1 rows (approximately)
REPLACE INTO `users` (`id`, `username`, `password`) VALUES
	(1, 'admin', '$2a$12$FibclbxtQPgDAQFchaW6Ae.MTnwG3Rl251W..7MYTSf.1dyuXVdsK');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
