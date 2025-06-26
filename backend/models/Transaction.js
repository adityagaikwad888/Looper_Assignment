const mongoose = require("mongoose");

// Create connection to transactions database
const transactionConnection = mongoose.createConnection(
  process.env.TRANSACTION_MONGODB_URI ||
    "mongodb://127.0.0.1:27017/transactionsData"
);

const transactionSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    date: {
      type: Date,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Revenue", "Expense"],
    },
    status: {
      type: String,
      required: true,
      enum: ["Paid", "Pending"],
    },
    user_id: {
      type: String,
      required: true,
    },
    user_profile: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
transactionSchema.index({ date: -1 });
transactionSchema.index({ category: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ user_id: 1 });

const Transaction = transactionConnection.model(
  "Transaction",
  transactionSchema,
  "transactions"
);

module.exports = Transaction;
