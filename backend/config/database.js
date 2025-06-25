const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/auth_system"
    );

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    console.error("Make sure MongoDB is running on your system");
    console.error("You can start MongoDB by running: mongod");
    process.exit(1);
  }
};

module.exports = connectDB;
