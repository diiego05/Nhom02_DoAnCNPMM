/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable('shop_orders');
    if (!tableDesc.points_used) {
      await queryInterface.addColumn('shop_orders', 'points_used', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Số điểm tiêu thụ cho đơn nhỏ này'
      });
    }
    if (!tableDesc.points_earned) {
      await queryInterface.addColumn('shop_orders', 'points_earned', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Số điểm sẽ được cộng khi giao thành công'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable('shop_orders');
    if (tableDesc.points_used) {
      await queryInterface.removeColumn('shop_orders', 'points_used');
    }
    if (tableDesc.points_earned) {
      await queryInterface.removeColumn('shop_orders', 'points_earned');
    }
  }
};
