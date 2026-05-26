-- ============================================================
-- FULLSTACK03 - Multi-Branch Fashion E-Commerce
-- Complete Database Schema — MySQL 8.x
-- Chạy:  mysql -u root -p < schema.sql
-- ============================================================

-- ============================================================
-- BƯỚC 0: TẠO DATABASE NẾU CHƯA CÓ
-- ============================================================
CREATE DATABASE IF NOT EXISTS `fashion_store`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `fashion_store`;

-- Tắt kiểm tra FK tạm để DROP/CREATE không bị lỗi thứ tự
SET FOREIGN_KEY_CHECKS = 0;


-- ************************************************************
-- PHẦN 1: XOÁ BẢNG CŨ (nếu muốn chạy lại từ đầu)
-- Thứ tự ngược dependency
-- ************************************************************

DROP TABLE IF EXISTS `blog_post_tags`;
DROP TABLE IF EXISTS `blog_tags`;
DROP TABLE IF EXISTS `blog_posts`;
DROP TABLE IF EXISTS `product_reviews`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `order_status_history`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `user_coupon_usages`;
DROP TABLE IF EXISTS `carts`;
DROP TABLE IF EXISTS `wishlists`;
DROP TABLE IF EXISTS `user_addresses`;
DROP TABLE IF EXISTS `flash_sale_items`;
DROP TABLE IF EXISTS `flash_sales`;
DROP TABLE IF EXISTS `coupons`;
DROP TABLE IF EXISTS `stocktake_items`;
DROP TABLE IF EXISTS `stocktakes`;
DROP TABLE IF EXISTS `transfer_order_items`;
DROP TABLE IF EXISTS `transfer_orders`;
DROP TABLE IF EXISTS `inventory_transactions`;
DROP TABLE IF EXISTS `branch_inventory`;
DROP TABLE IF EXISTS `product_images`;
DROP TABLE IF EXISTS `product_variants`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `branch_staff`;
DROP TABLE IF EXISTS `branches`;
DROP TABLE IF EXISTS `login_logs`;
DROP TABLE IF EXISTS `refresh_tokens`;
DROP TABLE IF EXISTS `otp_verifications`;
DROP TABLE IF EXISTS `user_profiles`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `roles`;


-- ************************************************************
-- PHẦN 2: CÁC BẢNG ĐÃ TỒN TẠI TRONG MODELS
-- ************************************************************

-- 2.1  roles
-- ============================================================
CREATE TABLE `roles` (
  `id`        INT          NOT NULL AUTO_INCREMENT,
  `role_name` VARCHAR(50)  NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_roles_name` (`role_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 2.2  users
-- ============================================================
CREATE TABLE `users` (
  `id`               BIGINT       NOT NULL AUTO_INCREMENT,
  `email`            VARCHAR(150) NOT NULL,
  `phone`            VARCHAR(20)  DEFAULT NULL,
  `password`         VARCHAR(255) DEFAULT NULL,
  `auth_provider`    VARCHAR(50)  DEFAULT 'local'   COMMENT 'local | google | facebook',
  `auth_provider_id` VARCHAR(255) DEFAULT NULL,
  `role_id`          INT          NOT NULL,
  `status`           ENUM('PENDING','ACTIVE','LOCKED') NOT NULL DEFAULT 'PENDING',
  `created_at`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`),
  UNIQUE KEY `uk_users_phone` (`phone`),
  INDEX `idx_users_role` (`role_id`),
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`)
    REFERENCES `roles`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 2.3  user_profiles
-- ============================================================
CREATE TABLE `user_profiles` (
  `user_id`         BIGINT       NOT NULL,
  `full_name`       VARCHAR(200) DEFAULT NULL,
  `date_of_birth`   DATE         DEFAULT NULL,
  `address`         VARCHAR(200) DEFAULT NULL,
  `gender`          ENUM('male','female','other') DEFAULT NULL,
  `id_card`         VARCHAR(20)  DEFAULT NULL,
  `avatar_url`      TEXT         DEFAULT NULL,
  `cover_photo_url` TEXT         DEFAULT NULL,
  `updated_at`      DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uk_profiles_id_card` (`id_card`),
  CONSTRAINT `fk_profiles_user` FOREIGN KEY (`user_id`)
    REFERENCES `users`(`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 2.4  otp_verifications
-- ============================================================
CREATE TABLE `otp_verifications` (
  `id`           BIGINT      NOT NULL AUTO_INCREMENT,
  `user_id`      BIGINT      NOT NULL,
  `otp_code`     VARCHAR(10) NOT NULL,
  `type`         ENUM('PASSWORD_RECOVERY','ACCOUNT_ACTIVATION') NOT NULL,
  `expired_at`   DATETIME    NOT NULL,
  `attempts`     INT         NOT NULL DEFAULT 0,
  `is_used`      TINYINT(1)  NOT NULL DEFAULT 0,
  `locked_until` DATETIME    DEFAULT NULL COMMENT 'Khoá khi nhập OTP sai > 3 lần',
  `created_at`   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_otp_user` (`user_id`),
  CONSTRAINT `fk_otp_user` FOREIGN KEY (`user_id`)
    REFERENCES `users`(`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 2.5  refresh_tokens
-- ============================================================
CREATE TABLE `refresh_tokens` (
  `id`         BIGINT       NOT NULL AUTO_INCREMENT,
  `user_id`    BIGINT       NOT NULL,
  `token`      VARCHAR(255) NOT NULL,
  `expires_at` DATETIME     NOT NULL,
  `is_revoked` TINYINT(1)   NOT NULL DEFAULT 0,
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_rt_user` (`user_id`),
  CONSTRAINT `fk_rt_user` FOREIGN KEY (`user_id`)
    REFERENCES `users`(`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 2.6  login_logs
-- ============================================================
CREATE TABLE `login_logs` (
  `id`             BIGINT       NOT NULL AUTO_INCREMENT,
  `email_or_phone` VARCHAR(150) NOT NULL,
  `ip_address`     VARCHAR(45)  DEFAULT NULL,
  `status`         ENUM('SUCCESS','FAILED') NOT NULL,
  `attempted_at`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_ll_email` (`email_or_phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ************************************************************
-- PHẦN 3: CHI NHÁNH & NHÂN SỰ
-- ************************************************************

-- 3.1  branches
-- ============================================================
CREATE TABLE `branches` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(200) NOT NULL  COMMENT 'VD: Chi nhánh Quận Thủ Đức',
  `address`    VARCHAR(500) NOT NULL,
  `phone`      VARCHAR(20)  DEFAULT NULL,
  `email`      VARCHAR(150) DEFAULT NULL,
  `latitude`   DECIMAL(10,7) DEFAULT NULL  COMMENT 'Vĩ độ GPS',
  `longitude`  DECIMAL(10,7) DEFAULT NULL  COMMENT 'Kinh độ GPS',
  `is_active`  TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_branches_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 3.2  branch_staff  — gắn Staff / Manager vào chi nhánh
-- ============================================================
-- ⚠️  LƯU Ý (Lỗi 5 – Xung đột role vs position):
--    Cột `position` ở đây phải LUÔN đồng bộ với `users.role_id`.
--    Tầng code (Node.js) PHẢI đảm bảo khi INSERT/UPDATE branch_staff:
--      • position = 'STAFF'   → users.role_id = 2 (BRANCH_STAFF)
--      • position = 'MANAGER' → users.role_id = 3 (BRANCH_MANAGER)
--    Không được phép user có role_id = 1 (CUSTOMER) mà lại xuất hiện
--    trong bảng này. Nên validate bằng Trigger hoặc Application Layer.
-- ============================================================
CREATE TABLE `branch_staff` (
  `id`          BIGINT   NOT NULL AUTO_INCREMENT,
  `user_id`     BIGINT   NOT NULL,
  `branch_id`   INT      NOT NULL,
  `position`    ENUM('STAFF','MANAGER') NOT NULL DEFAULT 'STAFF',
  `assigned_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_active`   TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 = đang làm, 0 = đã chuyển',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_bs_user_active` (`user_id`, `is_active`),
  INDEX `idx_bs_branch` (`branch_id`),
  CONSTRAINT `fk_bs_user`   FOREIGN KEY (`user_id`)   REFERENCES `users`(`id`)    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_bs_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ************************************************************
-- PHẦN 4: SẢN PHẨM & DANH MỤC
-- ************************************************************

-- 4.1  categories  (đa cấp — self-referencing)
-- ============================================================
CREATE TABLE `categories` (
  `id`          INT          NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(200) NOT NULL,
  `slug`        VARCHAR(200) NOT NULL,
  `description` TEXT         DEFAULT NULL,
  `image_url`   TEXT         DEFAULT NULL,
  `parent_id`   INT          DEFAULT NULL  COMMENT 'NULL = gốc',
  `sort_order`  INT          NOT NULL DEFAULT 0,
  `is_active`   TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_cat_slug` (`slug`),
  INDEX `idx_cat_parent` (`parent_id`),
  CONSTRAINT `fk_cat_parent` FOREIGN KEY (`parent_id`)
    REFERENCES `categories`(`id`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 4.2  products  (SPU — sản phẩm chung)
-- ============================================================
CREATE TABLE `products` (
  `id`            BIGINT        NOT NULL AUTO_INCREMENT,
  `category_id`   INT           DEFAULT NULL,
  `name`          VARCHAR(300)  NOT NULL,
  `slug`          VARCHAR(300)  NOT NULL,
  `description`   TEXT          DEFAULT NULL  COMMENT 'Mô tả HTML',
  `base_price`    DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Giá niêm yết toàn hệ thống',
  `sale_price`    DECIMAL(15,2) DEFAULT NULL          COMMENT 'Giá khuyến mãi',
  `thumbnail_url` TEXT          DEFAULT NULL,
  `is_active`     TINYINT(1)    NOT NULL DEFAULT 1,
  `created_at`    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_prod_slug` (`slug`),
  INDEX `idx_prod_category` (`category_id`),
  INDEX `idx_prod_active_price` (`is_active`, `base_price`),
  CONSTRAINT `fk_prod_category` FOREIGN KEY (`category_id`)
    REFERENCES `categories`(`id`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 4.3  product_images
-- ============================================================
CREATE TABLE `product_images` (
  `id`         BIGINT       NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT       NOT NULL,
  `image_url`  TEXT         NOT NULL,
  `alt_text`   VARCHAR(300) DEFAULT NULL,
  `sort_order` INT          NOT NULL DEFAULT 0,
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_pi_product` (`product_id`),
  CONSTRAINT `fk_pi_product` FOREIGN KEY (`product_id`)
    REFERENCES `products`(`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 4.4  product_variants  (SKU — biến thể theo size + màu)
-- ============================================================
CREATE TABLE `product_variants` (
  `id`          BIGINT        NOT NULL AUTO_INCREMENT,
  `product_id`  BIGINT        NOT NULL,
  `sku`         VARCHAR(100)  NOT NULL COMMENT 'Mã SKU duy nhất',
  `size`        VARCHAR(20)   NOT NULL COMMENT 'S, M, L, XL, 38, 39…',
  `color`       VARCHAR(50)   NOT NULL COMMENT 'Đen, Trắng, Xanh Navy…',
  `color_code`  VARCHAR(7)    DEFAULT NULL COMMENT 'Mã HEX: #FF5733',
  `extra_price` DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Chênh lệch so với base_price',
  `image_url`   TEXT          DEFAULT NULL,
  `is_active`   TINYINT(1)    NOT NULL DEFAULT 1,
  `created_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_pv_sku` (`sku`),
  INDEX `idx_pv_product` (`product_id`),
  INDEX `idx_pv_size_color` (`size`, `color`),
  CONSTRAINT `fk_pv_product` FOREIGN KEY (`product_id`)
    REFERENCES `products`(`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ************************************************************
-- PHẦN 5: TỒN KHO THEO CHI NHÁNH
-- ************************************************************

-- 5.1  branch_inventory  — tồn kho real-time
-- ============================================================
CREATE TABLE `branch_inventory` (
  `id`         BIGINT   NOT NULL AUTO_INCREMENT,
  `branch_id`  INT      NOT NULL,
  `variant_id` BIGINT   NOT NULL,
  `quantity`   INT      NOT NULL DEFAULT 0  COMMENT 'Tồn kho hiện tại',
  `reserved`   INT      NOT NULL DEFAULT 0  COMMENT 'Đã đặt chưa xuất',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_bi_branch_variant` (`branch_id`, `variant_id`),
  INDEX `idx_bi_variant` (`variant_id`),
  CONSTRAINT `fk_bi_branch`  FOREIGN KEY (`branch_id`)  REFERENCES `branches`(`id`)          ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_bi_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`)   ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 5.2  inventory_transactions  — lịch sử nhập / xuất / kiểm kê
-- ============================================================
CREATE TABLE `inventory_transactions` (
  `id`                BIGINT      NOT NULL AUTO_INCREMENT,
  `branch_id`         INT         NOT NULL,
  `variant_id`        BIGINT      NOT NULL,
  `type`              ENUM(
                        'IMPORT',
                        'EXPORT_ONLINE',
                        'EXPORT_OFFLINE',
                        'STOCKTAKE_ADJUST',
                        'TRANSFER_IN',
                        'TRANSFER_OUT'
                      ) NOT NULL,
  `quantity_change`   INT         NOT NULL COMMENT '+ nhập, − xuất',
  `quantity_before`   INT         NOT NULL,
  `quantity_after`    INT         NOT NULL,
  `reference_id`      BIGINT      DEFAULT NULL COMMENT 'ID đơn hàng / lệnh chuyển kho',
  `reference_type`    VARCHAR(50) DEFAULT NULL COMMENT 'ORDER | TRANSFER_ORDER | STOCKTAKE',
  `note`              TEXT        DEFAULT NULL,
  `performed_by`      BIGINT      DEFAULT NULL,
  `created_at`        DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_it_branch`    (`branch_id`),
  INDEX `idx_it_variant`   (`variant_id`),
  INDEX `idx_it_performer` (`performed_by`),
  INDEX `idx_it_type_date` (`type`, `created_at`),
  CONSTRAINT `fk_it_branch`    FOREIGN KEY (`branch_id`)    REFERENCES `branches`(`id`)          ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_it_variant`   FOREIGN KEY (`variant_id`)   REFERENCES `product_variants`(`id`)  ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_it_performer` FOREIGN KEY (`performed_by`) REFERENCES `users`(`id`)             ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ************************************************************
-- PHẦN 6: ĐIỀU CHUYỂN KHO LIÊN CHI NHÁNH
-- ************************************************************

-- 6.1  transfer_orders
-- ============================================================
CREATE TABLE `transfer_orders` (
  `id`              BIGINT      NOT NULL AUTO_INCREMENT,
  `code`            VARCHAR(50) NOT NULL COMMENT 'VD: TO-20260524-001',
  `from_branch_id`  INT         NOT NULL,
  `to_branch_id`    INT         NOT NULL,
  `status`          ENUM('PENDING','APPROVED','IN_TRANSIT','COMPLETED','CANCELLED')
                                NOT NULL DEFAULT 'PENDING',
  `note`            TEXT        DEFAULT NULL,
  `created_by`      BIGINT      NOT NULL,
  `approved_by`     BIGINT      DEFAULT NULL,
  `approved_at`     DATETIME    DEFAULT NULL,
  `completed_at`    DATETIME    DEFAULT NULL,
  `created_at`      DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_to_code` (`code`),
  INDEX `idx_to_from`    (`from_branch_id`),
  INDEX `idx_to_to`      (`to_branch_id`),
  INDEX `idx_to_creator` (`created_by`),
  CONSTRAINT `fk_to_from`     FOREIGN KEY (`from_branch_id`) REFERENCES `branches`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_to_to`       FOREIGN KEY (`to_branch_id`)   REFERENCES `branches`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_to_creator`  FOREIGN KEY (`created_by`)     REFERENCES `users`(`id`)    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_to_approver` FOREIGN KEY (`approved_by`)    REFERENCES `users`(`id`)    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 6.2  transfer_order_items
-- ============================================================
CREATE TABLE `transfer_order_items` (
  `id`                BIGINT NOT NULL AUTO_INCREMENT,
  `transfer_order_id` BIGINT NOT NULL,
  `variant_id`        BIGINT NOT NULL,
  `quantity`          INT    NOT NULL COMMENT 'SL chuyển',
  `received_quantity` INT    NOT NULL DEFAULT 0 COMMENT 'SL thực nhận',
  PRIMARY KEY (`id`),
  INDEX `idx_toi_order`   (`transfer_order_id`),
  INDEX `idx_toi_variant` (`variant_id`),
  CONSTRAINT `fk_toi_order`   FOREIGN KEY (`transfer_order_id`) REFERENCES `transfer_orders`(`id`)   ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_toi_variant` FOREIGN KEY (`variant_id`)        REFERENCES `product_variants`(`id`)  ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ************************************************************
-- PHẦN 7: KIỂM KÊ KHO (Stocktake)
-- ************************************************************

-- 7.1  stocktakes
-- ============================================================
CREATE TABLE `stocktakes` (
  `id`           BIGINT      NOT NULL AUTO_INCREMENT,
  `branch_id`    INT         NOT NULL,
  `code`         VARCHAR(50) NOT NULL COMMENT 'Mã phiếu kiểm kê',
  `status`       ENUM('IN_PROGRESS','COMPLETED','CANCELLED') NOT NULL DEFAULT 'IN_PROGRESS',
  `note`         TEXT        DEFAULT NULL,
  `created_by`   BIGINT      NOT NULL,
  `completed_at` DATETIME    DEFAULT NULL,
  `created_at`   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_st_code` (`code`),
  INDEX `idx_st_branch`  (`branch_id`),
  INDEX `idx_st_creator` (`created_by`),
  CONSTRAINT `fk_st_branch`  FOREIGN KEY (`branch_id`)  REFERENCES `branches`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_st_creator` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`)    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 7.2  stocktake_items
-- ============================================================
CREATE TABLE `stocktake_items` (
  `id`              BIGINT NOT NULL AUTO_INCREMENT,
  `stocktake_id`    BIGINT NOT NULL,
  `variant_id`      BIGINT NOT NULL,
  `system_quantity` INT    NOT NULL COMMENT 'Tồn trên hệ thống',
  `actual_quantity` INT    NOT NULL COMMENT 'Tồn thực tế đếm được',
  `difference`      INT    GENERATED ALWAYS AS (`actual_quantity` - `system_quantity`) STORED
                           COMMENT '+ thừa, − thiếu',
  PRIMARY KEY (`id`),
  INDEX `idx_sti_stocktake` (`stocktake_id`),
  INDEX `idx_sti_variant`   (`variant_id`),
  CONSTRAINT `fk_sti_stocktake` FOREIGN KEY (`stocktake_id`) REFERENCES `stocktakes`(`id`)        ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_sti_variant`   FOREIGN KEY (`variant_id`)   REFERENCES `product_variants`(`id`)  ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ************************************************************
-- PHẦN 8: SỔ ĐỊA CHỈ & WISHLIST & GIỎ HÀNG
-- ************************************************************

-- 8.1  user_addresses
-- ============================================================
CREATE TABLE `user_addresses` (
  `id`             BIGINT       NOT NULL AUTO_INCREMENT,
  `user_id`        BIGINT       NOT NULL,
  `recipient_name` VARCHAR(200) NOT NULL,
  `phone`          VARCHAR(20)  NOT NULL,
  `province`       VARCHAR(100) NOT NULL,
  `district`       VARCHAR(100) NOT NULL,
  `ward`           VARCHAR(100) NOT NULL,
  `street_address` VARCHAR(500) NOT NULL COMMENT 'Số nhà, tên đường',
  `is_default`     TINYINT(1)   NOT NULL DEFAULT 0,
  `created_at`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_ua_user` (`user_id`),
  CONSTRAINT `fk_ua_user` FOREIGN KEY (`user_id`)
    REFERENCES `users`(`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 8.2  wishlists
-- ============================================================
CREATE TABLE `wishlists` (
  `id`         BIGINT   NOT NULL AUTO_INCREMENT,
  `user_id`    BIGINT   NOT NULL,
  `product_id` BIGINT   NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_wl_user_product` (`user_id`, `product_id`),
  INDEX `idx_wl_product` (`product_id`),
  CONSTRAINT `fk_wl_user`    FOREIGN KEY (`user_id`)    REFERENCES `users`(`id`)    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_wl_product` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 8.3  carts
-- ============================================================
CREATE TABLE `carts` (
  `id`         BIGINT   NOT NULL AUTO_INCREMENT,
  `user_id`    BIGINT   NOT NULL,
  `variant_id` BIGINT   NOT NULL,
  `branch_id`  INT      DEFAULT NULL COMMENT 'Chi nhánh được chọn',
  `quantity`   INT      NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_cart_user_variant_branch` (`user_id`, `variant_id`, `branch_id`),
  INDEX `idx_cart_variant` (`variant_id`),
  INDEX `idx_cart_branch`  (`branch_id`),
  CONSTRAINT `fk_cart_user`    FOREIGN KEY (`user_id`)    REFERENCES `users`(`id`)             ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_cart_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`)  ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_cart_branch`  FOREIGN KEY (`branch_id`)  REFERENCES `branches`(`id`)          ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ************************************************************
-- PHẦN 9: ĐƠN HÀNG
-- ************************************************************

-- 9.1  orders
-- ============================================================
CREATE TABLE `orders` (
  `id`               BIGINT        NOT NULL AUTO_INCREMENT,
  `order_code`       VARCHAR(50)   NOT NULL COMMENT 'ORD-20260524-0001',
  `user_id`          BIGINT        NOT NULL,
  `branch_id`        INT           NOT NULL COMMENT 'Chi nhánh xử lý',

  -- [FIX Lỗi 1] Lưu mã giảm giá đã dùng để đối soát
  `coupon_id`        INT           DEFAULT NULL COMMENT 'FK tới coupons — NULL nếu không dùng mã',

  -- Snapshot giao hàng
  `recipient_name`   VARCHAR(200)  NOT NULL,
  `recipient_phone`  VARCHAR(20)   NOT NULL,
  `shipping_address` VARCHAR(500)  DEFAULT NULL COMMENT 'NULL nếu Click & Collect',

  -- Phương thức nhận
  `delivery_method`  ENUM('STANDARD_DELIVERY','CLICK_AND_COLLECT')
                                   NOT NULL DEFAULT 'STANDARD_DELIVERY',

  -- Tài chính
  `subtotal`         DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `shipping_fee`     DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `discount_amount`  DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `total_amount`     DECIMAL(15,2) NOT NULL DEFAULT 0.00,

  -- Thanh toán
  `payment_method`   ENUM('COD','BANK_TRANSFER','MOMO','VNPAY') NOT NULL DEFAULT 'COD',
  `payment_status`   ENUM('UNPAID','PAID','REFUNDED')           NOT NULL DEFAULT 'UNPAID',

  -- Trạng thái
  `status`           ENUM(
                       'PENDING',
                       'CONFIRMED',
                       'PREPARING',
                       'READY_FOR_PICKUP',
                       'SHIPPED',
                       'DELIVERED',
                       'COMPLETED',
                       'CANCELLED',
                       'RETURNED'
                     ) NOT NULL DEFAULT 'PENDING',

  `note`             TEXT          DEFAULT NULL,
  `cancelled_reason` TEXT          DEFAULT NULL,

  `created_at`       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ord_code` (`order_code`),
  INDEX `idx_ord_user`   (`user_id`),
  INDEX `idx_ord_branch` (`branch_id`),
  INDEX `idx_ord_coupon` (`coupon_id`),
  INDEX `idx_ord_status` (`status`),
  INDEX `idx_ord_date`   (`created_at`),
  CONSTRAINT `fk_ord_user`   FOREIGN KEY (`user_id`)   REFERENCES `users`(`id`)    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_ord_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_ord_coupon` FOREIGN KEY (`coupon_id`) REFERENCES `coupons`(`id`)  ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 9.2  order_items  — snapshot giá + thuộc tính
-- ============================================================
CREATE TABLE `order_items` (
  `id`           BIGINT        NOT NULL AUTO_INCREMENT,
  `order_id`     BIGINT        NOT NULL,
  `variant_id`   BIGINT        NOT NULL,
  `product_name` VARCHAR(300)  NOT NULL COMMENT 'Snapshot tên SP',
  `size`         VARCHAR(20)   NOT NULL,
  `color`        VARCHAR(50)   NOT NULL,
  `unit_price`   DECIMAL(15,2) NOT NULL,
  `quantity`     INT           NOT NULL DEFAULT 1,
  `total_price`  DECIMAL(15,2) NOT NULL COMMENT 'unit_price × quantity',
  PRIMARY KEY (`id`),
  INDEX `idx_oi_order`   (`order_id`),
  INDEX `idx_oi_variant` (`variant_id`),
  CONSTRAINT `fk_oi_order`   FOREIGN KEY (`order_id`)   REFERENCES `orders`(`id`)            ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_oi_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`)  ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 9.3  order_status_history
-- ============================================================
CREATE TABLE `order_status_history` (
  `id`         BIGINT      NOT NULL AUTO_INCREMENT,
  `order_id`   BIGINT      NOT NULL,
  `old_status` VARCHAR(30) DEFAULT NULL,
  `new_status` VARCHAR(30) NOT NULL,
  `changed_by` BIGINT      DEFAULT NULL COMMENT 'Staff / System',
  `note`       TEXT        DEFAULT NULL,
  `created_at` DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_osh_order` (`order_id`),
  INDEX `idx_osh_user`  (`changed_by`),
  CONSTRAINT `fk_osh_order` FOREIGN KEY (`order_id`)   REFERENCES `orders`(`id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_osh_user`  FOREIGN KEY (`changed_by`) REFERENCES `users`(`id`)  ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ************************************************************
-- PHẦN 10: ĐÁNH GIÁ SẢN PHẨM
-- ************************************************************

-- [FIX Lỗi 6] Thêm variant_id để hiển thị "Phân loại hàng" khi review
CREATE TABLE `product_reviews` (
  `id`         BIGINT     NOT NULL AUTO_INCREMENT,
  `user_id`    BIGINT     NOT NULL,
  `product_id` BIGINT     NOT NULL,
  `variant_id` BIGINT     DEFAULT NULL COMMENT 'Biến thể đã mua (size/màu) — hiển thị phân loại hàng',
  `order_id`   BIGINT     NOT NULL COMMENT 'Chỉ đánh giá khi đã mua',
  `rating`     TINYINT    NOT NULL COMMENT '1 – 5 sao',
  `comment`    TEXT       DEFAULT NULL,
  `is_visible` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_rv_user_prod_order` (`user_id`, `product_id`, `order_id`),
  INDEX `idx_rv_product` (`product_id`),
  INDEX `idx_rv_variant` (`variant_id`),
  INDEX `idx_rv_order`   (`order_id`),
  CONSTRAINT `fk_rv_user`    FOREIGN KEY (`user_id`)    REFERENCES `users`(`id`)             ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_rv_product` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`)          ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_rv_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`)  ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT `fk_rv_order`   FOREIGN KEY (`order_id`)   REFERENCES `orders`(`id`)            ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `chk_rv_rating` CHECK (`rating` BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ************************************************************
-- PHẦN 11: BLOG / TIN TỨC THỜI TRANG
-- ************************************************************

-- 11.1  blog_posts
-- ============================================================
CREATE TABLE `blog_posts` (
  `id`            BIGINT       NOT NULL AUTO_INCREMENT,
  `author_id`     BIGINT       NOT NULL,
  `title`         VARCHAR(500) NOT NULL,
  `slug`          VARCHAR(500) NOT NULL,
  `summary`       TEXT         DEFAULT NULL,
  `content`       LONGTEXT     NOT NULL COMMENT 'HTML đầy đủ',
  `thumbnail_url` TEXT         DEFAULT NULL,
  `status`        ENUM('DRAFT','PUBLISHED','ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  `published_at`  DATETIME     DEFAULT NULL,
  `view_count`    INT          NOT NULL DEFAULT 0,
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_bp_slug` (`slug`),
  INDEX `idx_bp_author` (`author_id`),
  INDEX `idx_bp_status` (`status`, `published_at`),
  CONSTRAINT `fk_bp_author` FOREIGN KEY (`author_id`)
    REFERENCES `users`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 11.2  blog_tags
-- ============================================================
CREATE TABLE `blog_tags` (
  `id`   INT          NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_bt_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 11.3  blog_post_tags  (M–N)
-- ============================================================
CREATE TABLE `blog_post_tags` (
  `post_id` BIGINT NOT NULL,
  `tag_id`  INT    NOT NULL,
  PRIMARY KEY (`post_id`, `tag_id`),
  CONSTRAINT `fk_bpt_post` FOREIGN KEY (`post_id`) REFERENCES `blog_posts`(`id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_bpt_tag`  FOREIGN KEY (`tag_id`)  REFERENCES `blog_tags`(`id`)  ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ************************************************************
-- PHẦN 12: COUPON / MÃ GIẢM GIÁ
-- ************************************************************

-- [FIX Lỗi 2] Thêm per_user_limit để giới hạn số lần mỗi user được dùng 1 mã
CREATE TABLE `coupons` (
  `id`               INT           NOT NULL AUTO_INCREMENT,
  `code`             VARCHAR(50)   NOT NULL COMMENT 'VD: SALE20',
  `description`      VARCHAR(300)  DEFAULT NULL,
  `discount_type`    ENUM('PERCENTAGE','FIXED_AMOUNT') NOT NULL DEFAULT 'PERCENTAGE',
  `discount_value`   DECIMAL(15,2) NOT NULL,
  `min_order_amount` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `max_discount`     DECIMAL(15,2) DEFAULT NULL COMMENT 'Giảm tối đa (cho %)',
  `usage_limit`      INT           DEFAULT NULL COMMENT 'Tổng lần dùng toàn hệ thống',
  `per_user_limit`   INT           NOT NULL DEFAULT 1 COMMENT 'Số lần mỗi user được dùng mã này',
  `used_count`       INT           NOT NULL DEFAULT 0,
  `start_date`       DATETIME      NOT NULL,
  `end_date`         DATETIME      NOT NULL,
  `is_active`        TINYINT(1)    NOT NULL DEFAULT 1,
  `created_at`       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_coupon_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- [FIX Lỗi 2] Lịch sử sử dụng coupon theo từng user
-- ============================================================
CREATE TABLE `user_coupon_usages` (
  `id`         BIGINT   NOT NULL AUTO_INCREMENT,
  `user_id`    BIGINT   NOT NULL,
  `coupon_id`  INT      NOT NULL,
  `order_id`   BIGINT   NOT NULL COMMENT 'Đơn hàng đã áp dụng mã',
  `used_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ucu_user_coupon_order` (`user_id`, `coupon_id`, `order_id`),
  INDEX `idx_ucu_coupon` (`coupon_id`),
  INDEX `idx_ucu_order`  (`order_id`),
  CONSTRAINT `fk_ucu_user`   FOREIGN KEY (`user_id`)   REFERENCES `users`(`id`)   ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_ucu_coupon` FOREIGN KEY (`coupon_id`) REFERENCES `coupons`(`id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_ucu_order`  FOREIGN KEY (`order_id`)  REFERENCES `orders`(`id`)  ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ************************************************************
-- PHẦN 13: FLASH SALE / KHUYẾN MÃI THEO THỜI GIAN
-- ************************************************************

-- [FIX Lỗi 3] Chiến dịch giảm giá có khung giờ tự động
CREATE TABLE `flash_sales` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(300) NOT NULL COMMENT 'VD: Flash Sale 8PM-10PM',
  `description` TEXT         DEFAULT NULL,
  `start_time`  DATETIME     NOT NULL COMMENT 'Thời điểm bắt đầu giảm giá',
  `end_time`    DATETIME     NOT NULL COMMENT 'Thời điểm kết thúc giảm giá',
  `status`      ENUM('SCHEDULED','ACTIVE','ENDED','CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
  `created_by`  BIGINT       NOT NULL,
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_fs_time`    (`start_time`, `end_time`),
  INDEX `idx_fs_status`  (`status`),
  INDEX `idx_fs_creator` (`created_by`),
  CONSTRAINT `fk_fs_creator` FOREIGN KEY (`created_by`)
    REFERENCES `users`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Chi tiết sản phẩm / biến thể trong Flash Sale
CREATE TABLE `flash_sale_items` (
  `id`             BIGINT        NOT NULL AUTO_INCREMENT,
  `flash_sale_id`  BIGINT        NOT NULL,
  `product_id`     BIGINT        NOT NULL,
  `variant_id`     BIGINT        DEFAULT NULL COMMENT 'NULL = áp dụng tất cả biến thể',
  `discount_type`  ENUM('PERCENTAGE','FIXED_AMOUNT','FIXED_PRICE') NOT NULL DEFAULT 'PERCENTAGE',
  `discount_value` DECIMAL(15,2) NOT NULL COMMENT '% giảm, số tiền giảm, hoặc giá cố định',
  `stock_limit`    INT           DEFAULT NULL COMMENT 'Giới hạn SL bán với giá sale (NULL = không giới hạn)',
  `sold_count`     INT           NOT NULL DEFAULT 0 COMMENT 'Đã bán được bao nhiêu',
  PRIMARY KEY (`id`),
  INDEX `idx_fsi_flash_sale` (`flash_sale_id`),
  INDEX `idx_fsi_product`    (`product_id`),
  INDEX `idx_fsi_variant`    (`variant_id`),
  CONSTRAINT `fk_fsi_flash_sale` FOREIGN KEY (`flash_sale_id`) REFERENCES `flash_sales`(`id`)       ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_fsi_product`    FOREIGN KEY (`product_id`)    REFERENCES `products`(`id`)           ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_fsi_variant`    FOREIGN KEY (`variant_id`)    REFERENCES `product_variants`(`id`)   ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ************************************************************
-- PHẦN 14: THANH TOÁN — LOG GIAO DỊCH CỔNG THANH TOÁN
-- ************************************************************

-- [FIX Lỗi 4] Lưu log mọi giao dịch từ Webhook VNPay / MoMo
CREATE TABLE `payments` (
  `id`               BIGINT        NOT NULL AUTO_INCREMENT,
  `order_id`         BIGINT        NOT NULL,
  `transaction_id`   VARCHAR(255)  DEFAULT NULL COMMENT 'Mã giao dịch từ cổng thanh toán (vnp_TransactionNo, MoMo transId…)',
  `payment_method`   ENUM('COD','BANK_TRANSFER','MOMO','VNPAY') NOT NULL,
  `amount`           DECIMAL(15,2) NOT NULL COMMENT 'Số tiền giao dịch',
  `gateway_response` TEXT          DEFAULT NULL COMMENT 'JSON response gốc từ cổng thanh toán',
  `status`           ENUM(
                       'PENDING',     -- Đang chờ thanh toán
                       'SUCCESS',     -- Thanh toán thành công
                       'FAILED',      -- Thanh toán thất bại
                       'REFUNDED'     -- Đã hoàn tiền
                     ) NOT NULL DEFAULT 'PENDING',
  `paid_at`          DATETIME      DEFAULT NULL COMMENT 'Thời điểm cổng xác nhận thành công',
  `created_at`       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_pay_order`  (`order_id`),
  INDEX `idx_pay_txn`    (`transaction_id`),
  INDEX `idx_pay_status` (`status`),
  CONSTRAINT `fk_pay_order` FOREIGN KEY (`order_id`)
    REFERENCES `orders`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ************************************************************
-- BẬT LẠI FK CHECK
-- ************************************************************
SET FOREIGN_KEY_CHECKS = 1;


-- ************************************************************
-- PHẦN 16: DỮ LIỆU KHỞI TẠO (SEED)
-- ************************************************************

-- Roles mặc định
INSERT INTO `roles` (`id`, `role_name`) VALUES
  (1, 'CUSTOMER'),
  (2, 'BRANCH_STAFF'),
  (3, 'BRANCH_MANAGER'),
  (4, 'GLOBAL_ADMIN');
