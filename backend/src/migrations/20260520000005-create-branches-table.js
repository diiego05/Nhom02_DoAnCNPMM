"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("branches", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      vendor_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "vendors",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      branch_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("branches");
  },
};
