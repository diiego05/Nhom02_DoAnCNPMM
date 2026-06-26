/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE shop_orders 
      MODIFY COLUMN status ENUM('PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERING', 'DELIVERED', 'CANCELLED', 'FAILED', 'RETURN_PENDING', 'RETURNED') 
      NOT NULL DEFAULT 'PENDING';
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE shop_orders 
      MODIFY COLUMN status ENUM('PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP', 'DELIVERING', 'DELIVERED', 'CANCELLED', 'RETURN_PENDING', 'RETURNED') 
      NOT NULL DEFAULT 'PENDING';
    `);
  },
};
