import { Model, DataTypes } from "sequelize";

export default (sequelize, DataTypes) => {
  class ProductVariant extends Model {
    static associate(models) {
      ProductVariant.belongsTo(models.Product, {
        foreignKey: "product_id",
        as: "product",
      });
    }
  }

  ProductVariant.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      product_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      sku: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      color: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      color_hex: {
        type: DataTypes.STRING(10),
        allowNull: true,
        defaultValue: "#888888",
      },
      size: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
      },
      stock_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "ProductVariant",
      tableName: "product_variants",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return ProductVariant;
};
