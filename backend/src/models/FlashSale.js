import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class FlashSale extends Model {
    static associate(models) {
      FlashSale.belongsTo(models.User, { foreignKey: "created_by", as: "creator" });
      FlashSale.hasMany(models.FlashSaleItem, { foreignKey: "flash_sale_id", as: "items" });
    }
  }

  FlashSale.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      start_time: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_time: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("SCHEDULED", "ACTIVE", "ENDED", "CANCELLED"),
        allowNull: false,
        defaultValue: "SCHEDULED",
      },
      created_by: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "FlashSale",
      tableName: "flash_sales",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return FlashSale;
};
