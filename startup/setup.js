const express = require("express");
const compression = require("compression");
const cors = require("cors");
const passport = require("passport");
const dotenv = require("dotenv").config({ path: "config/.env" });
const MongoStore = require("connect-mongo");
const session = require("express-session");
const path = require("path");
const flash = require("express-flash");
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
  app.set("views", path.join(__dirname, "../views"));
  app.set("view engine", "ejs");
  app.use(compression());
  app.use(cors());

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: false }));

  // Session storage
  app.use(
    session({
      resave: false, // don't save session if unmodified
      saveUninitialized: false, // don't create session until something stored
      secret: process.env.SESSION_SECRET,
      cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
      store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
      }),
    })
  );

  app.use(flash());

  app.use(passport.initialize());
  app.use(passport.session());

  app.disable("x-powered-by");
  app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
  });

  app.use((req, res, next) => {
    // After successful login, redirect back to the intended page
    if (
      !req.user &&
      req.path !== "/login" &&
      req.path !== "/signup" &&
      !req.path.match(/^\/auth/) &&
      !req.path.match(/\./)
    ) {
      req.session.returnTo = req.originalUrl;
    } else if (req.user && (req.path === "/account" || req.path.match(/^\/api/))) {
      req.session.returnTo = req.originalUrl;
    }
    next();
  });

  app.use(express.static("public", { maxAge: 31557600000 }));

  return app;
};
