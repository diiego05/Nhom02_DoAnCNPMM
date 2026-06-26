/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // 1. Update shop_orders status column to include COMPLETED
    await queryInterface.sequelize.query(`
      ALTER TABLE shop_orders 
      MODIFY COLUMN status ENUM('PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERING', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'FAILED', 'RETURN_PENDING', 'RETURNED') 
      NOT NULL DEFAULT 'PENDING';
    `);

    // 2. Add cod_status column to shop_orders
    await queryInterface.sequelize.query(`
      ALTER TABLE shop_orders
      ADD COLUMN cod_status ENUM('NOT_COD', 'HELD_BY_SHIPPER', 'SUBMITTED', 'CONFIRMED', 'MISMATCH') NOT NULL DEFAULT 'NOT_COD';
    `);

    // 3. Create shipper_reconciliations table
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS shipper_reconciliations (
        id BIGINT NOT NULL AUTO_INCREMENT,
        shipper_id BIGINT NOT NULL,
        amount_submitted DECIMAL(15,2) NOT NULL,
        status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
        confirmed_by BIGINT DEFAULT NULL,
        note TEXT DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT fk_sr_shipper FOREIGN KEY (shipper_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
        CONSTRAINT fk_sr_processor FOREIGN KEY (confirmed_by) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Add shipper_reconciliation_id to shop_orders
    await queryInterface.sequelize.query(`
      ALTER TABLE shop_orders
      ADD COLUMN shipper_reconciliation_id BIGINT DEFAULT NULL,
      ADD CONSTRAINT fk_so_reconciliation FOREIGN KEY (shipper_reconciliation_id) REFERENCES shipper_reconciliations(id) ON UPDATE CASCADE ON DELETE SET NULL;
    `);

    // 5. Seed shop_wallets for existing shops to avoid null/missing issues
    await queryInterface.sequelize.query(`
      INSERT IGNORE INTO shop_wallets (shop_id, balance, pending_balance, total_earned)
      SELECT id, 0.00, 0.00, 0.00 FROM shops;
    `);
  },

  async down(queryInterface, Sequelize) {
    // 1. Remove foreign key and column from shop_orders
    await queryInterface.sequelize.query(`
      ALTER TABLE shop_orders DROP FOREIGN KEY fk_so_reconciliation;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE shop_orders DROP COLUMN shipper_reconciliation_id;
    `);

    // 2. Drop shipper_reconciliations table
    await queryInterface.sequelize.query(`
      DROP TABLE IF EXISTS shipper_reconciliations;
    `);

    // 3. Remove cod_status column from shop_orders
    await queryInterface.sequelize.query(`
      ALTER TABLE shop_orders DROP COLUMN cod_status;
    `);

    // 4. Revert shop_orders status column
    await queryInterface.sequelize.query(`
      ALTER TABLE shop_orders 
      MODIFY COLUMN status ENUM('PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERING', 'DELIVERED', 'CANCELLED', 'FAILED', 'RETURN_PENDING', 'RETURNED') 
      NOT NULL DEFAULT 'PENDING';
    `);
  },
};
