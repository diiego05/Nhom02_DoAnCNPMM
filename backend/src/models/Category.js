import { Model, DataTypes } from "sequelize";

export default (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.belongsTo(models.Category, {
        foreignKey: "parent_id",
        as: "parent",
      });
      Category.hasMany(models.Category, {
        foreignKey: "parent_id",
        as: "children",
      });
      Category.hasMany(models.Product, {
        foreignKey: "category_id",
        as: "products",
      });
    }
  }

  Category.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
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
      image_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      parent_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Category",
      tableName: "categories",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Category;
};
