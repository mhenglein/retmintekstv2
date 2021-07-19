const path = require("path");
const fs = require("fs");
const papa = require("papaparse");
const Fuse = require("fuse.js");
const express = require("express");
const compression = require("compression");
const cors = require("cors");
const morgan = require("morgan");

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

// Server setup
const app = express();
app.use(cors());
app.use(morgan("tiny"));
morgan(":method :url :status");
app.use(express.json());
app.use(compression());

app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/status", (req, res) => {
  console.log("Status request received ... ");
  res.status(200).end();
});
app.head("/status", (req, res) => {
  res.status(200).end();
});

const stopordFile = fs.readFileSync(__dirname + "/app/data/stopord.csv", "utf8");
// global.appRoot = path.resolve(__dirname);
// `${global.appRoot}/data/stopord.csv`

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

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/api", (req, res) => {
  res.render("api");
});

app.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
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
  const evaluateSentences = new SentenceRhythm(input).assessSentenceRhythms();

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
