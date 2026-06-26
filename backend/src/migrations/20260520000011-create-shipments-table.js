"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("shipments", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      order_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "orders",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      tracking_code: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      provider: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM(
          "PENDING",
          "PICKED_UP",
          "IN_TRANSIT",
          "DELIVERED",
          "FAILED"
        ),
        allowNull: false,
        defaultValue: "PENDING",
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("shipments");
  },
};
