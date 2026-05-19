import { Model, DataTypes } from "sequelize";

export default (sequelize, DataTypes) => {
  class ProductAttribute extends Model {
    static associate(models) {
      ProductAttribute.belongsTo(models.Product, {
        foreignKey: "product_id",
        as: "product",
      });
    }
  }

  ProductAttribute.init(
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
      attr_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      attr_value: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "ProductAttribute",
      tableName: "product_attributes",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return ProductAttribute;
};
