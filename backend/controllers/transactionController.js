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

// 2.1. Yearly Trends - GET /dashboard/trends/yearly
const getDashboardTrendsYearly = async (req, res) => {
  try {
    console.log(`📅 Fetching yearly trends for all available years`);

    // Get all paid transactions to find the year range
    const allTransactions = await Transaction.find({ status: "Paid" });

    if (allTransactions.length === 0) {
      return res.json([]);
    }

    // Find the smallest and largest years in the database
    const years = allTransactions.map((transaction) =>
      new Date(transaction.date).getFullYear()
    );
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);

    console.log(
      `📊 Found data from ${minYear} to ${maxYear} (${allTransactions.length} transactions)`
    );

    // Group transactions by year
    const yearlyData = {};

    allTransactions.forEach((transaction) => {
      const year = new Date(transaction.date).getFullYear();

      if (!yearlyData[year]) {
        yearlyData[year] = { year, revenue: 0, expense: 0 };
      }

      if (transaction.category === "Revenue") {
        yearlyData[year].revenue += transaction.amount;
      } else if (transaction.category === "Expense") {
        yearlyData[year].expense += transaction.amount;
      }
    });

    // Convert to array and include all years from min to max
    const trends = [];
    for (let year = minYear; year <= maxYear; year++) {
      if (yearlyData[year]) {
        trends.push({
          year,
          revenue: parseFloat(yearlyData[year].revenue.toFixed(2)),
          expense: parseFloat(yearlyData[year].expense.toFixed(2)),
        });
      } else {
        // Include years with no data as 0
        trends.push({
          year,
          revenue: 0,
          expense: 0,
        });
      }
    }

    logger.info(
      `Yearly dashboard trends retrieved successfully for ${minYear}-${maxYear}`
    );
    res.json(trends);
  } catch (error) {
    logger.error("Error getting yearly dashboard trends:", error);
    res
      .status(500)
      .json({ message: "Error retrieving yearly dashboard trends" });
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

// 5. POST /transactions/query - Backend-driven filtering
const queryTransactions = async (req, res) => {
  try {
    const {
      search,
      status,
      category,
      dateFrom,
      dateTo,
      amountMin,
      amountMax,
      sortBy = "date",
      order = "desc",
      page = 1,
      limit = 10,
    } = req.body;

    // Build query object
    const query = {};

    // Search functionality
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

    // Amount range filter
    if (amountMin !== undefined || amountMax !== undefined) {
      query.amount = {};
      if (amountMin !== undefined) {
        query.amount.$gte = parseFloat(amountMin);
      }
      if (amountMax !== undefined) {
        query.amount.$lte = parseFloat(amountMax);
      }
    }

    console.log("Query Transaction filter:", query);

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

    // Format response data
    const formattedData = transactions.map((transaction) => ({
      id: transaction.id,
      _id: transaction._id,
      name: `User ${transaction.user_id}`,
      date: transaction.date.toISOString().split("T")[0], // Format: 2024-01-15
      amount: transaction.amount,
      category: transaction.category,
      status: transaction.status,
      user_id: transaction.user_id,
    }));

    const response = {
      total: totalCount,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalCount / limitNum),
      data: formattedData,
    };

    logger.info(
      `Query returned ${transactions.length} transactions (page ${pageNum})`
    );
    res.json(response);
  } catch (error) {
    logger.error("Error querying transactions:", error);
    res.status(500).json({ message: "Error querying transactions" });
  }
};

// 6. POST /transactions/export - Export filtered data
const exportTransactions = async (req, res) => {
  try {
    const {
      filters = {},
      fields = ["name", "date", "amount", "status", "category"],
      format = "csv",
    } = req.body;

    const { search, status, category, dateFrom, dateTo, amountMin, amountMax } =
      filters;

    // Build query object (same logic as queryTransactions)
    const query = {};

    if (search) {
      query.$or = [
        { user_id: { $regex: search, $options: "i" } },
        { id: isNaN(search) ? undefined : parseInt(search) },
      ].filter(Boolean);
    }

    if (status) query.status = status;
    if (category) query.category = category;

    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }

    if (amountMin !== undefined || amountMax !== undefined) {
      query.amount = {};
      if (amountMin !== undefined) query.amount.$gte = parseFloat(amountMin);
      if (amountMax !== undefined) query.amount.$lte = parseFloat(amountMax);
    }

    console.log("Export filter query:", query);

    // Get all matching transactions (no pagination for export)
    const transactions = await Transaction.find(query).sort({ date: -1 });

    // Format data based on requested fields
    const formattedData = transactions.map((transaction) => {
      const row = {};
      fields.forEach((field) => {
        switch (field) {
          case "name":
            row.name = `User ${transaction.user_id}`;
            break;
          case "date":
            row.date = transaction.date.toISOString().split("T")[0];
            break;
          case "amount":
            row.amount = transaction.amount;
            break;
          case "status":
            row.status = transaction.status;
            break;
          case "category":
            row.category = transaction.category;
            break;
          case "user_id":
            row.user_id = transaction.user_id;
            break;
          default:
            if (transaction[field] !== undefined) {
              row[field] = transaction[field];
            }
        }
      });
      return row;
    });

    if (format === "csv") {
      // Generate CSV
      const csvHeader = fields.join(",");
      const csvRows = formattedData.map((row) => {
        return fields
          .map((field) => {
            const value = row[field];
            // Escape commas and quotes in CSV
            if (
              typeof value === "string" &&
              (value.includes(",") || value.includes('"'))
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(",");
      });

      const csvContent = [csvHeader, ...csvRows].join("\n");

      // Set CSV headers
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=transactions.csv"
      );
      res.send(csvContent);
    } else {
      // Return JSON
      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=transactions.json"
      );
      res.json({
        exportDate: new Date().toISOString(),
        totalRecords: formattedData.length,
        filters: filters,
        data: formattedData,
      });
    }

    logger.info(
      `Exported ${formattedData.length} transactions in ${format} format`
    );
  } catch (error) {
    logger.error("Error exporting transactions:", error);
    res.status(500).json({ message: "Error exporting transactions" });
  }
};

module.exports = {
  getDashboardSummary,
  getDashboardTrends,
  getDashboardTrendsYearly,
  getRecentTransactions,
  getTransactions,
  queryTransactions,
  exportTransactions,
};
