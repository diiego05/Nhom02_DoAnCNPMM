import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Cart extends Model {
    static associate(models) {
      Cart.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
      Cart.hasMany(models.CartItem, { foreignKey: "cart_id", as: "items" });
    }
  }

  Cart.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "Cart",
      tableName: "carts",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Cart;
};
