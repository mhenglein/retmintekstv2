// @codekit-prepend "js/analysis.js";
// @codekit-prepend "js/util.js";

const express = require("express");
const compression = require("compression");
const fs = require("fs");
const papa = require("papaparse");

// ! Data files
const path = require("path");
global.appRoot = path.resolve(__dirname);

let lemmaFile, misspellingsFile, frequencyFile, hedonometerFile;

fs.readFile(`${appRoot}/data/lemmas.csv`, "utf8", async function (err, csv) {
  if (err) return console.log(err);
  lemmaFile = papa.parse(csv, { fastMode: true }).data;
  console.log("lemmaFile parsed...", lemmaFile.length);
});

fs.readFile(`${appRoot}/data/misspellings.csv`, "utf8", async function (err, csv) {
  if (err) return console.log(err);
  misspellingsFile = papa.parse(csv).data;
  console.log("misspellingsFile parsed...", misspellingsFile.length);
});

fs.readFile(`${appRoot}/data/hedonometer.csv`, "utf8", async function (err, csv) {
  if (err) return console.log(err);
  hedonometerFile = papa.parse(csv, { fastMode: true }).data;
  console.log("hedonometerFile parsed ...", hedonometerFile.length);
});

fs.readFile(`${appRoot}/data/frequency-ex.csv`, "utf8", async function (err, csv) {
  if (err) return console.log(err);
  frequencyFile = papa.parse(csv).data;
  console.log("frequencyFile parsed...", frequencyFile.length);
});

const app = express();

app.use(express.json());
app.use(compression());

// app.use(express.static(__dirname + "/public/"));

app.listen(3000, function () {
  console.log("Server started");
});

app.post("/api", function (req, res) {
  const currentTime = new Date();
  console.log("Received by the server at this time", currentTime.toLocaleTimeString());
  // @ Variables used throughout
  let i, j, s;

  // ! Step 1 -- Get blocks editorJS
  let body = req.body;
  let blocks = body.blocks;
  let assistantData = { hard: 0, vhard: 0 };

  // ! Step 2 -- Loop through each block to
  // !  (a) combine into one text file for analysis purposes, and
  // !  (b) to evaluate each on a sentence level

  let fullText = "";
  const blocksLength = blocks.length;
  for (i = 0; i < blocksLength; i++) {
    // * The text content of a specific block - remove all "&nbsp;"
    const block = cleanText(blocks[i].data.text);

    // * Combine into one block of text
    fullText += block;

    // * Parcel into sentences
    const sentencesInBlock = getSentencesFromText(block);

    // * Loop through all sentences within a block
    let newBlock = "";
    let replacementPairs = [];
    replacementPairs.splice(0, replacementPairs.length); // Really need this to be empty

    const sentencesLength = sentencesInBlock.length;
    for (j = 0; j < sentencesLength; j++) {
      // * Evaluate the difficulty of the sentence
      const cleanSentence = removeTags(sentencesInBlock[j]); // Remove all tags like <b> so they don't affect letter counts etc.
      const words = countWords(cleanSentence).words;
      const chars = countCharacters(cleanSentence).chars;
      const level = calculateLevel(chars, words, 1);

      // * Analyze the text; find & replace offending words with <spans> for the popover correction
      // Returns: Update sentence, #red errors, #yellow errors, #blue errors
      const analysisOutcome = analyzeText(cleanSentence, dict, replacementPairs); // dict via global scope
      let updatedSentence = analysisOutcome.text;
      assistantData.red += analysisOutcome.red;
      assistantData.yellow += analysisOutcome.yellow;
      assistantData.blue += analysisOutcome.blue;

      // * Wrap sentence depending on its difficulty level stablished earlier
      const sentenceEval = evaluateSentence(words, level, updatedSentence);
      updatedSentence = sentenceEval.newSentence;
      assistantData.hard += sentenceEval.hard;
      assistantData.vhard += sentenceEval.vhard;

      newBlock += `${updatedSentence} `; // Join the sentences together into the original block
    }

    // * Re-assign the updated text into the original structure
    blocks[i].data.text = newBlock;
  }

  // ! Step 3 -- Get key stats on the block
  // * Pre-step -- reduce text to array of lemmas
  const lemmaArray = lemmafy(fullText);

  // * Count all words, incl. long words (>6) for LIX calculations
  let wordsObject = countWords(fullText);
  assistantData.words = wordsObject.words;
  assistantData.longwords = wordsObject.longWords;

  // * Get all sentences; count total #
  let allSentences = getSentencesFromText(fullText);
  assistantData.sentences = allSentences.length;

  // ? Validation check
  console.log("The number of sentences are ...", assistantData.sentences, countSentences(fullText));

  // * Get avg. sentence length and sentence variance
  let sentenceLengths = [];
  const allSentencesLength = allSentences.length;
  for (s = 0; s < allSentencesLength; s++) {
    const sentence = allSentences[s];
    const wordsInSentence = countWords(sentence).words;
    sentenceLengths.push(wordsInSentence);
  }

  console.log(sentenceLengths);
  assistantData.slength = Math.round(assistantData.words / assistantData.sentences);
  assistantData.svariance = calculateVariance(sentenceLengths, assistantData.slength);

  // * Count characters (with and without spaces)
  let characters = countCharacters(fullText);
  assistantData.charsplus = characters.charsplus;
  assistantData.chars = characters.chars;

  // * Calculate the average word length
  assistantData.wlength = Math.round(assistantData.chars / assistantData.words);

  // * Get & count all unique words (words that are only used once)
  const uniqueWords = getUniqueWords(lemmaArray);
  assistantData.unique = uniqueWords.length;

  // * Get & count all rare words (word that are not in the top 5000)
  const rareWords = getRareWords(lemmaArray);
  const distinctRareWords = getUniqueWords(rareWords);
  for (let index = 0; index < distinctRareWords.length; index++) {
    distinctRareWords[index] = distinctRareWords[index].replace(/nbsp/g, "");
  }
  assistantData.rare = rareWords.length;

  // * Get all words also in the hedonometer file, their associated values, and the avg score
  const happyWords = rateHappyWords(lemmaArray); // Returns array of arrays // TODO Fuzzy match?
  const happyValues = happyWords.map(function (value, index) {
    return value[1];
  });
  let happySum = 0; // TODO replace with .map

  const happyValuesLength = happyValues.length;
  for (i = 0; i < happyValuesLength; i++) {
    const val = parseFloat(happyValues[i]); // [0: Word, 1: Value, 2: StdDev]
    happySum += val;
  }
  const distinctHappyWords = getUniqueWords(happyWords);

  const happyScore = (happySum / assistantData.words).toPrecision(1);
  assistantData.happyScore = happyScore; // Happiness = Happy score / Words

  // * Calculate LIX & the associated difficulty
  assistantData.lix = calcLix(assistantData.words, assistantData.sentences, assistantData.longwords);
  assistantData.difficulty = lixDifficulty(assistantData.lix, assistantData.words, assistantData.sentences);

  // * Calculate reading & speaking time
  const t = calcTime(assistantData.words);
  assistantData.readingtime = t.readingtime;
  assistantData.speakingtime = t.speakingtime;

  // ! Final step -- Re-constitute the body
  body.blocks = blocks;
  const editorJSON = body;
  const returnObj = {
    editorJSON,
    assistantData,
    uniqueWords,
    distinctRareWords,
    distinctHappyWords,
  };

  console.log(returnObj);

  res.json(returnObj).end(); // Send both JSONs back and the end the connection
  const endTime = new Date();
  console.log("Received by the server at this time", endTime.toLocaleTimeString());
  console.log("Difference in times", endTime - currentTime);
});
