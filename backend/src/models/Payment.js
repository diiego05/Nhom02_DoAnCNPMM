import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      Payment.belongsTo(models.Order, { foreignKey: "order_id", as: "order" });
    }
  }

  Payment.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      order_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      transaction_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      payment_method: {
        type: DataTypes.ENUM("COD", "BANK_TRANSFER", "MOMO", "VNPAY"),
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      gateway_response: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("PENDING", "SUCCESS", "FAILED", "REFUNDED"),
        allowNull: false,
        defaultValue: "PENDING",
      },
      paid_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Payment",
      tableName: "payments",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Payment;
};
