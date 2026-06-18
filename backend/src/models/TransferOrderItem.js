import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class TransferOrderItem extends Model {
    static associate(models) {
      TransferOrderItem.belongsTo(models.TransferOrder, { foreignKey: "transfer_order_id", as: "transferOrder" });
      TransferOrderItem.belongsTo(models.ProductVariant, { foreignKey: "variant_id", as: "variant" });
    }
  }

  TransferOrderItem.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      transfer_order_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      variant_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      received_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "TransferOrderItem",
      tableName: "transfer_order_items",
      timestamps: false,
    }
  );

  return TransferOrderItem;
};
