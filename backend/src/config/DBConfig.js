import { Sequelize } from "sequelize";
import "dotenv/config";

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
  },
);

let connectDB = async () => {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
  console.log("Connection has been established successfully.");
};

export { sequelize, connectDB };
