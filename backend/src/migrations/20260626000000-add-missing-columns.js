export default {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn("product_variants", "image_url", {
        type: Sequelize.TEXT,
        allowNull: true,
      });
      console.log("Added image_url to product_variants");
    } catch (err) {
      console.log("Skipping image_url in product_variants:", err.message);
    }

    try {
      await queryInterface.addColumn("coupons", "category_id", {
        type: Sequelize.BIGINT,
        allowNull: true,
      });
      console.log("Added category_id to coupons");
    } catch (err) {
      console.log("Skipping category_id in coupons:", err.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("product_variants", "image_url");
    await queryInterface.removeColumn("coupons", "category_id");
  },
};
