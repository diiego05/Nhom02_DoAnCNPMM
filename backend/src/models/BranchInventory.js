import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class BranchInventory extends Model {
    static associate(models) {
      BranchInventory.belongsTo(models.Branch, { foreignKey: "branch_id", as: "branch" });
      BranchInventory.belongsTo(models.ProductVariant, { foreignKey: "variant_id", as: "variant" });
    }
  }

  BranchInventory.init(
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
      variant_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      reserved: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "BranchInventory",
      tableName: "branch_inventory",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return BranchInventory;
};
