"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("inventories", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      variant_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "product_variants",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      branch_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "branches",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      stock_quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      reserved_quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    });

    // Add unique index
    await queryInterface.addIndex("inventories", {
      fields: ["variant_id", "branch_id"],
      unique: true,
      name: "uq_inventory",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("inventories");
  },
};
