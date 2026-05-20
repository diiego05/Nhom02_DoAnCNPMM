import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class CartItem extends Model {
    static associate(models) {
      CartItem.belongsTo(models.Cart, {
        foreignKey: "cart_id",
        as: "cart",
      });
      CartItem.belongsTo(models.Product, {
        foreignKey: "product_id",
        as: "product",
      });
      CartItem.belongsTo(models.ProductVariant, {
        foreignKey: "product_variant_id",
        as: "variant",
      });
    }
  }

  CartItem.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      cart_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      product_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      product_variant_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      unit_price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "CartItem",
      tableName: "cart_items",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return CartItem;
};
