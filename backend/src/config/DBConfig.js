import db from "../models/index.js";

let connectDB = async () => {
  await db.sequelize.authenticate();
  await db.sequelize.sync({ alter: true });
  console.log("Connection has been established successfully.");
};

export { connectDB };

