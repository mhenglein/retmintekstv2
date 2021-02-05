"use strict";
// @codekit-prepend "js/analysis.js";
// @codekit-prepend "js/util.js";

const express = require("express");
const compression = require("compression");
const fs = require("fs");
const papa = require("papaparse");
const Fuse = require("fuse.js");

// ! Data files
const path = require("path");
const { text } = require("express");
global.appRoot = path.resolve(__dirname);

let lemmaFile, misspellingsFile, frequencyFile, hedonometerFile, stopord;

fs.readFile(`${appRoot}/data/lemmas.csv`, "utf8", function (err, csv) {
  if (err) return console.log(err);
  lemmaFile = papa.parse(csv, { fastMode: true }).data;
  console.log("lemmaFile parsed...", lemmaFile.length);
});

fs.readFile(`${appRoot}/data/misspellings.csv`, "utf8", function (err, csv) {
  if (err) return console.log(err);
  misspellingsFile = papa.parse(csv).data;
  console.log("misspellingsFile parsed...", misspellingsFile.length);
});

fs.readFile(`${appRoot}/data/hedonometer.csv`, "utf8", function (err, csv) {
  if (err) return console.log(err);
  hedonometerFile = papa.parse(csv, { fastMode: true }).data;
  console.log("hedonometerFile parsed ...", hedonometerFile.length);
});

fs.readFile(`${appRoot}/data/frequency-ex.csv`, "utf8", function (err, csv) {
  if (err) return console.log(err);
  frequencyFile = papa.parse(csv).data;
  console.log("frequencyFile parsed...", frequencyFile.length);
});

fs.readFile(`${appRoot}/data/stopord.csv`, "utf8", function (err, csv) {
  if (err) return console.log(err);
  stopord = papa.parse(csv, { fastMode: true }).data;
  console.log("stopord parsed...", stopord.length);
});

const app = express();

app.use(express.json());
app.use(compression());

// app.use(express.static(__dirname + "/public/"));

app.listen(3000, function () {
  console.log("Server started");
});

app.get("/sentiment", function (req, res) {
  console.log("Received by the server!");

  // Use child_process.spawn method from
  // child_process module and assign it
  // to variable spawn
  const spawn = require("child_process").spawn;

  // Parameters passed in spawn -
  // 1. type_of_script
  // 2. list containing Path of the script
  //    and arguments for the script

  // E.g : http://localhost:3000/name?firstname=Mike&lastname=Will
  // so, first name = Mike and last name = Will
  const process = spawn("python", ["py/nlp.py", req.query.firstname, req.query.lastname]);

  // Takes stdout data from script which executed
  // with arguments and send this data to res object
  process.stdout.on("data", function (data) {
    res.send(data.toString());
  });
});

app.post("/api/hedonometer", function (req, res) {
  // * API that takes a string as input & returns associated data points related to the Hedonometer
  let i;

  // Time stamp
  const currentTime = new Date();
  console.log("Hedonometer API :: Received by the server at ...", currentTime.toLocaleTimeString());

  // ! Step 1 -- Get input
  let textForAnalysis = req.body.text; // String of text
  const removeStopord = req.body.stopord;
  const lemmafyText = req.body.lemmafy;
  const uniqueOnly = req.body.unique;

  // ! Step 2 - Prepare text
  textForAnalysis = removePunctuation(removeTags(textForAnalysis).toLowerCase());

  // ! Optional
  // * Remove 'stopord' from the text
  if (removeStopord) textForAnalysis = removeAllStopord(textForAnalysis);

  // ! Step 3 - Split into array of words and sort
  let textArray = splitStringToArray(textForAnalysis).sort();

  // * Optional - Remove unique words List of unique words w/ scoring etc.
  if (uniqueOnly) textArray = Array.from(new Set(textArray));

  // * Optional - Reduce words to their lemmas where possible
  if (lemmafyText) textArray = lemmafy(textArray);

  // * Get all words also in the hedonometer file, their associated values, and the avg score
  let happyWords = rateHappyWords(textArray); // Returns array of arrays
  const happyValues = happyWords.map(function (v, i) {
    return v[1];
  }); // Takes out the value component only

  // * Sort by value
  happyWords = happyWords.sort(compareSecondColumn);

  // * Why again? We remove uniques early on for performance; then lemmafy; then recheck quick in case any of the lemmas are duplicate
  if (uniqueOnly && lemmafyText) happyWords = getUniqueWords(happyWords);

  const happySum = happyValues.reduce((pv, cv) => parseFloat(pv) + parseFloat(cv), 0);
  const happyScore = (happySum / happyValues.length).toPrecision(2);

  // ! Send back JSON w/ scoring and words
  const returnJSON = {
    happyWords: happyWords,
    happyScore: happyScore,
  };

  console.log(returnJSON);
  res.json(returnJSON).end();

  // Time stamp
  const endTime = new Date();
  console.log("Hedonometer API :: Completed by the server at ...", endTime.toLocaleTimeString());
  console.log("The operation took ...", endTime - currentTime);
});

app.post("/api/textanalysis", function (req, res) {
  // * API that takes a string as input and returns key information on this

  let i;

  // Time stamp
  const currentTime = new Date();
  console.log("Text Analysis API :: Received by the server at ...", currentTime.toLocaleTimeString());

  // ! Step 1 -- Get input
  let textForAnalysis = req.body.text; // String of text
  const removeStopord = req.body.stopord; // Array of unique words? Or would slow down maybe

  // ! Step 2 - Prepare text
  textForAnalysis = removeTags(textForAnalysis);

  // const textNoPunctuation = removePunctuation(textForAnalysis);

  // ! Optional
  // * Remove 'stopord' from the text
  if (removeStopord) textForAnalysis = removeAllStopord(textForAnalysis);

  // ! Step 3 - Calculate
  const wordsObj = countWords(textForAnalysis);
  const words = wordsObj.words;
  const longWords = wordsObj.longWords;

  const charsObj = countCharacters(textForAnalysis);
  const charSpaces = charsObj.charsplus;
  const charNoSpaces = charsObj.chars;

  const allSentences = getSentencesFromText(textForAnalysis);

  const sentences = allSentences.length;

  const slength = Math.round(words / sentences); // Calculate the average sentence length
  const wlength = Math.round(charNoSpaces / words); // Calculate the average word length
  // const paragraphs; // TBD

  // * Get avg. sentence length and sentence variance
  let sentenceLengths = [];
  const allSentencesLength = allSentences.length;
  for (let s = 0; s < allSentencesLength; s++) {
    const sentence = allSentences[s];
    const wordsInSentence = countWords(sentence).words;
    sentenceLengths.push(wordsInSentence);
  }

  const svariance = calculateVariance(sentenceLengths, slength);

  // * Calculate LIX & the associated difficulty
  const lix = calcLix(words, sentences, longWords);
  const difficulty = lixDifficulty(lix, words, sentences);

  // * Calculate reading & speaking time
  const t = calcTime(words);
  const readingtime = t.readingtime;
  const speakingtime = t.speakingtime;

  // ! Send back JSON w/ scoring and words
  const returnJSON = {
    words: words,
    longWords: longWords,
    charSpaces: charSpaces,
    charNoSpaces: charNoSpaces,
    sentences: sentences,
    slength: slength,
    wlength: wlength,
    svariance: svariance,
    lix: lix,
    difficulty: difficulty,
    readingtime: readingtime,
    speakingtime: speakingtime,
  };

  console.log(returnJSON);
  res.json(returnJSON).end();

  // Time stamp
  const endTime = new Date();
  console.log("Text Analysis API :: Completed by the server at ...", endTime.toLocaleTimeString());
  console.log("The operation took ...", endTime - currentTime);
});

app.post("/api/vocab", function (req, res) {
  // * API that takes a string as input and returns all UNIQUE and RARE words

  let i;

  // Time stamp
  const currentTime = new Date();
  console.log("Rare Words API :: Received by the server at ...", currentTime.toLocaleTimeString());

  // ! Step 1 -- Get input
  let textForAnalysis = req.body.text; // String of text
  const threshold = parseInt(req.body.threshold) || 5000; // When is a word considered "common"
  const lemmafyText = req.body.lemmafy || false;
  const stopord = req.body.stopord || false;

  // ! Step 2 - Prepare text
  textForAnalysis = removePunctuation(removeTags(textForAnalysis).toLowerCase());

  // * Remove stopord  - just to speed things up
  if (stopord) textForAnalysis = removeAllStopord(textForAnalysis);

  // ! Step 3 - Split into array of words and sort
  let textArray = splitStringToArray(textForAnalysis).sort();

  // * Remove duplicates  - just to speed things up
  textArray = Array.from(new Set(textArray));

  // ! Step 4 (Optional) -- Lemmafy array
  if (lemmafyText) textArray = lemmafy(textArray);

  // ! Step 5 - Get & count all rare words
  // * Get & count all rare words (word that are not in the top [threshold])
  let rareWords = getRareWords(textArray, threshold);

  // * Remove any uniques that may have arisen from the lemmafication
  if (lemmafyText) rareWords = getUniqueWords(rareWords);

  // * Title case the words
  rareWords = rareWords.map((word) => titleCaseWord(word));

  // ! Step 6 - Prepare returnJSON and close connection
  const returnJSON = {
    noOfRareWords: rareWords.length,
    rareWords: rareWords,
  };

  console.log(returnJSON);
  res.json(returnJSON).end();

  // Time stamp
  const endTime = new Date();
  console.log("Rare Words API :: Completed by the server at ...", endTime.toLocaleTimeString());
  console.log("The operation took ...", endTime - currentTime);
});

app.post("/api", function (req, res) {
  const currentTime = new Date();
  console.log("Received by the server at this time", currentTime.toLocaleTimeString());
  // @ Variables used throughout
  let i, j, s;

  // ! Step 1 -- Get blocks editorJS
  let body = req.body;
  console.log(body);
  let blocks = body.blocks;
  console.log(blocks);
  let assistantData = { red: 0, yellow: 0, blue: 0, hard: 0, vhard: 0 };

  // ! Step 2 -- Loop through each block to
  // !  (a) combine into one text file for analysis purposes, and
  // !  (b) to evaluate each on a sentence level

  let fullText = "";
  const blocksLength = blocks.length;
  for (i = 0; i < blocksLength; i++) {
    // * The text content of a specific block
    const blockType = block[i].type;
    let block;
    if (blockType === "list") {
      block = blocks[i].data.items;
    } else {
      block = blocks[i].data.text;
    }

    // * Combine into one block of text
    if (blockType === "list") {
      for (let index = 0; index < block.length; index++) {
        fullText += block[i];
      }
    } else {
      fullText += block;
    }

    // * Parcel into sentences
    let sentencesInBlock = [];
    if (blockType === "list") {
    } else {
      sentencesInBlock = getSentencesFromText(block);
    }

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
  let textForAnalysis = fullText; // Remove 'stopord' from the text
  const stopOrdLength = stopord.length;
  for (i = 0; i < stopOrdLength; i++) {
    // textForAnalysis = textForAnalysis.replaceAll(` ${stopord[i]} `, " ")
    const regexString = new RegExp(`\\s${stopord[i]}\\s`, "ig");
    textForAnalysis = textForAnalysis.replaceAll(regexString, " ");
  }
  textForAnalysis.replaceAll("  ", " ");
  const lemmaArray = lemmafy(textForAnalysis);

  // * Count all words, incl. long words (>6) for LIX calculations
  let wordsObject = countWords(fullText);
  assistantData.words = wordsObject.words;
  assistantData.longwords = wordsObject.longWords;

  // * Get all sentences; count total #
  let allSentences = getSentencesFromText(fullText);
  assistantData.sentences = allSentences.length;

  // ? Validation check
  // console.log("The number of sentences are ...", assistantData.sentences, countSentences(fullText));

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
