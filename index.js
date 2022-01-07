const express = require("express");
const compression = require("compression");
const session = require("express-session");
const morgan = require("morgan");
const errorhandler = require("errorhandler");
const chalk = require("chalk");
const dotenv = require("dotenv");
const MongoStore = require("connect-mongo"); //(session);
const mongoose = require("mongoose");
const path = require("path");

const cors = require("cors");

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: ".env" });

// Controllers
const ShowLongWords = require("./controllers/showLongwords");
const SentenceDifficulty = require("./controllers/sentenceDifficulty");
const SentenceRhythm = require("./controllers/sentenceRhythm");
const EvaluateVocabulary = require("./controllers/evaluateVocabulary"); // {}
const CheckPronouns = require("./controllers/checkPronouns");
const RateSentiment = require("./controllers/rateSentiment");
const GetTextMetrics = require("./controllers/getTextMetrics");
const TextCorrections = require("./controllers/textCorrections");

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on("error", (err) => {
  console.error(err);
  console.log("%s MongoDB connection error. Please make sure MongoDB is running.", chalk.red("✗"));
  process.exit();
});
mongoose.connection.once("open", (err, res) => {
  console.log("%s MongoDB successfully connected at %s", chalk.green("✓"), process.env.MONGODB_URI);
});

/**
 * Express configuration.
 */
app.set("host", process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0");
app.set("port", process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 4000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(compression());
app.use(cors());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("combined"));
}

app.use(express.json({ limit: "50mb" }));

app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
    store: new MongoStore({
      mongoUrl: process.env.MONGODB_URI,
      autoReconnect: true,
    }),
  })
);

app.use("/", express.static(path.join(__dirname, "public"), { maxAge: 31557600000 }));

/* GET routes */
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/api", (req, res) => {
  res.render("api");
});

/* API routes */
app.post("/api/getTextMetrics", GetTextMetrics);
app.post("/api/longwords", ShowLongWords);
app.post("/api/sentence-difficulty", SentenceDifficulty);
app.post("/api/sentence-rhythm", SentenceRhythm);
app.post("/api/checkpronouns", CheckPronouns);
app.post("/api/ratesentiment", RateSentiment);
app.post("/api/evaluatevocab", EvaluateVocabulary);
app.post("/api/retmintekst", TextCorrections);

// User requests etc.
// LOGIN routes
// app.post("/updatepreferences", (req, res, next) => {
//   res.session.darkmode = true;
//   req.session.save((err) => {
//     if (err) console.log(err);
//     if (!err) res.send(req.session.user); // YOU WILL GET THE UUID IN A JSON FORMAT
//   }); //THIS SAVES THE SESSION.
//   console.log(req.session);
// });

/**
 * Error Handler.
 */
if (process.env.NODE_ENV === "development") {
  // only use in development
  app.use(errorhandler());
} else {
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send("Server Error");
  });
}

/**
 * Start Express server.
 */
app.listen(app.get("port"), () => {
  console.log("%s App is running at http://localhost:%d in %s mode", chalk.green("✓"), app.get("port"), app.get("env"));
  console.log("  Press CTRL-C to stop\n");
});

module.exports = app;
