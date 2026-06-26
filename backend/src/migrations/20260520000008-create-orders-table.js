"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("orders", {
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
        onUpdate: "CASCADE",
      },
      order_code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      status: {
        type: Sequelize.ENUM(
          "PENDING",
          "CONFIRMED",
          "PREPARING",
          "SHIPPING",
          "DELIVERED",
          "CANCELLED",
          "CANCEL_REQUESTED"
        ),
        defaultValue: "PENDING",
      },
      payment_method: {
        type: Sequelize.ENUM("COD", "VNPAY", "MOMO"),
        defaultValue: "COD",
      },
      payment_status: {
        type: Sequelize.ENUM("UNPAID", "PAID", "REFUNDED"),
        defaultValue: "UNPAID",
      },
      recipient_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      recipient_phone: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      shipping_address: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      subtotal: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      shipping_fee: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0,
      },
      discount_amount: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0,
      },
      total_amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      note: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      confirmed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      cancelled_at: {
        type: Sequelize.DATE,
        allowNull: true,
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
    await queryInterface.dropTable("orders");
  },
};
