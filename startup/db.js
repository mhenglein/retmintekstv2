/**
 * Connect to MongoDB.
 */
require("dotenv").config({ path: "config/.env" });
const mongoose = require("mongoose");
const chalk = require("chalk");

module.exports = function () {
  mongoose.connect(process.env.MONGODB_URI);
  mongoose.connection.on("error", (err) => {
    console.error(err);
    console.log("%s MongoDB connection error. Please make sure MongoDB is running.", chalk.red("✗"));
    process.exit();
  });
  mongoose.connection.once("open", function () {
    console.log("%s MongoDB successfully connected.", chalk.green("✓"));
  });
};
