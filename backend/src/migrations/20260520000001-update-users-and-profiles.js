"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Add auth_provider to users table if it doesn't exist
    try {
      await queryInterface.addColumn("users", "auth_provider", {
        type: Sequelize.STRING(50),
        defaultValue: "local",
        allowNull: false,
      });
    } catch (error) {
      // Column might already exist
      console.log("auth_provider column already exists or error occurred");
    }

    // Update UserProfiles table fields
    try {
      await queryInterface.addColumn("user_profiles", "full_name", {
        type: Sequelize.STRING(200),
        allowNull: true,
      });
    } catch (error) {
      console.log("full_name column already exists or error occurred");
    }

    try {
      await queryInterface.addColumn("user_profiles", "date_of_birth", {
        type: Sequelize.DATE,
        allowNull: true,
      });
    } catch (error) {
      console.log("date_of_birth column already exists or error occurred");
    }

    try {
      await queryInterface.addColumn("user_profiles", "address", {
        type: Sequelize.STRING(500),
        allowNull: true,
      });
    } catch (error) {
      console.log("address column already exists or error occurred");
    }

    try {
      await queryInterface.addColumn("user_profiles", "gender", {
        type: Sequelize.ENUM("male", "female", "other"),
        allowNull: true,
      });
    } catch (error) {
      console.log("gender column already exists or error occurred");
    }

    try {
      await queryInterface.addColumn("user_profiles", "id_card", {
        type: Sequelize.STRING(50),
        allowNull: true,
      });
    } catch (error) {
      console.log("id_card column already exists or error occurred");
    }

    try {
      await queryInterface.addColumn("user_profiles", "avatar_url", {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    } catch (error) {
      console.log("avatar_url column already exists or error occurred");
    }

    try {
      await queryInterface.addColumn("user_profiles", "cover_photo_url", {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    } catch (error) {
      console.log("cover_photo_url column already exists or error occurred");
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeColumn("users", "auth_provider");
    } catch (error) {
      console.log("Failed to remove auth_provider");
    }

    try {
      await queryInterface.removeColumn("user_profiles", "full_name");
      await queryInterface.removeColumn("user_profiles", "date_of_birth");
      await queryInterface.removeColumn("user_profiles", "address");
      await queryInterface.removeColumn("user_profiles", "gender");
      await queryInterface.removeColumn("user_profiles", "id_card");
      await queryInterface.removeColumn("user_profiles", "avatar_url");
      await queryInterface.removeColumn("user_profiles", "cover_photo_url");
    } catch (error) {
      console.log("Failed to remove columns from user_profiles");
    }
  },
};
