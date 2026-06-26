/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE shop_orders
      ADD COLUMN delivered_at DATETIME DEFAULT NULL;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE shop_orders
      DROP COLUMN delivered_at;
    `);
  },
};
