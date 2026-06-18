import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Shop extends Model {
    static associate(models) {
      Shop.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
      Shop.hasMany(models.Product, {
        foreignKey: "shop_id",
        as: "products",
      });
      Shop.hasMany(models.Coupon, {
        foreignKey: "shop_id",
        as: "coupons",
      });
      Shop.hasMany(models.Withdrawal, {
        foreignKey: "shop_id",
        as: "withdrawals",
      });
    }
  }

  Shop.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      industry: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      avatar_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      cover_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      rating: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: false,
        defaultValue: 5.00,
      },
      followers_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      response_rate: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 100,
      },
      status: {
        type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
        allowNull: false,
        defaultValue: "ACTIVE",
      },
    },
    {
      sequelize,
      modelName: "Shop",
      tableName: "shops",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Shop;
};
