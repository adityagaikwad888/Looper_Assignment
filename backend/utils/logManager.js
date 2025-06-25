const fs = require("fs");
const path = require("path");

class LogManager {
  constructor() {
    this.logsDir = path.join(__dirname, "../logs");
    this.appLogPath = path.join(this.logsDir, "app.log");
    this.errorLogPath = path.join(this.logsDir, "error.log");
  }

  // Read last N lines from log file
  async readLastLines(filePath, lines = 100) {
    try {
      if (!fs.existsSync(filePath)) {
        return [];
      }

      const data = fs.readFileSync(filePath, "utf8");
      const allLines = data.split("\n").filter((line) => line.trim() !== "");
      return allLines.slice(-lines);
    } catch (error) {
      console.error("Error reading log file:", error);
      return [];
    }
  }

  // Get app logs
  async getAppLogs(lines = 100) {
    return await this.readLastLines(this.appLogPath, lines);
  }

  // Get error logs
  async getErrorLogs(lines = 100) {
    return await this.readLastLines(this.errorLogPath, lines);
  }

  // Clear log files
  clearLogs() {
    try {
      if (fs.existsSync(this.appLogPath)) {
        fs.writeFileSync(this.appLogPath, "");
      }
      if (fs.existsSync(this.errorLogPath)) {
        fs.writeFileSync(this.errorLogPath, "");
      }
      return true;
    } catch (error) {
      console.error("Error clearing logs:", error);
      return false;
    }
  }

  // Get log file stats
  getLogStats() {
    const stats = {};

    try {
      if (fs.existsSync(this.appLogPath)) {
        const appStats = fs.statSync(this.appLogPath);
        stats.appLog = {
          size: appStats.size,
          created: appStats.birthtime,
          modified: appStats.mtime,
        };
      }

      if (fs.existsSync(this.errorLogPath)) {
        const errorStats = fs.statSync(this.errorLogPath);
        stats.errorLog = {
          size: errorStats.size,
          created: errorStats.birthtime,
          modified: errorStats.mtime,
        };
      }
    } catch (error) {
      console.error("Error getting log stats:", error);
    }

    return stats;
  }
}

module.exports = new LogManager();
