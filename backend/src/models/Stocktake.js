import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Stocktake extends Model {
    static associate(models) {
      Stocktake.belongsTo(models.Branch, { foreignKey: "branch_id", as: "branch" });
      Stocktake.belongsTo(models.User, { foreignKey: "created_by", as: "creator" });
      Stocktake.hasMany(models.StocktakeItem, { foreignKey: "stocktake_id", as: "items" });
    }
  }

  Stocktake.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      branch_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      status: {
        type: DataTypes.ENUM("IN_PROGRESS", "COMPLETED", "CANCELLED"),
        allowNull: false,
        defaultValue: "IN_PROGRESS",
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_by: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Stocktake",
      tableName: "stocktakes",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Stocktake;
};
