import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class FlashSaleItem extends Model {
    static associate(models) {
      FlashSaleItem.belongsTo(models.FlashSale, { foreignKey: "flash_sale_id", as: "flashSale" });
      FlashSaleItem.belongsTo(models.Product, { foreignKey: "product_id", as: "product" });
      FlashSaleItem.belongsTo(models.ProductVariant, { foreignKey: "variant_id", as: "variant" });
    }
  }

  FlashSaleItem.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      flash_sale_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      product_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      variant_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      discount_type: {
        type: DataTypes.ENUM("PERCENTAGE", "FIXED_AMOUNT", "FIXED_PRICE"),
        allowNull: false,
      },
      discount_value: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      stock_limit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      sold_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "FlashSaleItem",
      tableName: "flash_sale_items",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return FlashSaleItem;
};
