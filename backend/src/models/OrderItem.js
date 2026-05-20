import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class OrderItem extends Model {
    static associate(models) {
      OrderItem.belongsTo(models.Order, { foreignKey: "order_id", as: "order" });
      OrderItem.belongsTo(models.Product, { foreignKey: "product_id", as: "product" });
      OrderItem.belongsTo(models.ProductVariant, { foreignKey: "product_variant_id", as: "variant" });
    }
  }

  OrderItem.init(
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
      product_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      product_variant_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      product_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      variant_color: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      variant_size: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      product_image_url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      unit_price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      total_price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "OrderItem",
      tableName: "order_items",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return OrderItem;
};
