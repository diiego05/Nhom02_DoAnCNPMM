import { Model, DataTypes } from "sequelize";

export default (sequelize, DataTypes) => {
  class ProductReview extends Model {
    static associate(models) {
      ProductReview.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
      ProductReview.belongsTo(models.Product, { foreignKey: "product_id", as: "product" });
      ProductReview.belongsTo(models.ProductVariant, { foreignKey: "variant_id", as: "variant" });
      ProductReview.belongsTo(models.Order, { foreignKey: "order_id", as: "order" });
    }
  }

  ProductReview.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      product_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      variant_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      order_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      rating: {
        type: DataTypes.TINYINT,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      images: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_visible: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "ProductReview",
      tableName: "product_reviews",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return ProductReview;
};
