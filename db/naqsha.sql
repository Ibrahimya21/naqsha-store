-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Generation Time: May 13, 2026 at 12:11 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `naqsha`
--

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `product_variant_id` int(10) UNSIGNED NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(120) NOT NULL,
  `slug` varchar(150) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `created_at`, `updated_at`) VALUES
(1, 'رجال', 'men', '2026-05-13 08:52:51', '2026-05-13 08:52:51'),
(2, 'نساء', 'women', '2026-05-13 08:52:51', '2026-05-13 08:52:51'),
(3, 'أطفال', 'kids', '2026-05-13 08:52:51', '2026-05-13 08:52:51');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(10) UNSIGNED NOT NULL,
  `order_number` varchar(80) NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `customer_name` varchar(150) NOT NULL,
  `customer_email` varchar(190) NOT NULL,
  `customer_phone` varchar(50) NOT NULL,
  `city` varchar(100) NOT NULL,
  `address_line` varchar(255) NOT NULL,
  `notes` text DEFAULT NULL,
  `payment_method` enum('bank_transfer','jawwal_pay','palpay') NOT NULL,
  `status` enum('pending','paid','approved','processing','shipped','completed','cancelled','rejected') NOT NULL DEFAULT 'pending',
  `subtotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `shipping_fee` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `order_number`, `user_id`, `customer_name`, `customer_email`, `customer_phone`, `city`, `address_line`, `notes`, `payment_method`, `status`, `subtotal`, `shipping_fee`, `total_amount`, `created_at`, `updated_at`) VALUES
(1, 'NQ-1778664141702', 2, 'Ibrahim Awad', 'ibrahim20awad@gmail.com', '+970597365578', 'Gaza', 'Alnasser', '', 'bank_transfer', 'rejected', 500.00, 15.00, 515.00, '2026-05-13 09:22:21', '2026-05-13 09:44:05'),
(2, 'NQ-1778665508012', 2, 'Ibrahim Awad', 'ibrahim20awad@gmail.com', '+970597365578', 'Gaza', 'Alnasser', '', 'bank_transfer', 'rejected', 500.00, 15.00, 515.00, '2026-05-13 09:45:08', '2026-05-13 09:45:21'),
(3, 'NQ-1778666808708', 2, 'Ibrahim Awad', 'ibrahim20awad@gmail.com', '+970597365578', 'null', 'Alnasser', '', 'bank_transfer', 'pending', 44.00, 15.00, 59.00, '2026-05-13 10:06:48', '2026-05-13 10:06:48'),
(4, 'NQ-1778666993157', 2, 'Ibrahim Awad', 'ibrahim20awad@gmail.com', '+970597365578', 'غزة', 'Alnasser', '', 'bank_transfer', 'pending', 44.00, 15.00, 59.00, '2026-05-13 10:09:53', '2026-05-13 10:09:53');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(10) UNSIGNED NOT NULL,
  `order_id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `product_variant_id` int(10) UNSIGNED NOT NULL,
  `product_name` varchar(190) NOT NULL,
  `product_image` varchar(500) DEFAULT NULL,
  `size` varchar(50) DEFAULT NULL,
  `color` varchar(80) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `unit_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `line_total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_variant_id`, `product_name`, `product_image`, `size`, `color`, `quantity`, `unit_price`, `line_total`, `created_at`) VALUES
(1, 1, 1, 1, 'بطلون تكتيكي', '/uploads/products/product-1778663178433-892878217.jpg', '30', 'White', 5, 100.00, 500.00, '2026-05-13 09:22:21'),
(2, 2, 1, 2, 'بطلون تكتيكي', '/uploads/products/product-1778663178433-892878217.jpg', '31', 'White', 5, 100.00, 500.00, '2026-05-13 09:45:08'),
(3, 3, 6, 97, 'تيشيرت قطن', '/uploads/products/product-1778663512602-888728380.jpg', 'S', 'Black', 1, 44.00, 44.00, '2026-05-13 10:06:48'),
(4, 4, 6, 107, 'تيشيرت قطن', '/uploads/products/product-1778663512617-817971148.webp', 'S', 'Navy', 1, 44.00, 44.00, '2026-05-13 10:09:53');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `password_reset_tokens`
--

INSERT INTO `password_reset_tokens` (`id`, `user_id`, `token`, `expires_at`, `used_at`, `created_at`) VALUES
(1, 1, 'a649b224f613e444d07d753d8bbf9efca6994a9745b71612f14f0cd2f57b26a8', '2026-05-13 12:14:45', '2026-05-13 12:00:15', '2026-05-13 08:59:45');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(10) UNSIGNED NOT NULL,
  `order_id` int(10) UNSIGNED NOT NULL,
  `provider` enum('bank_transfer','jawwal_pay','palpay') NOT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `reference_number` varchar(150) DEFAULT NULL,
  `payer_name` varchar(150) DEFAULT NULL,
  `payer_phone` varchar(50) DEFAULT NULL,
  `receipt_image_url` varchar(500) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `admin_note` text DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `order_id`, `provider`, `amount`, `reference_number`, `payer_name`, `payer_phone`, `receipt_image_url`, `notes`, `status`, `admin_note`, `reviewed_at`, `created_at`, `updated_at`) VALUES
(2, 2, 'bank_transfer', 515.00, '1212121233', 'YASER AWAD', '+970597365578', '/uploads/payments/1778665507987-688149854.png', 'تم الرفض من لوحة التحكم', 'rejected', NULL, NULL, '2026-05-13 09:45:08', '2026-05-13 09:45:21'),
(3, 3, 'bank_transfer', 59.00, '1212121233', 'Ibrahim Awad', '+970597365578', '/uploads/payments/1778666808682-557074190.png', '', 'pending', NULL, NULL, '2026-05-13 10:06:48', '2026-05-13 10:06:48'),
(4, 4, 'bank_transfer', 59.00, '1212121233', 'Ibrahim Awad', '+970597365578', '/uploads/payments/1778666993143-669660264.png', '', 'pending', NULL, NULL, '2026-05-13 10:09:53', '2026-05-13 10:09:53');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(10) UNSIGNED NOT NULL,
  `category_id` int(10) UNSIGNED NOT NULL,
  `name` varchar(190) NOT NULL,
  `slug` varchar(220) NOT NULL,
  `description` text DEFAULT NULL,
  `base_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `main_image` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `category_id`, `name`, `slug`, `description`, `base_price`, `main_image`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'بطلون تكتيكي', 'بطلون-تكتيكي', '', 100.00, '/uploads/products/product-1778663178424-465384798.jpg', 1, '2026-05-13 09:03:18', '2026-05-13 09:06:18'),
(2, 1, 'بلوزة قطن', 'بلوزة-قطن', '', 65.00, '/uploads/products/product-1778663138750-529108963.jpg', 1, '2026-05-13 09:04:14', '2026-05-13 09:05:38'),
(3, 1, 'هودي شتوي', 'هودي-شتوي', NULL, 120.00, '/uploads/products/product-1778663277792-726114230.webp', 1, '2026-05-13 09:07:57', '2026-05-13 09:07:57'),
(4, 2, 'فستان نسائي ناعم', 'فستان-نسائي-ناعم', NULL, 125.00, '/uploads/products/product-1778663355310-598736620.jpg', 1, '2026-05-13 09:09:15', '2026-05-13 09:09:15'),
(5, 1, 'بطلون رياضي', 'بطلون-رياضي', NULL, 50.00, '/uploads/products/product-1778663424188-12743782.jpg', 1, '2026-05-13 09:10:24', '2026-05-13 09:10:24'),
(6, 1, 'تيشيرت قطن', 'تيشيرت-قطن', NULL, 44.00, '/uploads/products/product-1778663512595-16207318.jpg', 1, '2026-05-13 09:11:52', '2026-05-13 09:11:52'),
(7, 3, 'ترنق اطفال', 'ترنق-اطفال', NULL, 70.00, '/uploads/products/product-1778663583476-525777112.png', 1, '2026-05-13 09:13:03', '2026-05-13 09:13:03'),
(8, 3, 'جاكيت شتوي اطفال', 'جاكيت-شتوي-اطفال', NULL, 80.00, '/uploads/products/product-1778663732547-107530090.png', 1, '2026-05-13 09:15:32', '2026-05-13 09:15:32'),
(9, 2, 'عباءة نسائية', 'عباءة-نسائية', NULL, 150.00, '/uploads/products/product-1778663792838-864363873.png', 1, '2026-05-13 09:16:32', '2026-05-13 09:16:32');

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `product_variant_id` int(10) UNSIGNED DEFAULT NULL,
  `image_url` varchar(500) NOT NULL,
  `is_main` tinyint(1) NOT NULL DEFAULT 0,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_images`
--

INSERT INTO `product_images` (`id`, `product_id`, `product_variant_id`, `image_url`, `is_main`, `sort_order`, `created_at`) VALUES
(42, 2, NULL, '/uploads/products/product-1778663138750-529108963.jpg', 1, 0, '2026-05-13 09:05:38'),
(43, 2, 25, '/uploads/products/product-1778663138760-728280293.jpg', 0, 1, '2026-05-13 09:05:38'),
(44, 2, 26, '/uploads/products/product-1778663138760-728280293.jpg', 0, 2, '2026-05-13 09:05:38'),
(45, 2, 27, '/uploads/products/product-1778663138760-728280293.jpg', 0, 3, '2026-05-13 09:05:38'),
(46, 2, 28, '/uploads/products/product-1778663138760-728280293.jpg', 0, 4, '2026-05-13 09:05:38'),
(47, 2, 29, '/uploads/products/product-1778663138760-728280293.jpg', 0, 5, '2026-05-13 09:05:38'),
(48, 2, 30, '/uploads/products/product-1778663138767-105187196.jpg', 0, 1, '2026-05-13 09:05:38'),
(49, 2, 31, '/uploads/products/product-1778663138767-105187196.jpg', 0, 2, '2026-05-13 09:05:38'),
(50, 2, 32, '/uploads/products/product-1778663138767-105187196.jpg', 0, 3, '2026-05-13 09:05:38'),
(51, 2, 33, '/uploads/products/product-1778663138767-105187196.jpg', 0, 4, '2026-05-13 09:05:38'),
(52, 2, 34, '/uploads/products/product-1778663138767-105187196.jpg', 0, 5, '2026-05-13 09:05:38'),
(53, 2, 35, '/uploads/products/product-1778663138774-788845707.jpg', 0, 1, '2026-05-13 09:05:38'),
(54, 2, 36, '/uploads/products/product-1778663138774-788845707.jpg', 0, 2, '2026-05-13 09:05:38'),
(55, 2, 37, '/uploads/products/product-1778663138774-788845707.jpg', 0, 3, '2026-05-13 09:05:38'),
(56, 2, 38, '/uploads/products/product-1778663138774-788845707.jpg', 0, 4, '2026-05-13 09:05:38'),
(57, 2, 39, '/uploads/products/product-1778663138774-788845707.jpg', 0, 5, '2026-05-13 09:05:38'),
(58, 1, NULL, '/uploads/products/product-1778663178424-465384798.jpg', 1, 0, '2026-05-13 09:06:18'),
(59, 1, 1, '/uploads/products/product-1778663178433-892878217.jpg', 0, 1, '2026-05-13 09:06:18'),
(60, 1, 2, '/uploads/products/product-1778663178433-892878217.jpg', 0, 2, '2026-05-13 09:06:18'),
(61, 1, 3, '/uploads/products/product-1778663178433-892878217.jpg', 0, 3, '2026-05-13 09:06:18'),
(62, 1, 4, '/uploads/products/product-1778663178433-892878217.jpg', 0, 4, '2026-05-13 09:06:18'),
(63, 1, 5, '/uploads/products/product-1778663178433-892878217.jpg', 0, 5, '2026-05-13 09:06:18'),
(64, 1, 6, '/uploads/products/product-1778663178433-892878217.jpg', 0, 6, '2026-05-13 09:06:18'),
(65, 1, 7, '/uploads/products/product-1778663178439-615473992.jpg', 0, 1, '2026-05-13 09:06:18'),
(66, 1, 8, '/uploads/products/product-1778663178439-615473992.jpg', 0, 2, '2026-05-13 09:06:18'),
(67, 1, 9, '/uploads/products/product-1778663178439-615473992.jpg', 0, 3, '2026-05-13 09:06:18'),
(68, 1, 10, '/uploads/products/product-1778663178439-615473992.jpg', 0, 4, '2026-05-13 09:06:18'),
(69, 1, 11, '/uploads/products/product-1778663178439-615473992.jpg', 0, 5, '2026-05-13 09:06:18'),
(70, 1, 12, '/uploads/products/product-1778663178439-615473992.jpg', 0, 6, '2026-05-13 09:06:18'),
(71, 1, 13, '/uploads/products/product-1778663178447-142143055.jpg', 0, 1, '2026-05-13 09:06:18'),
(72, 1, 14, '/uploads/products/product-1778663178447-142143055.jpg', 0, 2, '2026-05-13 09:06:18'),
(73, 1, 15, '/uploads/products/product-1778663178447-142143055.jpg', 0, 3, '2026-05-13 09:06:18'),
(74, 1, 16, '/uploads/products/product-1778663178447-142143055.jpg', 0, 4, '2026-05-13 09:06:18'),
(75, 1, 17, '/uploads/products/product-1778663178447-142143055.jpg', 0, 5, '2026-05-13 09:06:18'),
(76, 1, 18, '/uploads/products/product-1778663178447-142143055.jpg', 0, 6, '2026-05-13 09:06:18'),
(77, 1, 19, '/uploads/products/product-1778663178455-225182593.jpg', 0, 1, '2026-05-13 09:06:18'),
(78, 1, 20, '/uploads/products/product-1778663178455-225182593.jpg', 0, 2, '2026-05-13 09:06:18'),
(79, 1, 21, '/uploads/products/product-1778663178455-225182593.jpg', 0, 3, '2026-05-13 09:06:18'),
(80, 1, 22, '/uploads/products/product-1778663178455-225182593.jpg', 0, 4, '2026-05-13 09:06:18'),
(81, 1, 23, '/uploads/products/product-1778663178455-225182593.jpg', 0, 5, '2026-05-13 09:06:18'),
(82, 1, 24, '/uploads/products/product-1778663178455-225182593.jpg', 0, 6, '2026-05-13 09:06:18'),
(83, 3, NULL, '/uploads/products/product-1778663277792-726114230.webp', 1, 0, '2026-05-13 09:07:57'),
(84, 3, 40, '/uploads/products/product-1778663277799-335234980.webp', 0, 1, '2026-05-13 09:07:57'),
(85, 3, 41, '/uploads/products/product-1778663277799-335234980.webp', 0, 2, '2026-05-13 09:07:57'),
(86, 3, 42, '/uploads/products/product-1778663277799-335234980.webp', 0, 3, '2026-05-13 09:07:57'),
(87, 3, 43, '/uploads/products/product-1778663277799-335234980.webp', 0, 4, '2026-05-13 09:07:57'),
(88, 3, 44, '/uploads/products/product-1778663277799-335234980.webp', 0, 5, '2026-05-13 09:07:57'),
(89, 3, 45, '/uploads/products/product-1778663277806-789869207.webp', 0, 1, '2026-05-13 09:07:57'),
(90, 3, 46, '/uploads/products/product-1778663277806-789869207.webp', 0, 2, '2026-05-13 09:07:57'),
(91, 3, 47, '/uploads/products/product-1778663277806-789869207.webp', 0, 3, '2026-05-13 09:07:57'),
(92, 3, 48, '/uploads/products/product-1778663277806-789869207.webp', 0, 4, '2026-05-13 09:07:57'),
(93, 3, 49, '/uploads/products/product-1778663277806-789869207.webp', 0, 5, '2026-05-13 09:07:57'),
(94, 3, 50, '/uploads/products/product-1778663277812-178917849.webp', 0, 1, '2026-05-13 09:07:57'),
(95, 3, 51, '/uploads/products/product-1778663277812-178917849.webp', 0, 2, '2026-05-13 09:07:57'),
(96, 3, 52, '/uploads/products/product-1778663277812-178917849.webp', 0, 3, '2026-05-13 09:07:57'),
(97, 3, 53, '/uploads/products/product-1778663277812-178917849.webp', 0, 4, '2026-05-13 09:07:57'),
(98, 3, 54, '/uploads/products/product-1778663277812-178917849.webp', 0, 5, '2026-05-13 09:07:57'),
(99, 3, 55, '/uploads/products/product-1778663277820-474728420.webp', 0, 1, '2026-05-13 09:07:57'),
(100, 3, 56, '/uploads/products/product-1778663277820-474728420.webp', 0, 2, '2026-05-13 09:07:57'),
(101, 3, 57, '/uploads/products/product-1778663277820-474728420.webp', 0, 3, '2026-05-13 09:07:57'),
(102, 3, 58, '/uploads/products/product-1778663277820-474728420.webp', 0, 4, '2026-05-13 09:07:57'),
(103, 3, 59, '/uploads/products/product-1778663277820-474728420.webp', 0, 5, '2026-05-13 09:07:57'),
(104, 4, NULL, '/uploads/products/product-1778663355310-598736620.jpg', 1, 0, '2026-05-13 09:09:15'),
(105, 4, 60, '/uploads/products/product-1778663355318-271913248.jpg', 0, 1, '2026-05-13 09:09:15'),
(106, 4, 61, '/uploads/products/product-1778663355318-271913248.jpg', 0, 2, '2026-05-13 09:09:15'),
(107, 4, 62, '/uploads/products/product-1778663355318-271913248.jpg', 0, 3, '2026-05-13 09:09:15'),
(108, 4, 63, '/uploads/products/product-1778663355318-271913248.jpg', 0, 4, '2026-05-13 09:09:15'),
(109, 4, 64, '/uploads/products/product-1778663355324-517812651.png', 0, 1, '2026-05-13 09:09:15'),
(110, 4, 65, '/uploads/products/product-1778663355324-517812651.png', 0, 2, '2026-05-13 09:09:15'),
(111, 4, 66, '/uploads/products/product-1778663355324-517812651.png', 0, 3, '2026-05-13 09:09:15'),
(112, 4, 67, '/uploads/products/product-1778663355324-517812651.png', 0, 4, '2026-05-13 09:09:15'),
(113, 4, 68, '/uploads/products/product-1778663355340-46987033.png', 0, 1, '2026-05-13 09:09:15'),
(114, 4, 69, '/uploads/products/product-1778663355340-46987033.png', 0, 2, '2026-05-13 09:09:15'),
(115, 4, 70, '/uploads/products/product-1778663355340-46987033.png', 0, 3, '2026-05-13 09:09:15'),
(116, 4, 71, '/uploads/products/product-1778663355340-46987033.png', 0, 4, '2026-05-13 09:09:15'),
(117, 4, 72, '/uploads/products/product-1778663355356-598333844.png', 0, 1, '2026-05-13 09:09:15'),
(118, 4, 73, '/uploads/products/product-1778663355356-598333844.png', 0, 2, '2026-05-13 09:09:15'),
(119, 4, 74, '/uploads/products/product-1778663355356-598333844.png', 0, 3, '2026-05-13 09:09:15'),
(120, 4, 75, '/uploads/products/product-1778663355356-598333844.png', 0, 4, '2026-05-13 09:09:15'),
(121, 5, NULL, '/uploads/products/product-1778663424188-12743782.jpg', 1, 0, '2026-05-13 09:10:24'),
(122, 5, 76, '/uploads/products/product-1778663424197-973012851.jpg', 0, 1, '2026-05-13 09:10:24'),
(123, 5, 77, '/uploads/products/product-1778663424197-973012851.jpg', 0, 2, '2026-05-13 09:10:24'),
(124, 5, 78, '/uploads/products/product-1778663424197-973012851.jpg', 0, 3, '2026-05-13 09:10:24'),
(125, 5, 79, '/uploads/products/product-1778663424197-973012851.jpg', 0, 4, '2026-05-13 09:10:24'),
(126, 5, 80, '/uploads/products/product-1778663424197-973012851.jpg', 0, 5, '2026-05-13 09:10:24'),
(127, 5, 81, '/uploads/products/product-1778663424197-973012851.jpg', 0, 6, '2026-05-13 09:10:24'),
(128, 5, 82, '/uploads/products/product-1778663424197-973012851.jpg', 0, 7, '2026-05-13 09:10:24'),
(129, 5, 83, '/uploads/products/product-1778663424204-786656642.webp', 0, 1, '2026-05-13 09:10:24'),
(130, 5, 84, '/uploads/products/product-1778663424204-786656642.webp', 0, 2, '2026-05-13 09:10:24'),
(131, 5, 85, '/uploads/products/product-1778663424204-786656642.webp', 0, 3, '2026-05-13 09:10:24'),
(132, 5, 86, '/uploads/products/product-1778663424204-786656642.webp', 0, 4, '2026-05-13 09:10:24'),
(133, 5, 87, '/uploads/products/product-1778663424204-786656642.webp', 0, 5, '2026-05-13 09:10:24'),
(134, 5, 88, '/uploads/products/product-1778663424204-786656642.webp', 0, 6, '2026-05-13 09:10:24'),
(135, 5, 89, '/uploads/products/product-1778663424204-786656642.webp', 0, 7, '2026-05-13 09:10:24'),
(136, 5, 90, '/uploads/products/product-1778663424211-96061606.jpg', 0, 1, '2026-05-13 09:10:24'),
(137, 5, 91, '/uploads/products/product-1778663424211-96061606.jpg', 0, 2, '2026-05-13 09:10:24'),
(138, 5, 92, '/uploads/products/product-1778663424211-96061606.jpg', 0, 3, '2026-05-13 09:10:24'),
(139, 5, 93, '/uploads/products/product-1778663424211-96061606.jpg', 0, 4, '2026-05-13 09:10:24'),
(140, 5, 94, '/uploads/products/product-1778663424211-96061606.jpg', 0, 5, '2026-05-13 09:10:24'),
(141, 5, 95, '/uploads/products/product-1778663424211-96061606.jpg', 0, 6, '2026-05-13 09:10:24'),
(142, 5, 96, '/uploads/products/product-1778663424211-96061606.jpg', 0, 7, '2026-05-13 09:10:24'),
(143, 6, NULL, '/uploads/products/product-1778663512595-16207318.jpg', 1, 0, '2026-05-13 09:11:52'),
(144, 6, 97, '/uploads/products/product-1778663512602-888728380.jpg', 0, 1, '2026-05-13 09:11:52'),
(145, 6, 98, '/uploads/products/product-1778663512602-888728380.jpg', 0, 2, '2026-05-13 09:11:52'),
(146, 6, 99, '/uploads/products/product-1778663512602-888728380.jpg', 0, 3, '2026-05-13 09:11:52'),
(147, 6, 100, '/uploads/products/product-1778663512602-888728380.jpg', 0, 4, '2026-05-13 09:11:52'),
(148, 6, 101, '/uploads/products/product-1778663512602-888728380.jpg', 0, 5, '2026-05-13 09:11:52'),
(149, 6, 102, '/uploads/products/product-1778663512610-390051903.jpg', 0, 1, '2026-05-13 09:11:52'),
(150, 6, 103, '/uploads/products/product-1778663512610-390051903.jpg', 0, 2, '2026-05-13 09:11:52'),
(151, 6, 104, '/uploads/products/product-1778663512610-390051903.jpg', 0, 3, '2026-05-13 09:11:52'),
(152, 6, 105, '/uploads/products/product-1778663512610-390051903.jpg', 0, 4, '2026-05-13 09:11:52'),
(153, 6, 106, '/uploads/products/product-1778663512610-390051903.jpg', 0, 5, '2026-05-13 09:11:52'),
(154, 6, 107, '/uploads/products/product-1778663512617-817971148.webp', 0, 1, '2026-05-13 09:11:52'),
(155, 6, 108, '/uploads/products/product-1778663512617-817971148.webp', 0, 2, '2026-05-13 09:11:52'),
(156, 6, 109, '/uploads/products/product-1778663512617-817971148.webp', 0, 3, '2026-05-13 09:11:52'),
(157, 6, 110, '/uploads/products/product-1778663512617-817971148.webp', 0, 4, '2026-05-13 09:11:52'),
(158, 6, 111, '/uploads/products/product-1778663512617-817971148.webp', 0, 5, '2026-05-13 09:11:52'),
(159, 6, 112, '/uploads/products/product-1778663512627-259251826.jpg', 0, 1, '2026-05-13 09:11:52'),
(160, 6, 113, '/uploads/products/product-1778663512627-259251826.jpg', 0, 2, '2026-05-13 09:11:52'),
(161, 6, 114, '/uploads/products/product-1778663512627-259251826.jpg', 0, 3, '2026-05-13 09:11:52'),
(162, 6, 115, '/uploads/products/product-1778663512627-259251826.jpg', 0, 4, '2026-05-13 09:11:52'),
(163, 6, 116, '/uploads/products/product-1778663512627-259251826.jpg', 0, 5, '2026-05-13 09:11:52'),
(164, 7, NULL, '/uploads/products/product-1778663583476-525777112.png', 1, 0, '2026-05-13 09:13:03'),
(165, 7, 117, '/uploads/products/product-1778663583511-698495443.png', 0, 1, '2026-05-13 09:13:03'),
(166, 7, 118, '/uploads/products/product-1778663583511-698495443.png', 0, 2, '2026-05-13 09:13:03'),
(167, 7, 119, '/uploads/products/product-1778663583511-698495443.png', 0, 3, '2026-05-13 09:13:03'),
(168, 7, 120, '/uploads/products/product-1778663583511-698495443.png', 0, 4, '2026-05-13 09:13:03'),
(169, 7, 121, '/uploads/products/product-1778663583534-981346823.png', 0, 1, '2026-05-13 09:13:03'),
(170, 7, 122, '/uploads/products/product-1778663583534-981346823.png', 0, 2, '2026-05-13 09:13:03'),
(171, 7, 123, '/uploads/products/product-1778663583534-981346823.png', 0, 3, '2026-05-13 09:13:03'),
(172, 7, 124, '/uploads/products/product-1778663583534-981346823.png', 0, 4, '2026-05-13 09:13:03'),
(173, 7, 125, '/uploads/products/product-1778663583543-147015145.webp', 0, 1, '2026-05-13 09:13:03'),
(174, 7, 126, '/uploads/products/product-1778663583543-147015145.webp', 0, 2, '2026-05-13 09:13:03'),
(175, 7, 127, '/uploads/products/product-1778663583543-147015145.webp', 0, 3, '2026-05-13 09:13:03'),
(176, 7, 128, '/uploads/products/product-1778663583543-147015145.webp', 0, 4, '2026-05-13 09:13:03'),
(177, 8, NULL, '/uploads/products/product-1778663732547-107530090.png', 1, 0, '2026-05-13 09:15:32'),
(178, 8, 129, '/uploads/products/product-1778663732574-766646859.webp', 0, 1, '2026-05-13 09:15:32'),
(179, 8, 130, '/uploads/products/product-1778663732574-766646859.webp', 0, 2, '2026-05-13 09:15:32'),
(180, 8, 131, '/uploads/products/product-1778663732574-766646859.webp', 0, 3, '2026-05-13 09:15:32'),
(181, 8, 132, '/uploads/products/product-1778663732580-810050376.png', 0, 1, '2026-05-13 09:15:32'),
(182, 8, 133, '/uploads/products/product-1778663732580-810050376.png', 0, 2, '2026-05-13 09:15:32'),
(183, 8, 134, '/uploads/products/product-1778663732580-810050376.png', 0, 3, '2026-05-13 09:15:32'),
(184, 8, 135, '/uploads/products/product-1778663732617-373248974.png', 0, 1, '2026-05-13 09:15:32'),
(185, 8, 136, '/uploads/products/product-1778663732617-373248974.png', 0, 2, '2026-05-13 09:15:32'),
(186, 8, 137, '/uploads/products/product-1778663732617-373248974.png', 0, 3, '2026-05-13 09:15:32'),
(187, 8, 138, '/uploads/products/product-1778663732636-473149885.png', 0, 1, '2026-05-13 09:15:32'),
(188, 8, 139, '/uploads/products/product-1778663732636-473149885.png', 0, 2, '2026-05-13 09:15:32'),
(189, 8, 140, '/uploads/products/product-1778663732636-473149885.png', 0, 3, '2026-05-13 09:15:32'),
(190, 8, 141, '/uploads/products/product-1778663732645-86422943.png', 0, 1, '2026-05-13 09:15:32'),
(191, 8, 142, '/uploads/products/product-1778663732645-86422943.png', 0, 2, '2026-05-13 09:15:32'),
(192, 8, 143, '/uploads/products/product-1778663732645-86422943.png', 0, 3, '2026-05-13 09:15:32'),
(193, 9, NULL, '/uploads/products/product-1778663792838-864363873.png', 1, 0, '2026-05-13 09:16:32'),
(194, 9, 144, '/uploads/products/product-1778663792879-942326931.jpg', 0, 1, '2026-05-13 09:16:32'),
(195, 9, 145, '/uploads/products/product-1778663792879-942326931.jpg', 0, 2, '2026-05-13 09:16:32'),
(196, 9, 146, '/uploads/products/product-1778663792879-942326931.jpg', 0, 3, '2026-05-13 09:16:32'),
(197, 9, 147, '/uploads/products/product-1778663792879-942326931.jpg', 0, 4, '2026-05-13 09:16:32'),
(198, 9, 148, '/uploads/products/product-1778663792887-207635891.png', 0, 1, '2026-05-13 09:16:32'),
(199, 9, 149, '/uploads/products/product-1778663792887-207635891.png', 0, 2, '2026-05-13 09:16:32'),
(200, 9, 150, '/uploads/products/product-1778663792887-207635891.png', 0, 3, '2026-05-13 09:16:32'),
(201, 9, 151, '/uploads/products/product-1778663792887-207635891.png', 0, 4, '2026-05-13 09:16:32'),
(202, 9, 152, '/uploads/products/product-1778663792906-869841707.png', 0, 1, '2026-05-13 09:16:32'),
(203, 9, 153, '/uploads/products/product-1778663792906-869841707.png', 0, 2, '2026-05-13 09:16:32'),
(204, 9, 154, '/uploads/products/product-1778663792906-869841707.png', 0, 3, '2026-05-13 09:16:32'),
(205, 9, 155, '/uploads/products/product-1778663792906-869841707.png', 0, 4, '2026-05-13 09:16:32'),
(206, 9, 156, '/uploads/products/product-1778663792927-217343433.png', 0, 1, '2026-05-13 09:16:32'),
(207, 9, 157, '/uploads/products/product-1778663792927-217343433.png', 0, 2, '2026-05-13 09:16:32'),
(208, 9, 158, '/uploads/products/product-1778663792927-217343433.png', 0, 3, '2026-05-13 09:16:32'),
(209, 9, 159, '/uploads/products/product-1778663792927-217343433.png', 0, 4, '2026-05-13 09:16:32');

-- --------------------------------------------------------

--
-- Table structure for table `product_variants`
--

CREATE TABLE `product_variants` (
  `id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `size` varchar(50) NOT NULL,
  `color` varchar(80) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `price` decimal(10,2) DEFAULT NULL,
  `sku` varchar(190) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_variants`
--

INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `price`, `sku`, `created_at`, `updated_at`) VALUES
(1, 1, '30', 'White', 0, 100.00, 'NQTLOS1W-TLOS1W-WHITE-30-25', '2026-05-13 09:03:18', '2026-05-13 09:22:21'),
(2, 1, '31', 'White', 5, 100.00, 'NQTLOS1W-TLOS1W-WHITE-31-26', '2026-05-13 09:03:18', '2026-05-13 09:45:21'),
(3, 1, '32', 'White', 5, 100.00, 'NQTLOS1W-TLOS1W-WHITE-32-27', '2026-05-13 09:03:18', '2026-05-13 09:03:18'),
(4, 1, '33', 'White', 5, 100.00, 'NQTLOS1W-TLOS1W-WHITE-33-28', '2026-05-13 09:03:18', '2026-05-13 09:03:18'),
(5, 1, '34', 'White', 5, 100.00, 'NQTLOS1W-TLOS1W-WHITE-34-29', '2026-05-13 09:03:18', '2026-05-13 09:03:18'),
(6, 1, '36', 'White', 5, 100.00, 'NQTLOS1W-TLOS1W-WHITE-36-30', '2026-05-13 09:03:18', '2026-05-13 09:03:18'),
(7, 1, '30', 'Beige', 5, 100.00, 'NQTLOS1W-TLOS1W-BEIGE-30-31', '2026-05-13 09:03:18', '2026-05-13 09:03:18'),
(8, 1, '31', 'Beige', 5, 100.00, 'NQTLOS1W-TLOS1W-BEIGE-31-32', '2026-05-13 09:03:18', '2026-05-13 09:03:18'),
(9, 1, '32', 'Beige', 5, 100.00, 'NQTLOS1W-TLOS1W-BEIGE-32-33', '2026-05-13 09:03:18', '2026-05-13 09:03:18'),
(10, 1, '33', 'Beige', 5, 100.00, 'NQTLOS1W-TLOS1W-BEIGE-33-34', '2026-05-13 09:03:18', '2026-05-13 09:03:18'),
(11, 1, '34', 'Beige', 5, 100.00, 'NQTLOS1W-TLOS1W-BEIGE-34-35', '2026-05-13 09:03:18', '2026-05-13 09:03:18'),
(12, 1, '36', 'Beige', 5, 100.00, 'NQTLOS1W-TLOS1W-BEIGE-36-36', '2026-05-13 09:03:18', '2026-05-13 09:03:18'),
(13, 1, '30', 'Brown', 5, 100.00, 'NQTLOS1W-TLOS1W-BROWN-30-37', '2026-05-13 09:03:18', '2026-05-13 09:03:18'),
(14, 1, '31', 'Brown', 5, 100.00, 'NQTLOS1W-TLOS1W-BROWN-31-38', '2026-05-13 09:03:18', '2026-05-13 09:03:18'),
(15, 1, '32', 'Brown', 5, 100.00, 'NQTLOS1W-TLOS1W-BROWN-32-39', '2026-05-13 09:03:18', '2026-05-13 09:03:18'),
(16, 1, '33', 'Brown', 5, 100.00, 'NQTLOS1W-TLOS1W-BROWN-33-40', '2026-05-13 09:03:18', '2026-05-13 09:03:18'),
(17, 1, '34', 'Brown', 5, 100.00, 'NQTLOS1W-TLOS1W-BROWN-34-41', '2026-05-13 09:03:18', '2026-05-13 09:03:18'),
(18, 1, '36', 'Brown', 5, 100.00, 'NQTLOS1W-TLOS1W-BROWN-36-42', '2026-05-13 09:03:18', '2026-05-13 09:03:18'),
(19, 1, '30', 'Gray', 5, 100.00, 'NQTLOS1W-TLOS1W-GRAY-30-43', '2026-05-13 09:03:18', '2026-05-13 09:03:18'),
(20, 1, '31', 'Gray', 5, 100.00, 'NQTLOS1W-TLOS1W-GRAY-31-44', '2026-05-13 09:03:18', '2026-05-13 09:03:18'),
(21, 1, '32', 'Gray', 5, 100.00, 'NQTLOS1W-TLOS1W-GRAY-32-45', '2026-05-13 09:03:18', '2026-05-13 09:03:18'),
(22, 1, '33', 'Gray', 5, 100.00, 'NQTLOS1W-TLOS1W-GRAY-33-46', '2026-05-13 09:03:18', '2026-05-13 09:03:18'),
(23, 1, '34', 'Gray', 5, 100.00, 'NQTLOS1W-TLOS1W-GRAY-34-47', '2026-05-13 09:03:18', '2026-05-13 09:03:18'),
(24, 1, '36', 'Gray', 5, 100.00, 'NQTLOS1W-TLOS1W-GRAY-36-48', '2026-05-13 09:03:18', '2026-05-13 09:03:18'),
(25, 2, 'M', 'Black', 5, 65.00, 'NQ0OD4O9-0OD4O9-BLACK-M-16', '2026-05-13 09:04:14', '2026-05-13 09:04:14'),
(26, 2, 'L', 'Black', 5, 65.00, 'NQ0OD4O9-0OD4O9-BLACK-L-17', '2026-05-13 09:04:14', '2026-05-13 09:04:14'),
(27, 2, 'XL', 'Black', 5, 65.00, 'NQ0OD4O9-0OD4O9-BLACK-XL-18', '2026-05-13 09:04:14', '2026-05-13 09:04:14'),
(28, 2, 'XXL', 'Black', 5, 65.00, 'NQ0OD4O9-0OD4O9-BLACK-XXL-19', '2026-05-13 09:04:14', '2026-05-13 09:04:14'),
(29, 2, '3XL', 'Black', 5, 65.00, 'NQ0OD4O9-0OD4O9-BLACK-3XL-20', '2026-05-13 09:04:14', '2026-05-13 09:04:14'),
(30, 2, 'M', 'White', 5, 65.00, 'NQ0OD4O9-0OD4O9-WHITE-M-21', '2026-05-13 09:04:14', '2026-05-13 09:04:14'),
(31, 2, 'L', 'White', 5, 65.00, 'NQ0OD4O9-0OD4O9-WHITE-L-22', '2026-05-13 09:04:14', '2026-05-13 09:04:14'),
(32, 2, 'XL', 'White', 5, 65.00, 'NQ0OD4O9-0OD4O9-WHITE-XL-23', '2026-05-13 09:04:14', '2026-05-13 09:04:14'),
(33, 2, 'XXL', 'White', 5, 65.00, 'NQ0OD4O9-0OD4O9-WHITE-XXL-24', '2026-05-13 09:04:14', '2026-05-13 09:04:14'),
(34, 2, '3XL', 'White', 5, 65.00, 'NQ0OD4O9-0OD4O9-WHITE-3XL-25', '2026-05-13 09:04:14', '2026-05-13 09:04:14'),
(35, 2, 'M', 'Beige', 5, 65.00, 'NQ0OD4O9-0OD4O9-BEIGE-M-26', '2026-05-13 09:04:14', '2026-05-13 09:04:14'),
(36, 2, 'L', 'Beige', 5, 65.00, 'NQ0OD4O9-0OD4O9-BEIGE-L-27', '2026-05-13 09:04:14', '2026-05-13 09:04:14'),
(37, 2, 'XL', 'Beige', 5, 65.00, 'NQ0OD4O9-0OD4O9-BEIGE-XL-28', '2026-05-13 09:04:14', '2026-05-13 09:04:14'),
(38, 2, 'XXL', 'Beige', 5, 65.00, 'NQ0OD4O9-0OD4O9-BEIGE-XXL-29', '2026-05-13 09:04:14', '2026-05-13 09:04:14'),
(39, 2, '3XL', 'Beige', 5, 65.00, 'NQ0OD4O9-0OD4O9-BEIGE-3XL-30', '2026-05-13 09:04:14', '2026-05-13 09:04:14'),
(40, 3, 'M', 'Black', 7, 120.00, 'NQMTUOGM-MTUOGM-BLACK-M-21', '2026-05-13 09:07:57', '2026-05-13 09:07:57'),
(41, 3, 'L', 'Black', 7, 120.00, 'NQMTUOGM-MTUOGM-BLACK-L-22', '2026-05-13 09:07:57', '2026-05-13 09:07:57'),
(42, 3, 'XL', 'Black', 7, 120.00, 'NQMTUOGM-MTUOGM-BLACK-XL-23', '2026-05-13 09:07:57', '2026-05-13 09:07:57'),
(43, 3, 'XXL', 'Black', 7, 120.00, 'NQMTUOGM-MTUOGM-BLACK-XXL-24', '2026-05-13 09:07:57', '2026-05-13 09:07:57'),
(44, 3, '3XL', 'Black', 7, 120.00, 'NQMTUOGM-MTUOGM-BLACK-3XL-25', '2026-05-13 09:07:57', '2026-05-13 09:07:57'),
(45, 3, 'M', 'Navy', 7, 120.00, 'NQMTUOGM-MTUOGM-NAVY-M-26', '2026-05-13 09:07:57', '2026-05-13 09:07:57'),
(46, 3, 'L', 'Navy', 7, 120.00, 'NQMTUOGM-MTUOGM-NAVY-L-27', '2026-05-13 09:07:57', '2026-05-13 09:07:57'),
(47, 3, 'XL', 'Navy', 7, 120.00, 'NQMTUOGM-MTUOGM-NAVY-XL-28', '2026-05-13 09:07:57', '2026-05-13 09:07:57'),
(48, 3, 'XXL', 'Navy', 7, 120.00, 'NQMTUOGM-MTUOGM-NAVY-XXL-29', '2026-05-13 09:07:57', '2026-05-13 09:07:57'),
(49, 3, '3XL', 'Navy', 7, 120.00, 'NQMTUOGM-MTUOGM-NAVY-3XL-30', '2026-05-13 09:07:57', '2026-05-13 09:07:57'),
(50, 3, 'M', 'Beige', 7, 120.00, 'NQMTUOGM-MTUOGM-BEIGE-M-31', '2026-05-13 09:07:57', '2026-05-13 09:07:57'),
(51, 3, 'L', 'Beige', 7, 120.00, 'NQMTUOGM-MTUOGM-BEIGE-L-32', '2026-05-13 09:07:57', '2026-05-13 09:07:57'),
(52, 3, 'XL', 'Beige', 7, 120.00, 'NQMTUOGM-MTUOGM-BEIGE-XL-33', '2026-05-13 09:07:57', '2026-05-13 09:07:57'),
(53, 3, 'XXL', 'Beige', 7, 120.00, 'NQMTUOGM-MTUOGM-BEIGE-XXL-34', '2026-05-13 09:07:57', '2026-05-13 09:07:57'),
(54, 3, '3XL', 'Beige', 7, 120.00, 'NQMTUOGM-MTUOGM-BEIGE-3XL-35', '2026-05-13 09:07:57', '2026-05-13 09:07:57'),
(55, 3, 'M', 'Gray', 7, 120.00, 'NQMTUOGM-MTUOGM-GRAY-M-36', '2026-05-13 09:07:57', '2026-05-13 09:07:57'),
(56, 3, 'L', 'Gray', 7, 120.00, 'NQMTUOGM-MTUOGM-GRAY-L-37', '2026-05-13 09:07:57', '2026-05-13 09:07:57'),
(57, 3, 'XL', 'Gray', 7, 120.00, 'NQMTUOGM-MTUOGM-GRAY-XL-38', '2026-05-13 09:07:57', '2026-05-13 09:07:57'),
(58, 3, 'XXL', 'Gray', 7, 120.00, 'NQMTUOGM-MTUOGM-GRAY-XXL-39', '2026-05-13 09:07:57', '2026-05-13 09:07:57'),
(59, 3, '3XL', 'Gray', 7, 120.00, 'NQMTUOGM-MTUOGM-GRAY-3XL-40', '2026-05-13 09:07:57', '2026-05-13 09:07:57'),
(60, 4, 'S', 'Black', 5, 125.00, 'NQKCEKQK-KCEKQK-BLACK-S-17', '2026-05-13 09:09:15', '2026-05-13 09:09:15'),
(61, 4, 'M', 'Black', 5, 125.00, 'NQKCEKQK-KCEKQK-BLACK-M-18', '2026-05-13 09:09:15', '2026-05-13 09:09:15'),
(62, 4, 'L', 'Black', 5, 125.00, 'NQKCEKQK-KCEKQK-BLACK-L-19', '2026-05-13 09:09:15', '2026-05-13 09:09:15'),
(63, 4, 'XL', 'Black', 5, 125.00, 'NQKCEKQK-KCEKQK-BLACK-XL-20', '2026-05-13 09:09:15', '2026-05-13 09:09:15'),
(64, 4, 'S', 'Blue', 5, 125.00, 'NQKCEKQK-KCEKQK-BLUE-S-21', '2026-05-13 09:09:15', '2026-05-13 09:09:15'),
(65, 4, 'M', 'Blue', 5, 125.00, 'NQKCEKQK-KCEKQK-BLUE-M-22', '2026-05-13 09:09:15', '2026-05-13 09:09:15'),
(66, 4, 'L', 'Blue', 5, 125.00, 'NQKCEKQK-KCEKQK-BLUE-L-23', '2026-05-13 09:09:15', '2026-05-13 09:09:15'),
(67, 4, 'XL', 'Blue', 5, 125.00, 'NQKCEKQK-KCEKQK-BLUE-XL-24', '2026-05-13 09:09:15', '2026-05-13 09:09:15'),
(68, 4, 'S', 'Pink', 5, 125.00, 'NQKCEKQK-KCEKQK-PINK-S-25', '2026-05-13 09:09:15', '2026-05-13 09:09:15'),
(69, 4, 'M', 'Pink', 5, 125.00, 'NQKCEKQK-KCEKQK-PINK-M-26', '2026-05-13 09:09:15', '2026-05-13 09:09:15'),
(70, 4, 'L', 'Pink', 5, 125.00, 'NQKCEKQK-KCEKQK-PINK-L-27', '2026-05-13 09:09:15', '2026-05-13 09:09:15'),
(71, 4, 'XL', 'Pink', 5, 125.00, 'NQKCEKQK-KCEKQK-PINK-XL-28', '2026-05-13 09:09:15', '2026-05-13 09:09:15'),
(72, 4, 'S', 'Beige', 5, 125.00, 'NQKCEKQK-KCEKQK-BEIGE-S-29', '2026-05-13 09:09:15', '2026-05-13 09:09:15'),
(73, 4, 'M', 'Beige', 5, 125.00, 'NQKCEKQK-KCEKQK-BEIGE-M-30', '2026-05-13 09:09:15', '2026-05-13 09:09:15'),
(74, 4, 'L', 'Beige', 5, 125.00, 'NQKCEKQK-KCEKQK-BEIGE-L-31', '2026-05-13 09:09:15', '2026-05-13 09:09:15'),
(75, 4, 'XL', 'Beige', 5, 125.00, 'NQKCEKQK-KCEKQK-BEIGE-XL-32', '2026-05-13 09:09:15', '2026-05-13 09:09:15'),
(76, 5, '30', 'Black', 5, 50.03, 'NQMXL516-MXL516-BLACK-30-22', '2026-05-13 09:10:24', '2026-05-13 09:10:24'),
(77, 5, '31', 'Black', 5, 50.03, 'NQMXL516-MXL516-BLACK-31-23', '2026-05-13 09:10:24', '2026-05-13 09:10:24'),
(78, 5, '32', 'Black', 5, 50.03, 'NQMXL516-MXL516-BLACK-32-24', '2026-05-13 09:10:24', '2026-05-13 09:10:24'),
(79, 5, '33', 'Black', 5, 50.03, 'NQMXL516-MXL516-BLACK-33-25', '2026-05-13 09:10:24', '2026-05-13 09:10:24'),
(80, 5, '34', 'Black', 5, 50.03, 'NQMXL516-MXL516-BLACK-34-26', '2026-05-13 09:10:24', '2026-05-13 09:10:24'),
(81, 5, '36', 'Black', 5, 50.03, 'NQMXL516-MXL516-BLACK-36-27', '2026-05-13 09:10:24', '2026-05-13 09:10:24'),
(82, 5, '38', 'Black', 5, 50.03, 'NQMXL516-MXL516-BLACK-38-28', '2026-05-13 09:10:24', '2026-05-13 09:10:24'),
(83, 5, '30', 'Navy', 5, 50.03, 'NQMXL516-MXL516-NAVY-30-29', '2026-05-13 09:10:24', '2026-05-13 09:10:24'),
(84, 5, '31', 'Navy', 5, 50.03, 'NQMXL516-MXL516-NAVY-31-30', '2026-05-13 09:10:24', '2026-05-13 09:10:24'),
(85, 5, '32', 'Navy', 5, 50.03, 'NQMXL516-MXL516-NAVY-32-31', '2026-05-13 09:10:24', '2026-05-13 09:10:24'),
(86, 5, '33', 'Navy', 5, 50.03, 'NQMXL516-MXL516-NAVY-33-32', '2026-05-13 09:10:24', '2026-05-13 09:10:24'),
(87, 5, '34', 'Navy', 5, 50.03, 'NQMXL516-MXL516-NAVY-34-33', '2026-05-13 09:10:24', '2026-05-13 09:10:24'),
(88, 5, '36', 'Navy', 5, 50.03, 'NQMXL516-MXL516-NAVY-36-34', '2026-05-13 09:10:24', '2026-05-13 09:10:24'),
(89, 5, '38', 'Navy', 5, 50.03, 'NQMXL516-MXL516-NAVY-38-35', '2026-05-13 09:10:24', '2026-05-13 09:10:24'),
(90, 5, '30', 'Gray', 5, 50.03, 'NQMXL516-MXL516-GRAY-30-36', '2026-05-13 09:10:24', '2026-05-13 09:10:24'),
(91, 5, '31', 'Gray', 5, 50.03, 'NQMXL516-MXL516-GRAY-31-37', '2026-05-13 09:10:24', '2026-05-13 09:10:24'),
(92, 5, '32', 'Gray', 5, 50.03, 'NQMXL516-MXL516-GRAY-32-38', '2026-05-13 09:10:24', '2026-05-13 09:10:24'),
(93, 5, '33', 'Gray', 5, 50.03, 'NQMXL516-MXL516-GRAY-33-39', '2026-05-13 09:10:24', '2026-05-13 09:10:24'),
(94, 5, '34', 'Gray', 5, 50.03, 'NQMXL516-MXL516-GRAY-34-40', '2026-05-13 09:10:24', '2026-05-13 09:10:24'),
(95, 5, '36', 'Gray', 5, 50.03, 'NQMXL516-MXL516-GRAY-36-41', '2026-05-13 09:10:24', '2026-05-13 09:10:24'),
(96, 5, '38', 'Gray', 5, 50.03, 'NQMXL516-MXL516-GRAY-38-42', '2026-05-13 09:10:24', '2026-05-13 09:10:24'),
(97, 6, 'S', 'Black', 6, 44.00, 'NQRJ4DJ9-RJ4DJ9-BLACK-S-21', '2026-05-13 09:11:52', '2026-05-13 10:06:48'),
(98, 6, 'M', 'Black', 7, 44.00, 'NQRJ4DJ9-RJ4DJ9-BLACK-M-22', '2026-05-13 09:11:52', '2026-05-13 09:11:52'),
(99, 6, 'L', 'Black', 7, 44.00, 'NQRJ4DJ9-RJ4DJ9-BLACK-L-23', '2026-05-13 09:11:52', '2026-05-13 09:11:52'),
(100, 6, 'XL', 'Black', 7, 44.00, 'NQRJ4DJ9-RJ4DJ9-BLACK-XL-24', '2026-05-13 09:11:52', '2026-05-13 09:11:52'),
(101, 6, 'XXL', 'Black', 7, 44.00, 'NQRJ4DJ9-RJ4DJ9-BLACK-XXL-25', '2026-05-13 09:11:52', '2026-05-13 09:11:52'),
(102, 6, 'S', 'White', 7, 44.00, 'NQRJ4DJ9-RJ4DJ9-WHITE-S-26', '2026-05-13 09:11:52', '2026-05-13 09:11:52'),
(103, 6, 'M', 'White', 7, 44.00, 'NQRJ4DJ9-RJ4DJ9-WHITE-M-27', '2026-05-13 09:11:52', '2026-05-13 09:11:52'),
(104, 6, 'L', 'White', 7, 44.00, 'NQRJ4DJ9-RJ4DJ9-WHITE-L-28', '2026-05-13 09:11:52', '2026-05-13 09:11:52'),
(105, 6, 'XL', 'White', 7, 44.00, 'NQRJ4DJ9-RJ4DJ9-WHITE-XL-29', '2026-05-13 09:11:52', '2026-05-13 09:11:52'),
(106, 6, 'XXL', 'White', 7, 44.00, 'NQRJ4DJ9-RJ4DJ9-WHITE-XXL-30', '2026-05-13 09:11:52', '2026-05-13 09:11:52'),
(107, 6, 'S', 'Navy', 6, 44.00, 'NQRJ4DJ9-RJ4DJ9-NAVY-S-31', '2026-05-13 09:11:52', '2026-05-13 10:09:53'),
(108, 6, 'M', 'Navy', 7, 44.00, 'NQRJ4DJ9-RJ4DJ9-NAVY-M-32', '2026-05-13 09:11:52', '2026-05-13 09:11:52'),
(109, 6, 'L', 'Navy', 7, 44.00, 'NQRJ4DJ9-RJ4DJ9-NAVY-L-33', '2026-05-13 09:11:52', '2026-05-13 09:11:52'),
(110, 6, 'XL', 'Navy', 7, 44.00, 'NQRJ4DJ9-RJ4DJ9-NAVY-XL-34', '2026-05-13 09:11:52', '2026-05-13 09:11:52'),
(111, 6, 'XXL', 'Navy', 7, 44.00, 'NQRJ4DJ9-RJ4DJ9-NAVY-XXL-35', '2026-05-13 09:11:52', '2026-05-13 09:11:52'),
(112, 6, 'S', 'Gray', 7, 44.00, 'NQRJ4DJ9-RJ4DJ9-GRAY-S-36', '2026-05-13 09:11:52', '2026-05-13 09:11:52'),
(113, 6, 'M', 'Gray', 7, 44.00, 'NQRJ4DJ9-RJ4DJ9-GRAY-M-37', '2026-05-13 09:11:52', '2026-05-13 09:11:52'),
(114, 6, 'L', 'Gray', 7, 44.00, 'NQRJ4DJ9-RJ4DJ9-GRAY-L-38', '2026-05-13 09:11:52', '2026-05-13 09:11:52'),
(115, 6, 'XL', 'Gray', 7, 44.00, 'NQRJ4DJ9-RJ4DJ9-GRAY-XL-39', '2026-05-13 09:11:52', '2026-05-13 09:11:52'),
(116, 6, 'XXL', 'Gray', 7, 44.00, 'NQRJ4DJ9-RJ4DJ9-GRAY-XXL-40', '2026-05-13 09:11:52', '2026-05-13 09:11:52'),
(117, 7, '6Y', 'Black', 6, 70.00, 'NQTR2TP3-TR2TP3-BLACK-6Y-13', '2026-05-13 09:13:03', '2026-05-13 09:13:03'),
(118, 7, '8Y', 'Black', 6, 70.00, 'NQTR2TP3-TR2TP3-BLACK-8Y-14', '2026-05-13 09:13:03', '2026-05-13 09:13:03'),
(119, 7, '10Y', 'Black', 6, 70.00, 'NQTR2TP3-TR2TP3-BLACK-10Y-15', '2026-05-13 09:13:03', '2026-05-13 09:13:03'),
(120, 7, '12Y', 'Black', 6, 70.00, 'NQTR2TP3-TR2TP3-BLACK-12Y-16', '2026-05-13 09:13:03', '2026-05-13 09:13:03'),
(121, 7, '6Y', 'Blue', 6, 70.00, 'NQTR2TP3-TR2TP3-BLUE-6Y-17', '2026-05-13 09:13:03', '2026-05-13 09:13:03'),
(122, 7, '8Y', 'Blue', 6, 70.00, 'NQTR2TP3-TR2TP3-BLUE-8Y-18', '2026-05-13 09:13:03', '2026-05-13 09:13:03'),
(123, 7, '10Y', 'Blue', 6, 70.00, 'NQTR2TP3-TR2TP3-BLUE-10Y-19', '2026-05-13 09:13:03', '2026-05-13 09:13:03'),
(124, 7, '12Y', 'Blue', 6, 70.00, 'NQTR2TP3-TR2TP3-BLUE-12Y-20', '2026-05-13 09:13:03', '2026-05-13 09:13:03'),
(125, 7, '6Y', 'Gray', 6, 70.00, 'NQTR2TP3-TR2TP3-GRAY-6Y-21', '2026-05-13 09:13:03', '2026-05-13 09:13:03'),
(126, 7, '8Y', 'Gray', 6, 70.00, 'NQTR2TP3-TR2TP3-GRAY-8Y-22', '2026-05-13 09:13:03', '2026-05-13 09:13:03'),
(127, 7, '10Y', 'Gray', 6, 70.00, 'NQTR2TP3-TR2TP3-GRAY-10Y-23', '2026-05-13 09:13:03', '2026-05-13 09:13:03'),
(128, 7, '12Y', 'Gray', 6, 70.00, 'NQTR2TP3-TR2TP3-GRAY-12Y-24', '2026-05-13 09:13:03', '2026-05-13 09:13:03'),
(129, 8, 'XS', 'Black', 5, 80.00, 'NQ4X5NR0-4X5NR0-BLACK-XS-16', '2026-05-13 09:15:32', '2026-05-13 09:15:32'),
(130, 8, 'S', 'Black', 5, 80.00, 'NQ4X5NR0-4X5NR0-BLACK-S-17', '2026-05-13 09:15:32', '2026-05-13 09:15:32'),
(131, 8, 'M', 'Black', 5, 80.00, 'NQ4X5NR0-4X5NR0-BLACK-M-18', '2026-05-13 09:15:32', '2026-05-13 09:15:32'),
(132, 8, 'XS', 'Blue', 5, 80.00, 'NQ4X5NR0-4X5NR0-BLUE-XS-19', '2026-05-13 09:15:32', '2026-05-13 09:15:32'),
(133, 8, 'S', 'Blue', 5, 80.00, 'NQ4X5NR0-4X5NR0-BLUE-S-20', '2026-05-13 09:15:32', '2026-05-13 09:15:32'),
(134, 8, 'M', 'Blue', 5, 80.00, 'NQ4X5NR0-4X5NR0-BLUE-M-21', '2026-05-13 09:15:32', '2026-05-13 09:15:32'),
(135, 8, 'XS', 'Navy', 5, 80.00, 'NQ4X5NR0-4X5NR0-NAVY-XS-22', '2026-05-13 09:15:32', '2026-05-13 09:15:32'),
(136, 8, 'S', 'Navy', 5, 80.00, 'NQ4X5NR0-4X5NR0-NAVY-S-23', '2026-05-13 09:15:32', '2026-05-13 09:15:32'),
(137, 8, 'M', 'Navy', 5, 80.00, 'NQ4X5NR0-4X5NR0-NAVY-M-24', '2026-05-13 09:15:32', '2026-05-13 09:15:32'),
(138, 8, 'XS', 'Olive', 5, 80.00, 'NQ4X5NR0-4X5NR0-OLIVE-XS-25', '2026-05-13 09:15:32', '2026-05-13 09:15:32'),
(139, 8, 'S', 'Olive', 5, 80.00, 'NQ4X5NR0-4X5NR0-OLIVE-S-26', '2026-05-13 09:15:32', '2026-05-13 09:15:32'),
(140, 8, 'M', 'Olive', 5, 80.00, 'NQ4X5NR0-4X5NR0-OLIVE-M-27', '2026-05-13 09:15:32', '2026-05-13 09:15:32'),
(141, 8, 'XS', 'Beige', 5, 80.00, 'NQ4X5NR0-4X5NR0-BEIGE-XS-28', '2026-05-13 09:15:32', '2026-05-13 09:15:32'),
(142, 8, 'S', 'Beige', 5, 80.00, 'NQ4X5NR0-4X5NR0-BEIGE-S-29', '2026-05-13 09:15:32', '2026-05-13 09:15:32'),
(143, 8, 'M', 'Beige', 5, 80.00, 'NQ4X5NR0-4X5NR0-BEIGE-M-30', '2026-05-13 09:15:32', '2026-05-13 09:15:32'),
(144, 9, 'S', 'Black', 5, 150.00, 'NQNZ98H7-NZ98H7-BLACK-S-17', '2026-05-13 09:16:32', '2026-05-13 09:16:32'),
(145, 9, 'M', 'Black', 5, 150.00, 'NQNZ98H7-NZ98H7-BLACK-M-18', '2026-05-13 09:16:32', '2026-05-13 09:16:32'),
(146, 9, 'L', 'Black', 5, 150.00, 'NQNZ98H7-NZ98H7-BLACK-L-19', '2026-05-13 09:16:32', '2026-05-13 09:16:32'),
(147, 9, 'XL', 'Black', 5, 150.00, 'NQNZ98H7-NZ98H7-BLACK-XL-20', '2026-05-13 09:16:32', '2026-05-13 09:16:32'),
(148, 9, 'S', 'Navy', 5, 150.00, 'NQNZ98H7-NZ98H7-NAVY-S-21', '2026-05-13 09:16:32', '2026-05-13 09:16:32'),
(149, 9, 'M', 'Navy', 5, 150.00, 'NQNZ98H7-NZ98H7-NAVY-M-22', '2026-05-13 09:16:32', '2026-05-13 09:16:32'),
(150, 9, 'L', 'Navy', 5, 150.00, 'NQNZ98H7-NZ98H7-NAVY-L-23', '2026-05-13 09:16:32', '2026-05-13 09:16:32'),
(151, 9, 'XL', 'Navy', 5, 150.00, 'NQNZ98H7-NZ98H7-NAVY-XL-24', '2026-05-13 09:16:32', '2026-05-13 09:16:32'),
(152, 9, 'S', 'Olive', 5, 150.00, 'NQNZ98H7-NZ98H7-OLIVE-S-25', '2026-05-13 09:16:32', '2026-05-13 09:16:32'),
(153, 9, 'M', 'Olive', 5, 150.00, 'NQNZ98H7-NZ98H7-OLIVE-M-26', '2026-05-13 09:16:32', '2026-05-13 09:16:32'),
(154, 9, 'L', 'Olive', 5, 150.00, 'NQNZ98H7-NZ98H7-OLIVE-L-27', '2026-05-13 09:16:32', '2026-05-13 09:16:32'),
(155, 9, 'XL', 'Olive', 5, 150.00, 'NQNZ98H7-NZ98H7-OLIVE-XL-28', '2026-05-13 09:16:32', '2026-05-13 09:16:32'),
(156, 9, 'S', 'Beige', 5, 150.00, 'NQNZ98H7-NZ98H7-BEIGE-S-29', '2026-05-13 09:16:32', '2026-05-13 09:16:32'),
(157, 9, 'M', 'Beige', 5, 150.00, 'NQNZ98H7-NZ98H7-BEIGE-M-30', '2026-05-13 09:16:32', '2026-05-13 09:16:32'),
(158, 9, 'L', 'Beige', 5, 150.00, 'NQNZ98H7-NZ98H7-BEIGE-L-31', '2026-05-13 09:16:32', '2026-05-13 09:16:32'),
(159, 9, 'XL', 'Beige', 5, 150.00, 'NQNZ98H7-NZ98H7-BEIGE-XL-32', '2026-05-13 09:16:32', '2026-05-13 09:16:32');

-- --------------------------------------------------------

--
-- Table structure for table `store_settings`
--

CREATE TABLE `store_settings` (
  `id` int(10) UNSIGNED NOT NULL,
  `store_name` varchar(150) NOT NULL DEFAULT 'نقشة',
  `store_email` varchar(190) DEFAULT NULL,
  `store_phone` varchar(50) DEFAULT NULL,
  `store_address` varchar(255) DEFAULT NULL,
  `currency` varchar(20) NOT NULL DEFAULT '₪',
  `shipping_fee` decimal(10,2) NOT NULL DEFAULT 10.00,
  `bank_beneficiary_name` varchar(150) DEFAULT NULL,
  `bank_name` varchar(150) DEFAULT NULL,
  `bank_iban` varchar(190) DEFAULT NULL,
  `jawwal_pay_number` varchar(50) DEFAULT NULL,
  `palpay_number` varchar(50) DEFAULT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `store_settings`
--

INSERT INTO `store_settings` (`id`, `store_name`, `store_email`, `store_phone`, `store_address`, `currency`, `shipping_fee`, `bank_beneficiary_name`, `bank_name`, `bank_iban`, `jawwal_pay_number`, `palpay_number`, `logo_url`, `created_at`, `updated_at`) VALUES
(1, 'نقشة', 'info@naqsha.local', '0590000000', 'فلسطين - غزة', '₪', 10.00, 'Naqsha Store', 'Bank of Palestine', 'PS00 PALS 0000 0000 0000 0000 0000 0', '0590000000', '0590000000', NULL, '2026-05-13 08:52:51', '2026-05-13 08:52:51');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(190) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `role`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Yasser Saeed Yahya Awad', 'ibrahim20awad@gmail.com', '$2b$10$XZX5MI0DG3sQYZN2jC/CQOS/iUnRQ6aHmywTGE5/1TtSyw46N6an.', 'user', 1, '2026-05-13 08:58:16', '2026-05-13 09:00:47'),
(2, 'Ibrahim Awad', 'ibrahim@example.com', '$2b$10$/9QTI6EErj2kJ/CZLgK1GeBNLEEqfJgPybQB0Bk.k33qdwPW78Ic6', 'admin', 1, '2026-05-13 08:59:06', '2026-05-13 08:59:17');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_cart_user_variant` (`user_id`,`product_variant_id`),
  ADD KEY `idx_cart_user` (`user_id`),
  ADD KEY `idx_cart_variant` (`product_variant_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_categories_slug` (`slug`),
  ADD UNIQUE KEY `uk_categories_name` (`name`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_orders_order_number` (`order_number`),
  ADD KEY `idx_orders_user` (`user_id`),
  ADD KEY `idx_orders_status` (`status`),
  ADD KEY `idx_orders_payment_method` (`payment_method`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order_items_order` (`order_id`),
  ADD KEY `idx_order_items_product` (`product_id`),
  ADD KEY `idx_order_items_variant` (`product_variant_id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_password_reset_token` (`token`),
  ADD KEY `idx_password_reset_user` (`user_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_payments_order` (`order_id`),
  ADD KEY `idx_payments_status` (`status`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_products_slug` (`slug`),
  ADD KEY `idx_products_category` (`category_id`),
  ADD KEY `idx_products_active` (`is_active`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_product_images_product` (`product_id`),
  ADD KEY `idx_product_images_variant` (`product_variant_id`),
  ADD KEY `idx_product_images_main` (`is_main`);

--
-- Indexes for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_product_variant_option` (`product_id`,`size`,`color`),
  ADD UNIQUE KEY `uk_product_variants_sku` (`sku`),
  ADD KEY `idx_variants_product` (`product_id`),
  ADD KEY `idx_variants_color` (`color`),
  ADD KEY `idx_variants_size` (`size`);

--
-- Indexes for table `store_settings`
--
ALTER TABLE `store_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_users_email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=210;

--
-- AUTO_INCREMENT for table `product_variants`
--
ALTER TABLE `product_variants`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=160;

--
-- AUTO_INCREMENT for table `store_settings`
--
ALTER TABLE `store_settings`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cart_variant` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_order_items_variant` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD CONSTRAINT `fk_password_reset_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_product_images_variant` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD CONSTRAINT `fk_variants_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
