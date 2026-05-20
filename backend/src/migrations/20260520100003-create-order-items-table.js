"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("order_items", {
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
        onUpdate: "CASCADE",
      },
      product_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      product_variant_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      product_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      variant_color: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      variant_size: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      product_image_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      unit_price: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      total_price: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
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
    await queryInterface.dropTable("order_items");
  },
};
