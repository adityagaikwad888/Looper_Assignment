const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const { requestLogger, errorLogger, logger } = require("./middleware/logging");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Import routes
const authRoutes = require("./routes/auth");

const app = express();

// Request logging middleware (must be first)
app.use(requestLogger);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3001", // Frontend URL
    credentials: true, // Allow cookies to be sent
  })
);

// Debug middleware to log request body (only in development)
if (process.env.NODE_ENV === "development") {
  app.use("/api/auth", (req, res, next) => {
    console.log("Request Method:", req.method);
    console.log("Request URL:", req.url);
    console.log("Request Body:", req.body);
    console.log("Content-Type:", req.headers["content-type"]);
    next();
  });
}

// Routes
app.use("/api/auth", authRoutes);

// Test route
app.get("/healthCheck", (req, res) => {
  res.json({ message: "Backend Authentication API is running!" });
});

// Test route for JSON parsing
app.post("/test", (req, res) => {
  console.log("Test route - Request Body:", req.body);
  res.json({
    message: "Test route working",
    receivedData: req.body,
    contentType: req.headers["content-type"],
  });
});

// Log status route
app.get("/logs/status", (req, res) => {
  res.json({
    loggingEnabled: process.env.ENABLE_LOGS === "true",
    logLevel: process.env.LOG_LEVEL || "info",
    logFilePath: process.env.LOG_FILE_PATH || "./logs/app.log",
    message: "Logging system status",
  });
});

// Error handling middleware
app.use(errorLogger);
app.use((err, req, res, next) => {
  logger.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`🚀 Server is running on port ${PORT}`);
  logger.info(`🌐 Visit http://localhost:${PORT} to test the API`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  logger.info(
    `📝 Logging is ${
      process.env.ENABLE_LOGS === "true" ? "ENABLED" : "DISABLED"
    }`
  );

  if (process.env.ENABLE_LOGS === "true") {
    logger.info(
      `📁 Log files location: ${process.env.LOG_FILE_PATH || "./logs/app.log"}`
    );
    logger.info(`📈 Log level: ${process.env.LOG_LEVEL || "info"}`);

    if (process.env.NODE_ENV === "production") {
      logger.info(
        `🔐 Production mode: Enhanced logging with separate access logs`
      );
    } else {
      logger.info(
        `🛠️  Development mode: Detailed logging with debug information`
      );
    }
  }

  logger.info(
    `🗄️  MongoDB Connected: ${
      process.env.MONGODB_URI?.includes("127.0.0.1") ? "Local" : "Remote"
    }`
  );
  logger.info(`🎯 API Endpoints:`);
  logger.info(`   POST /api/auth/signup - User Registration`);
  logger.info(`   POST /api/auth/login - User Login`);
  logger.info(`   POST /api/auth/logout - User Logout`);
  logger.info(`   GET  /api/auth/me - Get Current User`);
  logger.info(`   GET  /logs/status - Logging Status`);
});
