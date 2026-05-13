"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true,
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true, // Cho phép null để hỗ trợ Google Login
        unique: true,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: true, // Cho phép null để hỗ trợ Google Login
      },
      auth_provider: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: "local",
      },
      auth_provider_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("PENDING", "ACTIVE", "LOCKED"),
        defaultValue: "PENDING",
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
    await queryInterface.dropTable("users");
  },
};
