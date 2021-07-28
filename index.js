const express = require("express");
const compression = require("compression");
const session = require("express-session");
const morgan = require("morgan");
const chalk = require("chalk");
const dotenv = require("dotenv");
const MongoStore = require("connect-mongo"); //(session);
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const papa = require("papaparse");
const Fuse = require("fuse.js");
const cors = require("cors");

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: ".env" });

// Toolbox
const { TextHighlighter } = require(__dirname + "/app/lib/analysis.js");
const { TextParser } = require(__dirname + "/app/lib/text.js");
const { dict } = require(__dirname + "/app/lib/array");

// Classes
const ShowLongwords = require(__dirname + "/app/lib/showLongwords"); // {}
const SentenceDifficulty = require(__dirname + "/app/lib/sentenceDifficulty");
const SentenceRhythm = require(__dirname + "/app/lib/sentenceRhythm");
const EvaluateVocabulary = require(__dirname + "/app/lib/evaluateVocabulary"); // {}
const CheckPronouns = require(__dirname + "/app/lib/checkPronouns");
const RateSentiment = require(__dirname + "/app/lib/rateSentiment");
const GetTextMetrics = require(__dirname + "/app/lib/getTextMetrics");

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useNewUrlParser", true);
mongoose.set("useUnifiedTopology", true);
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
app.use(morgan("dev")); //  morgan(":method :url :status");
app.use(express.json());
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
    store: new MongoStore({
      mongoUrl: process.env.MONGODB_URI,
      autoReconnect: true,
    }),
  })
);

app.use("/", express.static(path.join(__dirname, "public"), { maxAge: 31557600000 }));
app.use("/js", express.static(path.join(__dirname, "node_modules/tailwind/dist"), { maxAge: 31557600000 }));

app.post("/updatepreferences", (req, res, next) => {
  res.session.darkmode = true;
  req.session.save((err) => {
    if (err) console.log(err);
    if (!err) res.send(req.session.user); // YOU WILL GET THE UUID IN A JSON FORMAT
  }); //THIS SAVES THE SESSION.
  console.log(req.session);

  // req.session.user = {
  //   uuid: "12234-2345-2323423",
  // }; //THIS SETS AN OBJECT - 'USER'
  // req.session.save((err) => {
  //   if (err) console.log(err);
  //   if (!err) res.send(req.session.user); // YOU WILL GET THE UUID IN A JSON FORMAT
  // }); //THIS SAVES THE SESSION.
});

const stopordFile = fs.readFileSync(__dirname + "/app/data/stopord.csv", "utf8");

const stopord = papa.parse(stopordFile, { fastMode: true }).data;

const hedonometerFile = fs.readFileSync(__dirname + "/app/data/hedonometer.csv", "utf8");
const hedonometerCsv = papa.parse(hedonometerFile, { fastMode: true }).data;
const hedonometer = hedonometerCsv.map((x) => ({
  id: x[0],
  english: x[1],
  danish: x[3],
  mean: x[4],
  sigma: x[5],
}));
const hedonometerFuse = new Fuse(hedonometer, {
  includeScore: true,
  threshold: 0.6,
  keys: ["danish"],
});

const lemmasFile = fs.readFileSync(__dirname + "/app/data/lemmas.csv", "utf8");
const lemmasCsv = papa.parse(lemmasFile, { fastMode: true }).data;
const lemmasDict = {};
for (const key of lemmasCsv) {
  lemmasDict[key[0]] = key[1];
}

const frequencyFile = fs.readFileSync(__dirname + "/app/data/frequency-ex.csv", "utf8");
const frequency = papa.parse(frequencyFile).data;

const misspellingsFile = fs.readFileSync(__dirname + "/app/data/misspellings.csv", "utf8");
const misspellings = papa.parse(misspellingsFile).data;

const files = {
  freq: frequency,
  lemmas: lemmasDict,
  hedonometer: hedonometerCsv,
  stopord,
  misspellings,
};

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/api", (req, res) => {
  res.render("api");
});

app.post("/api/textmetrics", (req, res) => {
  const { input, options } = req.body;

  const textMetrics = new GetTextMetrics(input, options, files.files)
    .calcLix()
    .calcSentenceVariance()
    .calcAvgLengths()
    .calcTime();

  const returnJSON = {
    wordCount: textMetrics.wordCount,
    longWordsCount: textMetrics.longWordsCount,
    lix: textMetrics.lix,
    difficulty: textMetrics.difficulty,
    audience: textMetrics.audience,
    readingTime: textMetrics.readingTime,
    speakingTime: textMetrics.speakingTime,
    normalsider: textMetrics.normalsider,
    charsWithSpaces: textMetrics.charsWithSpaces,
    charsNoSpaces: textMetrics.charsNoSpaces,
    sentenceCount: textMetrics.sentenceCount,
    avgSentenceLength: textMetrics.avgSentenceLength,
    avgWordLength: textMetrics.avgWordLength,
    sentenceVariance: textMetrics.sentenceVariance,
  };

  console.log(returnJSON);
  res.json(returnJSON).end();
});

app.post("/api/retmintekst", (req, res) => {
  const { input, options } = req.body;

  const parsedText = new TextParser(input).removeHTML();

  // 1A: findAndReplaceLight w/ mispellings file
  const findSpellingErrors = new TextHighlighter(parsedText.text, {});
  findSpellingErrors.findAndReplaceLight(files.misspellings, "Stavefejl", "Formodentlig: Stavefejl", "red"); // Has ID codes in it
  const newText = findSpellingErrors.text;
  const misspelledReplacements = findSpellingErrors.replacements;

  // 1B: findAndReplace w/ regular file
  const highlightedText = new TextHighlighter(newText, dict.dict);
  highlightedText.findAndReplace().reconvertText();

  const errors = highlightedText.errors;

  // Reconvert the errors
  const finalText = new TextHighlighter(highlightedText.text);
  finalText.reconvertTextLight(misspelledReplacements);

  const returnJSON = {
    returnText: finalText.text,
    // errors,
  };

  res.json(returnJSON).end();
});

app.post("/api/longwords", async (req, res) => {
  const { input, options } = req.body;

  // Call to service layer.
  const threshold = options?.threshold || 6;
  const lw = new ShowLongwords(input).highlightAllLongWords(threshold).getAllLongWords(threshold);

  const returnJSON = {
    returnText: lw.formatted,
    noOfLongWords: lw.noOfLongWords,
    arrOfLongWords: lw.longWords,
  };

  res.json(returnJSON).end();
});

app.post("/api/sentence-difficulty", async (req, res) => {
  const { input, options } = req.body;
  const evaluateSentences = new SentenceDifficulty(input);

  const returnJSON = {
    returnText: evaluateSentences.formattedText,
    noAllSentences: evaluateSentences.noAllSentences,
    noEasySentences: evaluateSentences.noEasySentences,
    noHardSentences: evaluateSentences.noHardSentences,
    noVeryHardSentences: evaluateSentences.noVeryHardSentences,
  };

  res.json(returnJSON).end();
});

app.post("/api/sentence-rhythm", async (req, res) => {
  const { input, options } = req.body;
  const evaluateSentences = new SentenceRhythm(input).SentenceRhythms();

  const returnJSON = {
    returnText: evaluateSentences.formatted,
    noAllSentences: evaluateSentences.noAllSentences,
    errors: evaluateSentences.errors,
  };

  console.log(returnJSON);
  res.json(returnJSON).end();
});

app.post("/api/checkpronouns", async (req, res) => {
  const { input, options } = req.body;
  const checkPronouns = new CheckPronouns(input).countPronouns();

  const returnJSON = {
    returnText: checkPronouns.formatted,
    noOfPronouns: checkPronouns.noOfPronouns,
  };

  res.json(returnJSON).end();
});

app.post("/api/ratesentiment", async (req, res) => {
  const { input, options } = req.body;

  // TODO Skip (vs remove) stopwords
  // if (options === {}) {
  //   options.removeStopwords = true;
  // }
  const rateSentiment = new RateSentiment(input, options, files)
    .rateHappiness()
    .calculateHappyMetrics()
    .augmentTextWithEmojis();

  const returnJSON = {
    returnText: rateSentiment.formatted,
    emoji: rateSentiment.emoji,
    happinessScore: rateSentiment.happinessScore,
    happinessMSE: rateSentiment.happinessMSE,
  };
  res.json(returnJSON).end();
});

app.post("/api/evaluatevocab", async (req, res) => {
  const { input, options } = req.body;
  const evaluteVocab = new EvaluateVocabulary(input, options, files)
    .generateFrequencyMap()
    .findOverusedWords()
    .findUncommonWords()
    .findUniqueWords()
    .highlightOverusedWords();

  const returnJSON = {
    returnText: evaluteVocab.formatted,
    uncommonWords: evaluteVocab.uncommonWords,
    uniqueWords: evaluteVocab.uniqueWords,
    overusedWords: evaluteVocab.overusedWords,
    numUncommonWords: evaluteVocab.uncommonWords.length,
    numUniqueWords: evaluteVocab.uniqueWords.length,
    numOverusedWords: evaluteVocab.overusedWords.length,
    numAllWords: evaluteVocab.words.length,
  };

  res.json(returnJSON).end();
});

/**
 * Error Handler.
 */
if (process.env.NODE_ENV === "development") {
  // only use in development
  app.use(errorHandler());
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
