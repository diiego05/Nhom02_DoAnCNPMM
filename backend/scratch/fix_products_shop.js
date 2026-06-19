import db from "../src/models/index.js";

const run = async () => {
  try {
    const defaultShop = await db.Shop.findOne();
    if (!defaultShop) {
      console.log("No shop found in the database. Please register/create a shop first.");
      process.exit(1);
    }
    
    console.log(`Using default Shop ID: ${defaultShop.id} (${defaultShop.name})`);
    
    // Update all products where shop_id is null
    const [affectedCount] = await db.Product.update(
      { shop_id: defaultShop.id },
      { where: { shop_id: null } }
    );
    
    console.log(`Updated ${affectedCount} products to associate with Shop ID ${defaultShop.id}`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
