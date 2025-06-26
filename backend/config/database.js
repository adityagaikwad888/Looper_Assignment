const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Default connection for auth
    const authConn = await mongoose.connect(
      process.env.AUTH_MONGODB_URI || "mongodb://127.0.0.1:27017/auth_system"
    );

    console.log(`Auth MongoDB Connected: ${authConn.connection.host}`);

    // Create separate connection for transactions
    const transactionConn = mongoose.createConnection(
      process.env.TRANSACTION_MONGODB_URI ||
        "mongodb://127.0.0.1:27017/transactionsData"
    );

    console.log(`Transaction MongoDB Connected: ${transactionConn.host}`);

    return { authConn, transactionConn };
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    console.error("Make sure MongoDB is running on your system");
    console.error("You can start MongoDB by running: mongod");
    process.exit(1);
  }
};

module.exports = connectDB;
