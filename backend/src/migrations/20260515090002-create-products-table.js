"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("products", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      category_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "categories",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      brand_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: "brands",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      material: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      gender: {
        type: Sequelize.ENUM("MALE", "FEMALE", "UNISEX"),
        defaultValue: "UNISEX",
      },
      price: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      sale_price: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
      },
      stock_quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      sold_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: Sequelize.ENUM("ACTIVE", "INACTIVE"),
        defaultValue: "ACTIVE",
      },
      is_featured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_new: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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
    await queryInterface.dropTable("products");
  },
};
