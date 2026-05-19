"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("product_variants", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      product_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "products",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      sku: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      color: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      color_hex: {
        type: Sequelize.STRING(10),
        allowNull: true,
        defaultValue: "#888888",
      },
      size: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      price: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true, // If null, use product base price
      },
      stock_quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("product_variants");
  },
};
