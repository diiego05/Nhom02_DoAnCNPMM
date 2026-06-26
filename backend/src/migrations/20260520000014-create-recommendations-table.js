"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("recommendations", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      product_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "products",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      score: {
        type: Sequelize.DECIMAL(5, 4),
        allowNull: false,
      },
      generated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("recommendations");
  },
};
