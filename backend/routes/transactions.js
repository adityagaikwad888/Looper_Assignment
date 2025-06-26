const express = require("express");
const {
  getDashboardSummary,
  getDashboardTrends,
  getRecentTransactions,
  getTransactions,
  queryTransactions,
  exportTransactions,
} = require("../controllers/transactionController");

const router = express.Router();

// Dashboard endpoints
router.get("/dashboard/summary", getDashboardSummary);
router.get("/dashboard/trends", getDashboardTrends);

// Transaction endpoints
router.get("/transactions/recent", getRecentTransactions);
router.get("/transactions", getTransactions);
router.post("/transactions/query", queryTransactions);
router.post("/transactions/export", exportTransactions);

module.exports = router;
