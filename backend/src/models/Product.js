import { Model, DataTypes } from "sequelize";

export default (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.Category, {
        foreignKey: "category_id",
        as: "category",
      });
      Product.belongsTo(models.Brand, {
        foreignKey: "brand_id",
        as: "brand",
      });
      Product.hasMany(models.ProductVariant, {
        foreignKey: "product_id",
        as: "variants",
      });
      Product.hasMany(models.ProductImage, {
        foreignKey: "product_id",
        as: "images",
      });
      Product.hasMany(models.ProductAttribute, {
        foreignKey: "product_id",
        as: "attributes",
      });
      Product.belongsTo(models.Shop, {
        foreignKey: "shop_id",
        as: "shop",
      });
    }
  }

  Product.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      category_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      brand_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      shop_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      material: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      gender: {
        type: DataTypes.ENUM("MALE", "FEMALE", "UNISEX"),
        defaultValue: "UNISEX",
      },
      price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      sale_price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
      },
      stock_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      sold_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
        defaultValue: "ACTIVE",
      },
      is_featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_new: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      view_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "Product",
      tableName: "products",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Product;
};
