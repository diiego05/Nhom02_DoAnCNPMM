"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Update products table to add vendor_id and brand_id
    try {
      await queryInterface.addColumn("products", "vendor_id", {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: "vendors",
          key: "id",
        },
        onDelete: "CASCADE",
      });
    } catch (error) {
      console.log("vendor_id column already exists or error occurred");
    }

    try {
      await queryInterface.addColumn("products", "brand_id", {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: "brands",
          key: "id",
        },
        onDelete: "SET NULL",
      });
    } catch (error) {
      console.log("brand_id column already exists or error occurred");
    }

    // Update status to match new enum values
    try {
      await queryInterface.changeColumn("products", "status", {
        type: Sequelize.ENUM("ACTIVE", "INACTIVE", "DRAFT"),
        allowNull: true,
      });
    } catch (error) {
      console.log("status column update failed or error occurred");
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeColumn("products", "vendor_id");
      await queryInterface.removeColumn("products", "brand_id");
    } catch (error) {
      console.log("Failed to remove columns from products");
    }
  },
};
