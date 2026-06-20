/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Thêm cột 'note' vào bảng 'parent_orders' nếu chưa có
    const tableDesc = await queryInterface.describeTable('parent_orders');
    if (!tableDesc.note) {
      await queryInterface.addColumn('parent_orders', 'note', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Ghi chú cho đơn hàng'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable('parent_orders');
    if (tableDesc.note) {
      await queryInterface.removeColumn('parent_orders', 'note');
    }
  }
};
