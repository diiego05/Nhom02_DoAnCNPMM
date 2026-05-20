import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
      Order.hasMany(models.OrderItem, { foreignKey: "order_id", as: "items" });
      Order.hasMany(models.OrderStatusLog, {
        foreignKey: "order_id",
        as: "statusLogs",
      });
    }
  }

  Order.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      order_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      status: {
        type: DataTypes.ENUM(
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
        type: DataTypes.ENUM("COD", "VNPAY", "MOMO"),
        defaultValue: "COD",
      },
      payment_status: {
        type: DataTypes.ENUM("UNPAID", "PAID", "REFUNDED"),
        defaultValue: "UNPAID",
      },
      recipient_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      recipient_phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      shipping_address: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      subtotal: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      shipping_fee: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
      },
      discount_amount: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
      },
      total_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      confirmed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      cancelled_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Order",
      tableName: "orders",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Order;
};
