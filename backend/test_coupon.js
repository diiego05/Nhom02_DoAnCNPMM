import "dotenv/config";
import db from "./src/models/index.js";

async function run() {
  const categories = await db.Category.findAll();
  console.log("Categories:");
  categories.forEach(c => {
    console.log(`- ID: ${c.id}, Name: ${c.name}`);
  });
}
run();
