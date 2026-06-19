import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class BlogPost extends Model {
    static associate(models) {
      BlogPost.belongsTo(models.User, { foreignKey: "author_id", as: "author" });
      BlogPost.belongsToMany(models.BlogTag, {
        through: "blog_post_tags",
        foreignKey: "post_id",
        otherKey: "tag_id",
        as: "tags",
      });
    }
  }

  BlogPost.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      author_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING(500),
        allowNull: false,
        unique: true,
      },
      summary: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      content: {
        type: DataTypes.TEXT("long"),
        allowNull: false,
      },
      thumbnail_url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("DRAFT", "PUBLISHED", "ARCHIVED"),
        allowNull: false,
        defaultValue: "DRAFT",
      },
      published_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      view_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "BlogPost",
      tableName: "blog_posts",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return BlogPost;
};
