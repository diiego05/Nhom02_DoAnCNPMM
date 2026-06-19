import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Withdrawal extends Model {
    static associate(models) {
      Withdrawal.belongsTo(models.Shop, {
        foreignKey: "shop_id",
        as: "shop",
      });
    }
  }

  Withdrawal.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      shop_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      bank_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      account_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      account_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
        allowNull: false,
        defaultValue: "PENDING",
      },
    },
    {
      sequelize,
      modelName: "Withdrawal",
      tableName: "withdrawals",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Withdrawal;
};
