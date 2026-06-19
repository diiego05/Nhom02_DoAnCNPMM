import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class BranchStaff extends Model {
    static associate(models) {
      BranchStaff.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
      BranchStaff.belongsTo(models.Branch, { foreignKey: "branch_id", as: "branch" });
    }
  }

  BranchStaff.init(
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
      branch_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      position: {
        type: DataTypes.ENUM("STAFF", "MANAGER"),
        allowNull: false,
        defaultValue: "STAFF",
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "BranchStaff",
      tableName: "branch_staff",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return BranchStaff;
};
