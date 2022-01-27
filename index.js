const express = require("express");
const compression = require("compression");
const session = require("express-session");
const chalk = require("chalk");
const dotenv = require("dotenv").config({ path: "config/.env" });
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");

// Controllers
const apiController = require("./controllers/api");

// Utility modules
const util = require(__dirname + "/utilities/util.js");

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

app.use("/", express.static(path.join(__dirname, "public"), { maxAge: 31557600000 }));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Standard process for all incoming requests
app.use("*", async (req, res, next) => {
  console.log("Req body", req.body);

  // [1] Request contains body
  if (!req.body) return next();

  // [2] Body has an input
  if (!req.body.input) req.body.input = "";

  // [3] Body has options object
  if (!req.body.options) req.body.options = {};

  // [4] Ascertain type of input
  const { input, options } = req.body;
  const type = typeof input;
  console.log({ type }, { input });

  // [A] Input is a string
  if (type === "string") {
    // Clean text string
    const text = util.cleanString(input);

    // Add to req
    req.text = text || "";

    // Create EditorJS object from String
    const editorjs = util.createEditorJS(text, options);
    req.editor = editorjs || {};

    return next();
  }

  // [B] Input is an object
  if (type === "object") {
    // Does object look like an EditorJS object?
    const isEditorJS = util.isEditorJS(input);

    if (!isEditorJS) return res.redirect("/error");

    // Does editor has blocks with length > 0?
    const hasBlocks = input.blocks.length > 0;

    // Clean editor
    const editorjs = util.cleanEditor(input);

    // Set editor
    req.editor = editorjs;

    // Extract full text from editor
    const text = util.extractText(editorjs);
    console.log(text);

    // Add to req
    req.text = text || "";

    return next();
  }

  // [C] Input is not a string or object
  return res.redirect("/error");

  // At the end, we should be able to access req.text and req.editor from all routes.
});

/* GET routes */
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/api", (req, res) => {
  res.render("api");
});

app.post("/api/gpt", async (req, res) => {
  const { prompt, options } = req.body;
  const { Configuration, OpenAIApi } = require("openai");

  const max_tokens = options.max_tokens || 16;
  const temperature = options.temperature || 0.4;

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const completion = await openai.createCompletion("text-curie-001", {
    prompt,
    max_tokens,
    temperature,
  });

  return res.json({ completion: completion.data.choices[0].text }).end();
});

/* API routes */
app.post("/api/clean", apiController.clean);
// app.post("/api/all-metrics", apiController.sidebarData);

app.post("/api/text-metrics", apiController.getTextMetrics); // Generelt
app.post("/api/correct-text", apiController.textCorrections); // Tekstforslag (Rettelser)
app.post("/api/evaluate-vocab", apiController.evaluateVocab); // Ordforråd
app.post("/api/longwords", apiController.showLongwords); // LIX & Lange ord
app.post("/api/sentence-rhythm", apiController.sentenceRhythm); // Tekstrytme
app.post("/api/rate-sentiment", apiController.rateSentiment); // Sentiment
app.post("/api/sentence-difficulty", apiController.sentenceDifficulty); // Sætningsanalyse

// app.post("/api/checkpronouns", apiController.checkPronouns);

/**
 * Error Handler.
 */
{
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
