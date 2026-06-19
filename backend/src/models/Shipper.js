import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Shipper extends Model {
    static associate(models) {
      Shipper.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
      Shipper.hasMany(models.Delivery, { foreignKey: "shipper_id", as: "deliveries" });
    }
  }

  Shipper.init(
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
      vehicle_number: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      license_plate: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
        allowNull: false,
        defaultValue: "ACTIVE",
      },
    },
    {
      sequelize,
      modelName: "Shipper",
      tableName: "shippers",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Shipper;
};
