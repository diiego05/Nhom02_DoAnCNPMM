export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('shop_orders', 'status', {
      type: Sequelize.ENUM(
        'PENDING',
        'CONFIRMED',
        'PREPARING',
        'SHIPPING',
        'DELIVERED',
        'COMPLETED',
        'CANCEL_REQUESTED',
        'CANCELLED',
        'FAILED',
        'RETURN_PENDING',
        'RETURNED'
      ),
      allowNull: false,
      defaultValue: 'PENDING'
    });
  },

  down: async (queryInterface, Sequelize) => {
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
      allowNull: false,
      defaultValue: 'PENDING'
    });
  }
};
