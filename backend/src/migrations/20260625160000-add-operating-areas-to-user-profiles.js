/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE user_profiles
      ADD COLUMN operating_areas JSON DEFAULT NULL;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE user_profiles
      DROP COLUMN operating_areas;
    `);
  },
};
