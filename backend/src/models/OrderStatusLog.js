import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class OrderStatusLog extends Model {
    static associate(models) {
      OrderStatusLog.belongsTo(models.Order, { foreignKey: "order_id", as: "order" });
      OrderStatusLog.belongsTo(models.User, { foreignKey: "changed_by", as: "changer" });
    }
  }

  OrderStatusLog.init(
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
      from_status: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      to_status: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      changed_by: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "OrderStatusLog",
      tableName: "order_status_logs",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return OrderStatusLog;
};
