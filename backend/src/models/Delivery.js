import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Delivery extends Model {
    static associate(models) {
      Delivery.belongsTo(models.Order, { foreignKey: "order_id", as: "order" });
      Delivery.belongsTo(models.Shipper, { foreignKey: "shipper_id", as: "shipper" });
    }
  }

  Delivery.init(
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
      shipper_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(
          "PICKING_UP",
          "PICKED_UP",
          "SHIPPING",
          "DELIVERED",
          "FAILED",
          "RETURNING",
          "RETURNED"
        ),
        allowNull: false,
        defaultValue: "PICKING_UP",
      },
      cod_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      cod_status: {
        type: DataTypes.ENUM("PENDING", "COLLECTED", "RECONCILED"),
        allowNull: false,
        defaultValue: "PENDING",
      },
      current_latitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true,
      },
      current_longitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Delivery",
      tableName: "deliveries",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Delivery;
};
