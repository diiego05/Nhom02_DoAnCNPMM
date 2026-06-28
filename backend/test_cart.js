import "dotenv/config";
import db from "./src/models/index.js";

async function run() {
  try {
    console.log("Attempting to delete multiple items [1, 2] for user 5/6...");
    await db.CartItem.destroy({ where: { id: [1, 2] } });
    console.log("Delete successful!");
  } catch (error) {
    console.error("Delete failed:", error.message);
  }
  
  const items = await db.CartItem.findAll();
  console.log("Remaining cart items:", items.map(i => ({ id: i.id, user_id: i.user_id, variant: i.variant_id })));
}
run();
