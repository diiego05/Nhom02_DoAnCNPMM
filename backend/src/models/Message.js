import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Message extends Model {
    static associate(models) {
      Message.belongsTo(models.User, {
        foreignKey: "sender_id",
        as: "sender",
      });
      Message.belongsTo(models.User, {
        foreignKey: "receiver_id",
        as: "receiver",
      });
    }
  }

  Message.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      sender_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      receiver_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Message",
      tableName: "messages",
      createdAt: "created_at",
      updatedAt: false, // Tin nhắn thường không cập nhật, chỉ có thời điểm tạo
    }
  );

  return Message;
 };
