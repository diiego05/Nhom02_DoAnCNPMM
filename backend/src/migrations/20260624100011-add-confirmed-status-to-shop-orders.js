/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE shop_orders 
      MODIFY COLUMN status ENUM('PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP', 'DELIVERING', 'DELIVERED', 'CANCELLED', 'RETURN_PENDING', 'RETURNED') 
      NOT NULL DEFAULT 'PENDING';
    `);
  },

  async down(queryInterface, Sequelize) {
    // We cannot easily remove a value from ENUM without recreating it or it depends on the DB.
    // Usually it's safer to just leave it in the down migration or recreate the original ENUM if no records use 'CONFIRMED'.
    await queryInterface.sequelize.query(`
      ALTER TABLE shop_orders 
      MODIFY COLUMN status ENUM('PENDING', 'PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP', 'DELIVERING', 'DELIVERED', 'CANCELLED', 'RETURN_PENDING', 'RETURNED') 
      NOT NULL DEFAULT 'PENDING';
    `);
  },
};
