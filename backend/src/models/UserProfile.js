import { Model, DataTypes } from "sequelize";

export default (sequelize, DataTypes) => {
  class UserProfile extends Model {
    static associate(models) {
      UserProfile.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  }

  UserProfile.init(
    {
      user_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
      },

      full_name: {
        type: DataTypes.STRING(200),
      },

      date_of_birth: {
        type: DataTypes.DATE,
      },

      gender: {
        type: DataTypes.ENUM("male", "female", "other"),
      },

      id_card: {
        type: DataTypes.STRING(20),
        unique: true,
      },

      avatar_url: {
        type: DataTypes.TEXT,
      },

      cover_photo_url: {
        type: DataTypes.TEXT,
      },
    },
    {
      sequelize,
      modelName: "UserProfile",
      tableName: "user_profiles",
      createdAt: false,
      updatedAt: "updated_at",
    },
  );

  return UserProfile;
};
