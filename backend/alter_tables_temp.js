import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "fashion_marketplace",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "1042005trungall",
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: console.log,
  }
);

async function run() {
  try {
    console.log("Altering shop_orders status ENUM...");
    await sequelize.query(`
      ALTER TABLE shop_orders 
      MODIFY COLUMN status ENUM('PENDING', 'PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP', 'DELIVERING', 'DELIVERED', 'CANCELLED', 'RETURN_PENDING', 'RETURNED', 'COMPLETED') 
      NOT NULL DEFAULT 'PENDING';
    `);
    console.log("Altering shop_payouts status ENUM...");
    await sequelize.query(`
      ALTER TABLE shop_payouts 
      MODIFY COLUMN status ENUM('PENDING', 'PENDING_APPROVAL', 'PROCESSING', 'COMPLETED', 'REJECTED') 
      NOT NULL DEFAULT 'PENDING';
    `);
    console.log("Database altered successfully!");
  } catch (err) {
    console.error("Error running migrations:", err);
  } finally {
    await sequelize.close();
  }
}

run();
