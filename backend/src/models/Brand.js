import { Model, DataTypes } from "sequelize";

export default (sequelize, DataTypes) => {
  class Brand extends Model {
    static associate(models) {
      Brand.hasMany(models.Product, {
        foreignKey: "brand_id",
        as: "products",
      });
    }
  }

  Brand.init(
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
      logo_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Brand",
      tableName: "brands",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Brand;
};
