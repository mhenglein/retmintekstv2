const express = require("express");
const compression = require("compression");
const cors = require("cors");
const dotenv = require("dotenv").config({ path: "config/.env" });
const MongoStore = require("connect-mongo");
const session = require("express-session");
const path = require("path");
require("express-async-errors");

module.exports = function () {
  /**
   * Create Express server.
   */
  const app = express();

  /**
   * Express configuration.
   */
  app.set("host", process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0");
  app.set("port", process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 4000);
  app.set("views", path.join(__dirname, "views"));
  app.set("view engine", "ejs");
  app.use(compression());
  app.use(cors());
  app.use("/", express.static(path.join(__dirname, "public"), { maxAge: 31557600000 }));
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: false }));

  // Session storage
  app.use(
    session({
      resave: false,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET,
      cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
      store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
      }),
    })
  );

  return app;
};
