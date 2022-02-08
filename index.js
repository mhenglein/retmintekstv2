const chalk = require("chalk");
const morgan = require("morgan");
const errorhandler = require("errorhandler");
const notifier = require("node-notifier");
require("dotenv").config({ path: "config/.env" });

const app = require("./startup/setup")();
const logger = require("./startup/logger")();
require("./startup/db")();
require("./startup/morgan")(app);
require("./startup/incoming")(app);
require("./startup/routes")(app);

// Error Handler.
if (process.env.NODE_ENV !== "production") {
  app.use(errorhandler({ log: errorNotification }));
  function errorNotification(err, str, req) {
    var title = "Error in " + req.method + " " + req.url;

    notifier.notify({
      title: title,
      message: str,
    });
  }
} else {
  app.use(function error(err, req, res, next) {
    logger.error(err.message, err);

    res.status(500).send({
      error: err.message,
    });
  });
}

// No caching in development
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });
}

// Start Express server.
app.listen(app.get("port"), () => {
  console.log("%s App is running at http://localhost:%d in %s mode", chalk.green("✓"), app.get("port"), app.get("env"));
  console.log("Press CTRL-C to stop\n");
  logger.info(`${chalk.green("✓")} App is running`);
});

module.exports = app;
