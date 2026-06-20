/** @type {import('sequelize-cli').Migration} */
export default {
  async up (queryInterface, Sequelize) {
    const tables = ['users', 'shops', 'products', 'product_variants', 'product_reviews', 'coupons'];
    for (const table of tables) {
      const tableDesc = await queryInterface.describeTable(table);
      if (!tableDesc.deleted_at) {
        await queryInterface.addColumn(table, 'deleted_at', {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: null
        });
      }
    }
  },

  async down (queryInterface, Sequelize) {
    const tables = ['users', 'shops', 'products', 'product_variants', 'product_reviews', 'coupons'];
    for (const table of tables) {
      const tableDesc = await queryInterface.describeTable(table).catch(() => null);
      if (tableDesc && tableDesc.deleted_at) {
        await queryInterface.removeColumn(table, 'deleted_at');
      }
    }
  }
};
