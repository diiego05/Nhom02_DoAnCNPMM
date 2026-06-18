import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class TransferOrder extends Model {
    static associate(models) {
      TransferOrder.belongsTo(models.Branch, { foreignKey: "from_branch_id", as: "fromBranch" });
      TransferOrder.belongsTo(models.Branch, { foreignKey: "to_branch_id", as: "toBranch" });
      TransferOrder.belongsTo(models.User, { foreignKey: "created_by", as: "creator" });
      TransferOrder.belongsTo(models.User, { foreignKey: "approved_by", as: "approver" });
      TransferOrder.hasMany(models.TransferOrderItem, { foreignKey: "transfer_order_id", as: "items" });
    }
  }

  TransferOrder.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      from_branch_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      to_branch_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("PENDING", "APPROVED", "IN_TRANSIT", "COMPLETED", "CANCELLED"),
        allowNull: false,
        defaultValue: "PENDING",
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_by: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      approved_by: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "TransferOrder",
      tableName: "transfer_orders",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return TransferOrder;
};
