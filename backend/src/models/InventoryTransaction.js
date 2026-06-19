import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class InventoryTransaction extends Model {
    static associate(models) {
      InventoryTransaction.belongsTo(models.Branch, { foreignKey: "branch_id", as: "branch" });
      InventoryTransaction.belongsTo(models.ProductVariant, { foreignKey: "variant_id", as: "variant" });
      InventoryTransaction.belongsTo(models.User, { foreignKey: "performed_by", as: "performer" });
    }
  }

  InventoryTransaction.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      branch_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      variant_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM(
          "IMPORT",
          "EXPORT_ONLINE",
          "EXPORT_OFFLINE",
          "STOCKTAKE_ADJUST",
          "TRANSFER_IN",
          "TRANSFER_OUT"
        ),
        allowNull: false,
      },
      quantity_change: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      quantity_before: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      quantity_after: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      reference_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      reference_type: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      performed_by: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "InventoryTransaction",
      tableName: "inventory_transactions",
      createdAt: "created_at",
      updatedAt: false,
    }
  );

  return InventoryTransaction;
};
