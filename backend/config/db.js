const mongoose = require("mongoose");
const dbName = process.env.DB_NAME;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: dbName,
    });
    console.log(`MongoDB 已连接: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = { connectDB };
