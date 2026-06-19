import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class StocktakeItem extends Model {
    static associate(models) {
      StocktakeItem.belongsTo(models.Stocktake, { foreignKey: "stocktake_id", as: "stocktake" });
      StocktakeItem.belongsTo(models.ProductVariant, { foreignKey: "variant_id", as: "variant" });
    }
  }

  StocktakeItem.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      stocktake_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      variant_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      system_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      actual_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "StocktakeItem",
      tableName: "stocktake_items",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return StocktakeItem;
};
