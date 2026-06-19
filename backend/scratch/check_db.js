import db from "../src/models/index.js";

const run = async () => {
  try {
    const shops = await db.Shop.findAll();
    console.log(`=== SHOPS COUNT: ${shops.length} ===`);
    shops.forEach(s => {
      console.log(`Shop ID: ${s.id}, Name: ${s.name}, User ID: ${s.user_id}`);
    });

    const products = await db.Product.findAll({ limit: 5 });
    console.log(`=== PRODUCTS SAMPLE ===`);
    products.forEach(p => {
      console.log(`Product ID: ${p.id}, Name: ${p.name}, Shop ID: ${p.shop_id}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
