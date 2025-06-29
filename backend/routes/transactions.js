const express = require("express");
const {
  getDashboardSummary,
  getDashboardTrends,
  getDashboardTrendsYearly,
  getRecentTransactions,
  getTransactions,
  getTransactionsTable,
  queryTransactions,
  exportTransactions,
} = require("../controllers/transactionController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Dashboard endpoints
router.get("/dashboard/summary", protect, getDashboardSummary);
router.get("/dashboard/trends/monthly", protect, getDashboardTrends);
router.get("/dashboard/trends/yearly", protect, getDashboardTrendsYearly);

// Transaction endpoints
router.get("/transactions/recent", protect, getRecentTransactions);
router.get("/transactions/table", protect, getTransactionsTable);
router.get("/transactions", protect, getTransactions);
router.post("/transactions/query", protect, queryTransactions);
router.post("/transactions/export", protect, exportTransactions);

module.exports = router;
