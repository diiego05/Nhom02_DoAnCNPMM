import { Model, DataTypes } from "sequelize";

export default (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.Role, {
        foreignKey: "role_id",
        as: "role",
      });

      User.hasOne(models.UserProfile, {
        foreignKey: "user_id",
        as: "profile",
      });

      User.hasOne(models.Shop, {
        foreignKey: "user_id",
        as: "shop",
      });

      User.hasMany(models.OtpVerification, {
        foreignKey: "user_id",
        as: "otpVerifications",
      });

      User.hasMany(models.RefreshToken, {
        foreignKey: "user_id",
        as: "refreshTokens",
      });

      User.hasOne(models.Cart, {
        foreignKey: "user_id",
        as: "cart",
      });

      User.hasMany(models.Order, {
        foreignKey: "user_id",
        as: "orders",
      });

      User.hasMany(models.Address, {
        foreignKey: "user_id",
        as: "addresses",
      });

      User.hasMany(models.ProductReview, {
        foreignKey: "user_id",
        as: "reviews",
      });

      User.hasMany(models.Wishlist, {
        foreignKey: "user_id",
        as: "wishlist",
      });

      User.hasMany(models.UserViewedProduct, {
        foreignKey: "user_id",
        as: "viewedProducts",
      });

      User.hasMany(models.UserCouponUsage, {
        foreignKey: "user_id",
        as: "couponUsages",
      });
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },

      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },

      phone: {
        type: DataTypes.STRING(20),
        allowNull: true, // Có thể null khi đăng nhập bằng Google
        unique: true,
      },

      password: {
        type: DataTypes.STRING(255),
        allowNull: true, // Có thể null khi đăng nhập bằng Google
      },

      auth_provider: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: "local", // 'local' hoặc 'google' hoặc 'facebook'
      },

      auth_provider_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      loyalty_points: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      status: {
        type: DataTypes.ENUM("PENDING", "ACTIVE", "LOCKED"),
        defaultValue: "PENDING",
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  return User;
};
