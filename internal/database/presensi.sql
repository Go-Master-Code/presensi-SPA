-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.4.6 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.11.0.7065
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for presensi
DROP DATABASE IF EXISTS `presensi`;
CREATE DATABASE IF NOT EXISTS `presensi` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `presensi`;

-- Dumping structure for table presensi.agama
DROP TABLE IF EXISTS `agama`;
CREATE TABLE IF NOT EXISTS `agama` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama_agama` varchar(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table presensi.agama: ~2 rows (approximately)
INSERT INTO `agama` (`id`, `nama_agama`) VALUES
	(1, 'Kristen'),
	(2, 'Islam');

-- Dumping structure for table presensi.audit_log
DROP TABLE IF EXISTS `audit_log`;
CREATE TABLE IF NOT EXISTS `audit_log` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `action` varchar(50) NOT NULL,
  `target_table` varchar(50) NOT NULL,
  `target_id` varchar(50) NOT NULL,
  `old_data` json DEFAULT NULL,
  `new_data` json DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table presensi.audit_log: ~0 rows (approximately)

-- Dumping structure for table presensi.jenis_ijin
DROP TABLE IF EXISTS `jenis_ijin`;
CREATE TABLE IF NOT EXISTS `jenis_ijin` (
  `id` int NOT NULL AUTO_INCREMENT,
  `kode` varchar(20) NOT NULL,
  `nama` varchar(50) NOT NULL,
  `aktif` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `kode` (`kode`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table presensi.jenis_ijin: ~4 rows (approximately)
INSERT INTO `jenis_ijin` (`id`, `kode`, `nama`, `aktif`) VALUES
	(1, 'sakit', 'Ijin Sakit', 1),
	(2, 'dinas', 'Ijin Dinas Luar', 1),
	(3, 'cuti', 'Cuti Tahunan', 1),
	(4, 'kedukaan', 'Kedukaan Keluarga Inti', 1);

-- Dumping structure for table presensi.jenjang
DROP TABLE IF EXISTS `jenjang`;
CREATE TABLE IF NOT EXISTS `jenjang` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama` varchar(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table presensi.jenjang: ~2 rows (approximately)
INSERT INTO `jenjang` (`id`, `nama`) VALUES
	(1, 'SD'),
	(2, 'SMP'),
	(3, 'SMA');

-- Dumping structure for table presensi.karyawan
DROP TABLE IF EXISTS `karyawan`;
CREATE TABLE IF NOT EXISTS `karyawan` (
  `id` char(10) NOT NULL,
  `nama` varchar(50) NOT NULL,
  `jenjang_id` int NOT NULL,
  `aktif` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_karyawan_jenjang` (`jenjang_id`),
  CONSTRAINT `FK_karyawan_jenjang` FOREIGN KEY (`jenjang_id`) REFERENCES `jenjang` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table presensi.karyawan: ~4 rows (approximately)
INSERT INTO `karyawan` (`id`, `nama`, `jenjang_id`, `aktif`, `created_at`, `updated_at`, `deleted_at`) VALUES
	('1234567897', 'Apriany', 1, 1, '2025-09-28 13:50:27', '2025-09-30 17:41:26', NULL),
	('4846125781', 'Supriyadi', 3, 1, '2025-09-30 18:18:08', '2025-09-30 18:54:29', NULL),
	('4846125793', 'Maman Abdurahman', 2, 1, '2025-09-30 18:16:22', '2025-09-30 18:16:22', NULL),
	('9874561231', 'Nina', 1, 1, '2025-09-28 13:50:27', '2025-09-30 18:06:13', NULL);

-- Dumping structure for table presensi.kota
DROP TABLE IF EXISTS `kota`;
CREATE TABLE IF NOT EXISTS `kota` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama_kota` varchar(15) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table presensi.kota: ~0 rows (approximately)
INSERT INTO `kota` (`id`, `nama_kota`) VALUES
	(1, 'Bandung');

-- Dumping structure for table presensi.pegawai
DROP TABLE IF EXISTS `pegawai`;
CREATE TABLE IF NOT EXISTS `pegawai` (
  `id` char(10) NOT NULL,
  `nama` varchar(50) NOT NULL,
  `nik` char(16) NOT NULL DEFAULT '',
  `jk` char(1) NOT NULL,
  `id_tempat_lahir` int NOT NULL,
  `tanggal_lahir` date NOT NULL,
  `id_status_kepegawaian` int NOT NULL,
  `id_jenis_ptk` int NOT NULL,
  `id_agama` int NOT NULL,
  `alamat` varchar(100) NOT NULL,
  `hp` varchar(15) NOT NULL,
  `email` varchar(40) NOT NULL,
  `sk_pengangkatan` varchar(25) NOT NULL,
  `tmt_pengangkatan` date NOT NULL,
  `id_status` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table presensi.pegawai: ~0 rows (approximately)

-- Dumping structure for table presensi.presensi_karyawan
DROP TABLE IF EXISTS `presensi_karyawan`;
CREATE TABLE IF NOT EXISTS `presensi_karyawan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `karyawan_id` char(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `tanggal` date NOT NULL,
  `waktu_masuk` time DEFAULT NULL,
  `waktu_pulang` time DEFAULT NULL,
  `keterangan` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_absensi` (`karyawan_id`,`tanggal`),
  CONSTRAINT `FK_presensi_karyawan_karyawan` FOREIGN KEY (`karyawan_id`) REFERENCES `karyawan` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table presensi.presensi_karyawan: ~0 rows (approximately)
INSERT INTO `presensi_karyawan` (`id`, `karyawan_id`, `tanggal`, `waktu_masuk`, `waktu_pulang`, `keterangan`, `created_at`, `updated_at`, `deleted_at`) VALUES
	(1, '1234567897', '2025-10-01', '07:00:00', '15:00:13', NULL, '2025-10-01 10:50:06', '2025-10-01 10:50:31', NULL),
	(2, '1234567897', '2025-09-30', '06:50:31', '15:16:08', NULL, '2025-10-01 12:15:27', '2025-10-01 12:15:27', NULL),
	(3, '9874561231', '2025-10-01', '06:50:13', '16:05:12', 'Lembur', '2025-10-01 12:36:37', '2025-10-01 12:36:37', NULL);

-- Dumping structure for table presensi.ptk
DROP TABLE IF EXISTS `ptk`;
CREATE TABLE IF NOT EXISTS `ptk` (
  `id` int NOT NULL AUTO_INCREMENT,
  `jenis_ptk` varchar(25) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table presensi.ptk: ~2 rows (approximately)
INSERT INTO `ptk` (`id`, `jenis_ptk`) VALUES
	(1, 'Kepala Sekolah'),
	(2, 'Tenaga Kependidikan');

-- Dumping structure for table presensi.role
DROP TABLE IF EXISTS `role`;
CREATE TABLE IF NOT EXISTS `role` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama` varchar(10) NOT NULL,
  `deskripsi` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table presensi.role: ~4 rows (approximately)
INSERT INTO `role` (`id`, `nama`, `deskripsi`) VALUES
	(1, 'admin', 'Memiliki akses penuh ke seluruh sistem: mengelola data pegawai, user, absensi, dan laporan.'),
	(2, 'kepsek', 'Dapat melihat dan memonitor data absensi seluruh pegawai, serta mengakses laporan ringkasan.'),
	(3, 'tu', 'Bertugas mengelola data administrasi pegawai dan absensi, dapat menginput, mengedit, dan menghapus data absensi, namun tidak memiliki akses untuk melihat laporan keseluruhan seperti kepala sekolah.'),
	(4, 'pegawai', 'Hanya dapat melakukan absensi sendiri dan melihat riwayat absensi pribadi.');

-- Dumping structure for table presensi.status_nikah
DROP TABLE IF EXISTS `status_nikah`;
CREATE TABLE IF NOT EXISTS `status_nikah` (
  `id` int NOT NULL AUTO_INCREMENT,
  `status` varchar(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table presensi.status_nikah: ~4 rows (approximately)
INSERT INTO `status_nikah` (`id`, `status`) VALUES
	(1, 'Belum Kawin'),
	(2, 'Kawin'),
	(3, 'Janda'),
	(4, 'Duda');

-- Dumping structure for table presensi.status_pegawai
DROP TABLE IF EXISTS `status_pegawai`;
CREATE TABLE IF NOT EXISTS `status_pegawai` (
  `id` int NOT NULL AUTO_INCREMENT,
  `jenis_status` varchar(25) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table presensi.status_pegawai: ~2 rows (approximately)
INSERT INTO `status_pegawai` (`id`, `jenis_status`) VALUES
	(1, 'GTY/PTY'),
	(2, 'Tenaga Honor Sekolah');

-- Dumping structure for table presensi.user
DROP TABLE IF EXISTS `user`;
CREATE TABLE IF NOT EXISTS `user` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(50) DEFAULT NULL,
  `username` varchar(15) DEFAULT NULL,
  `password` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `role_id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `FK_user_role` (`role_id`),
  CONSTRAINT `FK_user_role` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table presensi.user: ~7 rows (approximately)
INSERT INTO `user` (`id`, `email`, `username`, `password`, `role_id`, `created_at`, `updated_at`, `deleted_at`) VALUES
	(1, 'kevinkristansa@gmail.com', 'kevin', '$2a$10$0d31z5ynSiPYlMYOUc0I3ep2QrAFibPAog.WrAjVAypNg/Y0XSvz6', 1, '2025-09-28 14:01:45', '2025-09-29 12:21:20', NULL),
	(2, 'apriany@gmail.com', 'apri', '$2a$10$FYRcK9.uYoqBnM8PXQJ96u9vvcbcoUfcINcOeMP5rlo8RVVrE6RBW', 2, '2025-09-28 16:03:27', '2025-09-28 18:41:03', NULL),
	(3, 'nina@gmail.com', 'nina', '$2a$10$NBzAMxqGpV0MdigrkbQLAev3zJQTM00EILz/mG3FEU2M4Vtk3zU/u', 4, '2025-09-28 16:59:05', '2025-09-28 11:35:12', NULL),
	(4, 'erna@gmail.com', 'erna', '$2a$10$tnRRQNdRg83OjQtEBriY4ueqIyjUm.kjmv11G7PYuFDig8KQATUAy', 4, '2025-09-28 17:18:51', '2025-09-28 11:35:22', NULL),
	(5, 'pina@gmail.com', 'pina wibawa', '$2a$10$0FeR/jcS6d6TIdPxfViGSeA1/7e4mpllL1d7bf24xF9S2oxy.6WFe', 4, '2025-09-28 10:43:24', '2025-09-28 11:35:28', NULL),
	(6, 'bambang@gmail.com', 'Bambang Sukoco', '$2a$10$/1LBv76fvILV0sPdsEInfu3Lzf/Lg38zYxUW1SkPwenbkI2NWXHTq', 3, '2025-09-28 10:44:48', '2025-09-28 11:35:58', NULL),
	(9, 'jackson@gmail.com', 'jackson', '$2a$10$gdVjsMshRRcAwTV2RFUyceOAd4N9QxRlbeVwTPzgymceqJWsNril2', 3, '2025-09-28 11:32:20', '2025-09-28 11:32:20', NULL);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
