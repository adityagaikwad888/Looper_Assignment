const express = require("express");
const {
  getDashboardSummary,
  getDashboardTrends,
  getDashboardTrendsYearly,
  getRecentTransactions,
  getTransactions,
  queryTransactions,
  exportTransactions,
} = require("../controllers/transactionController");

const router = express.Router();

// Dashboard endpoints
router.get("/dashboard/summary", getDashboardSummary);
router.get("/dashboard/trends/monthly", getDashboardTrends);
router.get("/dashboard/trends/yearly", getDashboardTrendsYearly);

// Transaction endpoints
router.get("/transactions/recent", getRecentTransactions);
router.get("/transactions", getTransactions);
router.post("/transactions/query", queryTransactions);
router.post("/transactions/export", exportTransactions);

module.exports = router;
