export default {
  up: async (queryInterface, Sequelize) => {
    try {
      // 1. Add bank_account_name to shop_payouts
      await queryInterface.addColumn("shop_payouts", "bank_account_name", {
        type: Sequelize.STRING(200),
        allowNull: true,
      });
      console.log("Added bank_account_name to shop_payouts");
    } catch (err) {
      console.log("Skipping bank_account_name in shop_payouts:", err.message);
    }

    try {
      // 2. Update shop_orders status ENUM
      await queryInterface.sequelize.query(`
        ALTER TABLE shop_orders 
        MODIFY COLUMN status ENUM(
          'PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 
          'PICKED_UP', 'IN_TRANSIT', 'DELIVERING', 'DELIVERED', 
          'COMPLETED', 'CANCELLED', 'FAILED', 'RETURN_PENDING', 
          'RETURNED'
        ) NOT NULL DEFAULT 'PENDING';
      `);
      console.log("Updated shop_orders status ENUM");
    } catch (err) {
      console.log("Skipping shop_orders status ENUM update:", err.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn("shop_payouts", "bank_account_name");
    } catch(e) {}
    
    try {
      await queryInterface.sequelize.query(`
        ALTER TABLE shop_orders 
        MODIFY COLUMN status ENUM(
          'PENDING', 'PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP', 
          'DELIVERING', 'DELIVERED', 'CANCELLED', 'RETURN_PENDING', 
          'RETURNED'
        ) NOT NULL DEFAULT 'PENDING';
      `);
    } catch(e) {}
  },
};
