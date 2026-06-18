import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class UserCouponUsage extends Model {
    static associate(models) {
      UserCouponUsage.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
      UserCouponUsage.belongsTo(models.Coupon, { foreignKey: "coupon_id", as: "coupon" });
      UserCouponUsage.belongsTo(models.Order, { foreignKey: "order_id", as: "order" });
    }
  }

  UserCouponUsage.init(
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
      coupon_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      order_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      used_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "UserCouponUsage",
      tableName: "user_coupon_usages",
      createdAt: "used_at",
      updatedAt: false, // only track creation time
    }
  );

  return UserCouponUsage;
};
