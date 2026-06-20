import { Model, DataTypes } from "sequelize";

export default (sequelize, DataTypes) => {
  class Message extends Model {
    static associate(models) {
      Message.belongsTo(models.Conversation, { foreignKey: "conversation_id", as: "conversation" });
      Message.belongsTo(models.User, { foreignKey: "sender_id", as: "sender" });
    }
  }

  Message.init(
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      conversation_id: { type: DataTypes.BIGINT, allowNull: false },
      sender_id: { type: DataTypes.BIGINT, allowNull: false },
      body: { type: DataTypes.TEXT, allowNull: false },
      is_read: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    },
    {
      sequelize,
      modelName: "Message",
      tableName: "messages",
      createdAt: "sent_at",
      updatedAt: false,
    }
  );

  return Message;
};
