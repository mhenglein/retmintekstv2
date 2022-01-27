const chalk = require("chalk");

const CorrectText = require("../utilities/textCorrections");
const CheckPronouns = require("../utilities/checkPronouns");
const EvaluateVocabulary = require("../utilities/evaluateVocabulary");
const GetTextMetrics = require("../utilities/getTextMetrics");
const RateSentiment = require("../utilities/rateSentiment");
const SentenceDifficulty = require("../utilities/sentenceDifficulty");
const SentenceRhythm = require("../utilities/sentenceRhythm");
const ShowLongWords = require("../utilities/showLongWords");

// Utility modules
const util = require("../utilities/util.js");

exports.switchboard = async (req, res) => {
  const { options, editor, text } = req;

  // Call to service layer.
  const threshold = options?.threshold || 6;

  // Create highlighted text
  editor.blocks.forEach((block, index) => {
    const { text } = block;
    const lw = new ShowLongWords(text).highlightAllLongWords(threshold);
    editor.blocks[index].text = lw.formatted;
  });

  const lw = new ShowLongWords(text).getAllLongWords(threshold);

  const sidebar = {
    noOfLongWords: lw.longWords,
    arrOfLongWords: lw.arrOfLongWords,
  };

  const returnJSON = {
    editor: lw.formatted,
    sidebar,
  };

  return returnJSON;
};

exports.sidebarData = async (req, res) => {
  const { options, editor, text } = req;

  //   const pronouns = new CheckPronouns(text).countPronouns();
  //   const vocab = new EvaluateVocabulary(text, options)
  //     .generateFrequencyMap()
  //     .findOverusedWords()
  //     .findUncommonWords()
  //     .findUniqueWords();
  //   const metrics = new GetTextMetrics(text, options).calcLix().calcSentenceVariance().calcAvgLengths().calcTime();
  //   const sentiment = new RateSentiment(text, options).rateHappiness().calculateHappyMetrics();
  //   const diff = new SentenceDifficulty(text);
  //   const rhythms = new SentenceRhythm(text).assessSentenceRhythms();
  //   // const lw = new ShowLongWords(text, options).getAllLongWords();

  //   console.log(rhythms);

  //   const sidebar = {
  //     // Metrics
  //     wordCount: metrics.wordCount,
  //     sentenceCount: metrics.sentenceCount,
  //     longWordsCount: metrics.longWordsCount,
  //     charsNoSpaces: metrics.charsNoSpaces,
  //     charsWithSpaces: metrics.charsWithSpaces,
  //     normalsider: metrics.normalsider,
  //     lix: metrics.lix,
  //     difficulty: metrics.difficulty,
  //     audience: metrics.audience,
  //     avgSentenceLength: metrics.avgSentenceLength,
  //     avgWordLength: metrics.avgWordLength,
  //     sentenceVariance: metrics.sentenceVariance,
  //     readingTime: metrics.readingTime,
  //     speakingTime: metrics.speakingTime,
  //     // Vocab
  //     uncommonWords: vocab.uncommonWords.length || 0,
  //     uniqueWords: vocab.uniqueWords.length || 0,
  //     overusedWords: vocab.overusedWords.length || 0,
  //     // Sentiment
  //     emoji: sentiment.emoji,
  //     happinessScore: sentiment.happinessScore,
  //     happinessMSE: sentiment.happinessMSE,
  //     // Pronouns
  //     noOfPronouns: pronouns.noOfPronouns,
  //     // Sentence difficulty
  //     noAllSentences: diff.noAllSentences,
  //     noEasySentences: diff.noEasySentences,
  //     noHardSentences: diff.noHardSentences,
  //     noVeryHardSentences: diff.noVeryHardSentences,
  //     // Sentence rhythm
  //     sentenceLength: rhythms.sentenceLength,

  //     // etc
  //   };

  return res.json({ sidebar });
};

exports.clean = async (req, res) => {
  const { input, options } = req.body;
  console.log(chalk.blue("Cleaning text..."), input);
  if (!input) return null;

  const text = util.cleanString(input, options);
  if (text) return res.json({ text: text.text, response: "success" });
  return res.json({ response: "failure" }).end();
};

exports.textCorrections = (req, res) => {
  const { input, options } = req.body;
  const returnJSON = CorrectText(input, options);
  res.json(returnJSON).end();
};

// Check pronouns
exports.checkPronouns = async (req, res) => {
  const { input, options } = req.body;
  const checkPronouns = new CheckPronouns(input).countPronouns();

  const returnJSON = {
    returnText: checkPronouns.formatted,
    noOfPronouns: checkPronouns.noOfPronouns,
  };

  res.json(returnJSON).end();
};

// Evaluate vocab
exports.evaluateVocab = async (req, res) => {
  const { editor, text, options } = req;

  console.log("Incoming received in evaluateVocab");

  if (!editor || !text) return res.json({ msg: "Error" }).end();

  // Sidebar stats
  const vocab = new EvaluateVocabulary(text, options)
    .generateFrequencyMap()
    .findOverusedWords()
    .findUncommonWords()
    .findUniqueWords()
    .createObjectOfResults();

  // Highlighter per block
  editor.blocks.forEach((block, index) => {
    const { text } = block.data;
    const evaluteVocab = new EvaluateVocabulary(text, options).highlightOverusedWords(text, vocab.overusedWords);
    editor.blocks[index].data.text = evaluteVocab.formatted;
  });

  const returnJSON = {
    editor,
    sidebar: {
      results: vocab.results || {},
      numUncommonWords: vocab.uncommonWords?.length || 0,
      numUniqueWords: vocab.uniqueWords?.length || 0,
      numOverusedWords: vocab.overusedWords?.length || 0,
      uncommonWords: vocab.uncommonWords,
      uniqueWords: vocab.uniqueWords,
      overusedWords: vocab.overusedWords,
    },
  };

  return res.json(returnJSON).end();
};

// Text metrics
exports.getTextMetrics = (req, res) => {
  const { input, options } = req.body;

  const textMetrics = new GetTextMetrics(input, options).calcLix().calcSentenceVariance().calcAvgLengths().calcTime();

  const {
    wordCount,
    longWordsCount,
    lix,
    difficulty,
    audience,
    readingTime,
    speakingTime,
    normalsider,
    charsWithSpaces,
    charsNoSpaces,
    sentenceCount,
    avgSentenceLength,
    avgWordLength,
    sentenceVariance,
  } = textMetrics;

  return res
    .json({
      wordCount,
      longWordsCount,
      lix,
      difficulty,
      audience,
      readingTime,
      speakingTime,
      normalsider,
      charsWithSpaces,
      charsNoSpaces,
      sentenceCount,
      avgSentenceLength,
      avgWordLength,
      sentenceVariance,
    })
    .end();
};

// Rate sentiment
exports.rateSentiment = async (req, res) => {
  const { input, options } = req.body;

  // TODO Skip (vs remove) stopwords
  // if (options === {}) {
  //   options.removeStopwords = true;
  // }
  const rateSentiment = new RateSentiment(input, options)
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
};

// Sentence difficulty
exports.sentenceDifficulty = async (req, res) => {
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
};

// Sentence rhythm
module.exports.sentenceRhythm = async (req, res) => {
  const { input, options } = req.body;
  const evaluateSentences = new SentenceRhythm(input).assessSentenceRhythms();

  const returnJSON = {
    returnText: evaluateSentences.formatted,
    noAllSentences: evaluateSentences.noAllSentences,
    errors: evaluateSentences.errors,
  };

  console.log(returnJSON);
  res.json(returnJSON).end();
};

// Show longwords
module.exports.showLongwords = async (req, res) => {
  const { input, options } = req.body;

  // Call to service layer.
  const threshold = options?.threshold || 6;
  const lw = new ShowLongWords(input).highlightAllLongWords(threshold).getAllLongWords(threshold);

  const returnJSON = {
    returnText: lw.formatted,
    noOfLongWords: lw.noOfLongWords,
    arrOfLongWords: lw.longWords,
  };

  res.json(returnJSON).end();
};
