import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class BlogPostTag extends Model {}

  BlogPostTag.init(
    {
      post_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        allowNull: false,
      },
      tag_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "BlogPostTag",
      tableName: "blog_post_tags",
      timestamps: false,
    }
  );

  return BlogPostTag;
};
