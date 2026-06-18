import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class BlogTag extends Model {
    static associate(models) {
      BlogTag.belongsToMany(models.BlogPost, {
        through: "blog_post_tags",
        foreignKey: "tag_id",
        otherKey: "post_id",
        as: "posts",
      });
    }
  }

  BlogTag.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "BlogTag",
      tableName: "blog_tags",
      timestamps: false,
    }
  );

  return BlogTag;
};
