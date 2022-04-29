require("dotenv").config({ path: "config/.env" });

const chalk = require("chalk");
const errorhandler = require("errorhandler");
const notifier = require("node-notifier");
const express = require("express");
const compression = require("compression");
const cors = require("cors");
const passport = require("passport");
// const MongoStore = require("connect-mongo");
// const session = require("express-session");
const path = require("path");
const flash = require("express-flash");

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
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.render("index");
});

// Session storage
// app.use(
//   session({
//     resave: false, // don't save session if unmodified
//     saveUninitialized: false, // don't create session until something stored
//     secret: process.env.SESSION_SECRET,
//     cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
//     store: MongoStore.create({
//       mongoUrl: process.env.MONGODB_URI,
//     }),
//   })
// );

// app.use(flash());

// app.use(passport.initialize());
// app.use(passport.session());

// app.disable("x-powered-by");
// app.use((req, res, next) => {
//   res.locals.user = req.user;
//   next();
// });

// app.use((req, res, next) => {
//   // After successful login, redirect back to the intended page
//   if (!req.user && req.path !== "/login" && req.path !== "/signup" && !req.path.match(/^\/auth/) && !req.path.match(/\./)) {
//     req.session.returnTo = req.originalUrl;
//   } else if (req.user && (req.path === "/account" || req.path.match(/^\/api/))) {
//     req.session.returnTo = req.originalUrl;
//   }
//   next();
// });

app.use(express.static("public", { maxAge: 31557600000 }));

// const logger = require("./startup/logger")();
// require("./startup/db")();
// require("./startup/morgan")(app);
// require("./startup/incoming")(app);
// require("./startup/routes")(app);

// Error Handler.
// if (process.env.NODE_ENV !== "production") {
//   app.use(errorhandler({ log: errorNotification }));
//   function errorNotification(err, str, req) {
//     var title = "Error in " + req.method + " " + req.url;

//     notifier.notify({
//       title: title,
//       message: str,
//     });
//   }
// } else {
//   app.use(function error(err, req, res, next) {
//     // logger.error(err.message, err);

//     res.status(500).send({
//       error: err.message,
//     });
//   });
// }

// // No caching in development
// if (process.env.NODE_ENV !== "production") {
//   app.use((req, res, next) => {
//     res.set("Cache-Control", "no-store");
//     next();
//   });
// }

// Start Express server.
app.listen(app.get("port"), () => {
  console.log("%s App is running at http://localhost:%d in %s mode", chalk.green("✓"), app.get("port"), app.get("env"));
  console.log("Press CTRL-C to stop\n");
  // logger.info(`${chalk.green("✓")} App is running`);
});

module.exports = app;
