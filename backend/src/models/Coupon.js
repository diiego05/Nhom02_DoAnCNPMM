import { Model, DataTypes } from "sequelize";

export default (sequelize, DataTypes) => {
  class Coupon extends Model {
    static associate(models) {
      Coupon.hasMany(models.Order, { foreignKey: "coupon_id", as: "orders" });
      Coupon.hasMany(models.UserCouponUsage, { foreignKey: "coupon_id", as: "usages" });
    }
  }

  Coupon.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.STRING(300),
        allowNull: true,
      },
      discount_type: {
        type: DataTypes.ENUM("PERCENTAGE", "FIXED_AMOUNT"),
        allowNull: false,
        defaultValue: "PERCENTAGE",
      },
      discount_value: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      min_order_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      max_discount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
      },
      usage_limit: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      per_user_limit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      used_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "Coupon",
      tableName: "coupons",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Coupon;
};
