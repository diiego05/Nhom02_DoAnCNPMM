"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("user_profiles", {
      user_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.BIGINT,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      full_name: {
        type: Sequelize.STRING(200),
      },
      date_of_birth: {
        type: Sequelize.DATE,
      },
      address: {
        type: Sequelize.STRING(200),
      },
      gender: {
        type: Sequelize.ENUM("male", "female", "other"),
      },
      id_card: {
        type: Sequelize.STRING(20),
        unique: true,
      },
      avatar_url: {
        type: Sequelize.TEXT,
      },
      cover_photo_url: {
        type: Sequelize.TEXT,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("user_profiles");
  },
};
