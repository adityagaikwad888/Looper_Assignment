const Transaction = require("../models/Transaction");
const { logger } = require("../middleware/logging");

// Helper function to get month name from date
const getMonthName = (date) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return months[new Date(date).getMonth()];
};

// 1. Dashboard Summary Cards - GET /dashboard/summary
const getDashboardSummary = async (req, res) => {
  try {
    console.log("� ROUTE HIT: /dashboard/summary");

    // Test if we can connect to DB at all
    const allTransactions = await Transaction.find({});
    console.log(`📊 Total transactions in DB: ${allTransactions.length}`);

    if (allTransactions.length > 0) {
      console.log("First transaction:", allTransactions[0]);
    }

    const paidTransactions = await Transaction.find({ status: "Paid" });
    console.log(`💳 Paid transactions: ${paidTransactions.length}`);

    let totalRevenue = 0;
    let totalExpenses = 0;

    paidTransactions.forEach((transaction) => {
      console.log(
        `Processing: ${transaction.category} - ${transaction.amount}`
      );
      if (transaction.category === "Revenue") {
        totalRevenue += transaction.amount;
      } else if (transaction.category === "Expense") {
        totalExpenses += transaction.amount;
      }
    });

    console.log(`💰 Total Revenue: ${totalRevenue}`);
    console.log(`💸 Total Expenses: ${totalExpenses}`);

    const balance = totalRevenue - totalExpenses;
    const savings = balance > 0 ? balance : 0;

    const summary = {
      balance: parseFloat(balance.toFixed(2)),
      revenue: parseFloat(totalRevenue.toFixed(2)),
      expenses: parseFloat(totalExpenses.toFixed(2)),
      savings: parseFloat(savings.toFixed(2)),
    };

    logger.info("Dashboard summary retrieved successfully");
    res.json(summary);
  } catch (error) {
    logger.error("Error getting dashboard summary:", error);
    res.status(500).json({ message: "Error retrieving dashboard summary" });
  }
};

// 2. Overview Line Chart - GET /dashboard/trends
const getDashboardTrends = async (req, res) => {
  try {
    const transactions = await Transaction.find({ status: "Paid" });

    // Group transactions by month
    const monthlyData = {};

    transactions.forEach((transaction) => {
      const month = getMonthName(transaction.date);

      if (!monthlyData[month]) {
        monthlyData[month] = { month, income: 0, expenses: 0 };
      }

      if (transaction.category === "Revenue") {
        monthlyData[month].income += transaction.amount;
      } else if (transaction.category === "Expense") {
        monthlyData[month].expenses += transaction.amount;
      }
    });

    // Convert to array and sort by month order
    const monthOrder = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const trends = monthOrder
      .filter((month) => monthlyData[month])
      .map((month) => ({
        month,
        income: parseFloat(monthlyData[month].income.toFixed(2)),
        expenses: parseFloat(monthlyData[month].expenses.toFixed(2)),
      }));

    logger.info("Dashboard trends retrieved successfully");
    res.json(trends);
  } catch (error) {
    logger.error("Error getting dashboard trends:", error);
    res.status(500).json({ message: "Error retrieving dashboard trends" });
  }
};

// 3. Recent Transactions Sidebar - GET /transactions/recent
const getRecentTransactions = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const recentTransactions = await Transaction.find()
      .sort({ date: -1 })
      .limit(limit)
      .select("id amount category date user_id");

    const formattedTransactions = recentTransactions.map((transaction) => ({
      id: transaction.id,
      name: `Transaction #${transaction.id}`,
      amount: transaction.amount,
      type: transaction.category.toLowerCase(),
      date: transaction.date,
      user_id: transaction.user_id,
    }));

    logger.info(`${recentTransactions.length} recent transactions retrieved`);
    res.json(formattedTransactions);
  } catch (error) {
    logger.error("Error getting recent transactions:", error);
    res.status(500).json({ message: "Error retrieving recent transactions" });
  }
};

// 4. Transactions Table - GET /transactions
const getTransactions = async (req, res) => {
  try {
    const {
      search,
      status,
      category,
      dateFrom,
      dateTo,
      sortBy = "date",
      order = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    // Build query object
    const query = {};

    // Search functionality (search in user_id for now, can be extended)
    if (search) {
      query.$or = [
        { user_id: { $regex: search, $options: "i" } },
        { id: isNaN(search) ? undefined : parseInt(search) },
      ].filter(Boolean);
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) {
        query.date.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.date.$lte = new Date(dateTo);
      }
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sortOrder = order === "desc" ? -1 : 1;
    const sortObj = { [sortBy]: sortOrder };

    // Execute query
    const transactions = await Transaction.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const totalCount = await Transaction.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limitNum);

    const response = {
      transactions,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    };

    logger.info(
      `${transactions.length} transactions retrieved (page ${pageNum})`
    );
    res.json(response);
  } catch (error) {
    logger.error("Error getting transactions:", error);
    res.status(500).json({ message: "Error retrieving transactions" });
  }
};

module.exports = {
  getDashboardSummary,
  getDashboardTrends,
  getRecentTransactions,
  getTransactions,
};
