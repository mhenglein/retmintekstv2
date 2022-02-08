const morgan = require("morgan");
const winston = require("winston");

module.exports = function (app) {
  const logger = winston.createLogger({
    level: "http",
    format: winston.format.cli(),
    transports: [new winston.transports.Console()],
  });

  const morganMiddleware = morgan(":method :url :status :res[content-length] - :response-time ms", {
    stream: {
      // Configure Morgan to use our custom logger with the http severity
      write: (message) => logger.http(message.trim()),
    },
  });

  app.use(morganMiddleware);
};
