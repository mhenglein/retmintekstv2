const chalk = require("chalk");
const dotenv = require("dotenv").config({ path: "config/.env" });

const app = require("./startup/setup")();
require("./startup/db")();
// require("./startup/logger")();
require("./startup/incoming")(app);
require("./startup/routes")(app);

// Error Handler.
const error = require("./startup/error");
// app.use(error);

// Start Express server.
app.listen(app.get("port"), () => {
  console.log("%s App is running at http://localhost:%d in %s mode", chalk.green("✓"), app.get("port"), app.get("env"));
  console.log("Press CTRL-C to stop\n");
});
