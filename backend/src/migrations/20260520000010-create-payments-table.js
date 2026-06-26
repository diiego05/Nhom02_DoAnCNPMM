"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("payments", {
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
      payment_method: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      transaction_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("PENDING", "SUCCESS", "FAILED", "REFUNDED"),
        allowNull: false,
        defaultValue: "PENDING",
      },
      paid_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("payments");
  },
};
