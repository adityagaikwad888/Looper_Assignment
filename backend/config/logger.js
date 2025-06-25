const winston = require("winston");
const path = require("path");
const fs = require("fs");

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss",
  }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,
  transports: [],
});

// Console transport - always enabled but with different levels for dev/prod
if (process.env.NODE_ENV === "development") {
  // In development, show all logs in console
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), logFormat),
      level: "debug",
    })
  );
} else {
  // In production, only show important logs in console
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), logFormat),
      level: "warn",
    })
  );
}

// File transport - enabled in both dev and production when ENABLE_LOGS is true
if (process.env.ENABLE_LOGS === "true") {
  const logFilePath = process.env.LOG_FILE_PATH || "./logs/app.log";

  // Main application log file
  logger.add(
    new winston.transports.File({
      filename: logFilePath,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true,
      level: "info",
    })
  );

  // Separate error log file
  logger.add(
    new winston.transports.File({
      filename: path.join(path.dirname(logFilePath), "error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true,
    })
  );

  // In production, also create a separate access log for requests
  if (process.env.NODE_ENV === "production") {
    logger.add(
      new winston.transports.File({
        filename: path.join(path.dirname(logFilePath), "access.log"),
        level: "info",
        maxsize: 10485760, // 10MB for access logs
        maxFiles: 10,
        tailable: true,
      })
    );
  }
}

// Create a stream object for Morgan
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

module.exports = logger;
