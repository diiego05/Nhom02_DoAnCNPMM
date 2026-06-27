export default {
  up: async (queryInterface, Sequelize) => {
    // 1. Update existing rows to 'SHIPPING' if they are in shipper statuses
    await queryInterface.sequelize.query(`
      UPDATE shop_orders 
      SET status = 'SHIPPING' 
      WHERE status IN ('READY_FOR_PICKUP', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERING')
    `);

    // 2. Alter the ENUM column
    await queryInterface.changeColumn('shop_orders', 'status', {
      type: Sequelize.ENUM(
        'PENDING',
        'CONFIRMED',
        'PREPARING',
        'SHIPPING',
        'DELIVERED',
        'CANCEL_REQUESTED',
        'CANCELLED',
        'FAILED',
        'RETURN_PENDING',
        'RETURNED'
      ),
      defaultValue: 'PENDING'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the ENUM to include shipper statuses
    await queryInterface.changeColumn('shop_orders', 'status', {
      type: Sequelize.ENUM(
        'PENDING',
        'CONFIRMED',
        'PREPARING',
        'READY_FOR_PICKUP',
        'PICKED_UP',
        'IN_TRANSIT',
        'DELIVERING',
        'SHIPPING',
        'DELIVERED',
        'CANCEL_REQUESTED',
        'CANCELLED',
        'FAILED',
        'RETURN_PENDING',
        'RETURNED'
      ),
      defaultValue: 'PENDING'
    });
  }
};
