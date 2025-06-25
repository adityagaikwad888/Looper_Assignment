const logger = require("../config/logger");

// Request logging middleware
const requestLogger = (req, res, next) => {
  // Log in both dev and production when ENABLE_LOGS is true
  if (process.env.ENABLE_LOGS !== "true") {
    return next();
  }

  const startTime = Date.now();
  const originalSend = res.send;

  // Capture response data
  res.send = function (data) {
    const duration = Date.now() - startTime;
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
      statusCode: res.statusCode,
      responseTime: `${duration}ms`,
      requestBody:
        req.method === "POST" || req.method === "PUT"
          ? JSON.stringify(sanitizeRequestBody(req.body))
          : null,
      headers: {
        "content-type": req.get("Content-Type"),
        authorization: req.get("Authorization") ? "[HIDDEN]" : null,
      },
      environment: process.env.NODE_ENV || "development",
    };

    // Create log message
    const logMessage = `${logData.method} ${logData.url} - ${logData.statusCode} - ${logData.responseTime} - IP: ${logData.ip} - ENV: ${logData.environment}`;

    // Different logging levels based on environment and response status
    if (res.statusCode >= 500) {
      logger.error(`${logMessage} - Body: ${logData.requestBody || "None"}`);
    } else if (res.statusCode >= 400) {
      logger.warn(`${logMessage} - Body: ${logData.requestBody || "None"}`);
    } else {
      // In production, log successful requests at info level
      // In development, log at debug level for more detail
      const logLevel = process.env.NODE_ENV === "production" ? "info" : "debug";
      if (logLevel === "info") {
        logger.info(logMessage);
      } else {
        logger.debug(`${logMessage} - Body: ${logData.requestBody || "None"}`);
      }
    }

    // Call the original send method
    originalSend.call(this, data);
  };

  next();
};

// Function to sanitize request body (remove sensitive data)
const sanitizeRequestBody = (body) => {
  if (!body || typeof body !== "object") {
    return body;
  }

  const sanitized = { ...body };

  // Remove sensitive fields
  const sensitiveFields = ["password", "token", "secret", "key"];
  sensitiveFields.forEach((field) => {
    if (sanitized[field]) {
      sanitized[field] = "[HIDDEN]";
    }
  });

  return sanitized;
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  if (process.env.ENABLE_LOGS === "true") {
    logger.error(`Error in ${req.method} ${req.originalUrl}:`, {
      error: err.message,
      stack: err.stack,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
      body: sanitizeRequestBody(req.body),
    });
  }
  next(err);
};

// Authentication event logger
const authLogger = {
  loginSuccess: (email, ip) => {
    if (process.env.ENABLE_LOGS === "true") {
      logger.info(
        `[AUTH] Login successful - Email: ${email}, IP: ${ip}, ENV: ${
          process.env.NODE_ENV || "development"
        }`
      );
    }
  },

  loginFailed: (email, ip, reason) => {
    if (process.env.ENABLE_LOGS === "true") {
      logger.warn(
        `[AUTH] Login failed - Email: ${email}, IP: ${ip}, Reason: ${reason}, ENV: ${
          process.env.NODE_ENV || "development"
        }`
      );
    }
  },

  signupSuccess: (email, ip) => {
    if (process.env.ENABLE_LOGS === "true") {
      logger.info(
        `[AUTH] Signup successful - Email: ${email}, IP: ${ip}, ENV: ${
          process.env.NODE_ENV || "development"
        }`
      );
    }
  },

  signupFailed: (email, ip, reason) => {
    if (process.env.ENABLE_LOGS === "true") {
      logger.warn(
        `[AUTH] Signup failed - Email: ${email}, IP: ${ip}, Reason: ${reason}, ENV: ${
          process.env.NODE_ENV || "development"
        }`
      );
    }
  },

  logout: (email, ip) => {
    if (process.env.ENABLE_LOGS === "true") {
      logger.info(
        `[AUTH] Logout - Email: ${email || "Unknown"}, IP: ${ip}, ENV: ${
          process.env.NODE_ENV || "development"
        }`
      );
    }
  },
};

module.exports = {
  requestLogger,
  errorLogger,
  authLogger,
  logger,
};
