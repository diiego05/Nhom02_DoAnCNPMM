import db from "../models/index.js";

let connectDB = async () => {
  await db.sequelize.authenticate();
  
  try {
    console.log("Running manual database migrations for shop_orders and shop_payouts...");
    await db.sequelize.query(`
      ALTER TABLE shop_orders 
      MODIFY COLUMN status ENUM('PENDING', 'PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP', 'DELIVERING', 'DELIVERED', 'CANCELLED', 'RETURN_PENDING', 'RETURNED', 'COMPLETED') 
      NOT NULL DEFAULT 'PENDING';
    `);
    await db.sequelize.query(`
      ALTER TABLE shop_payouts 
      MODIFY COLUMN status ENUM('PENDING', 'PENDING_APPROVAL', 'PROCESSING', 'COMPLETED', 'REJECTED') 
      NOT NULL DEFAULT 'PENDING';
    `);
    try {
      await db.sequelize.query(`
        ALTER TABLE shop_payouts 
        ADD COLUMN bank_account_name VARCHAR(200) DEFAULT NULL AFTER bank_account;
      `);
      console.log("Added bank_account_name column to shop_payouts.");
    } catch (colErr) {
      console.log("Column bank_account_name already exists or failed to add:", colErr.message);
    }
    console.log("Manual database migrations executed successfully.");
  } catch (err) {
    console.log("Manual migration skipped/already completed:", err.message);
  }

  await db.sequelize.sync();
  console.log("Connection has been established successfully.");
};

export { connectDB };

