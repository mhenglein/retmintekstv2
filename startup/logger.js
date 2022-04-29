const winston = require("winston");
require("winston-mongodb");
require("dotenv").config({ path: "config/.env" });

module.exports = function () {
  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: winston.format.json(),
    transports: [
      new winston.transports.File({ filename: "logs/error.log", level: "error" }),
      // new winston.transports.Console({ format: winston.format.colorize() }),
      new winston.transports.MongoDB({
        db: process.env.MONGODB_URI,
        options: {
          useUnifiedTopology: true,
        },
        level: "error",
        handleExceptions: true,
      }),
    ],
    exceptionHandlers: [
      new winston.transports.File({ filename: "logs/error.log", level: "error" }),
      new winston.transports.MongoDB({
        db: process.env.MONGODB_URI,
        level: "error",
        options: {
          useUnifiedTopology: true,
        },
      }),
    ],
    rejectionHandlers: [new winston.transports.File({ filename: "logs/rejections.log" })],
  });

  if (process.env.NODE_ENV !== "production") {
    logger.add(
      new winston.transports.Console({
        format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
      })
    );
  }

  return logger;
};
