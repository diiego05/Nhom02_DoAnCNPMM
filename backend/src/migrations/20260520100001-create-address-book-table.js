"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("address_book", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      recipient_name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      address_line: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      ward: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      district: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      province: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      is_default: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex("address_book", ["user_id"], {
      name: "idx_address_book_user_id",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("address_book");
  },
};
