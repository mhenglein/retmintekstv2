// @codekit-prepend "js/analysis.js";
// @codekit-prepend "js/util.js";
// @codekit-prepend "js/array.js";

const express = require("express");
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
// app.use(express.static(__dirname + "/public/"));

app.listen(3000, function () {
  console.log("Server started");
});

app.post("/api", function (req, res) {
  console.log("Received by the server!");
  let body = req.body;
  let blocks = body.blocks;

  let assistantData = {
    tone: "🤷‍♂️",
    polarity: "🤷‍♂️",
    words: 0,
    longwords: 0,
    sentences: 0,
    wlength: 0, // Average word length
    slength: 0, // Average sentence length
    unique: 0,
    rare: 0,
    red: 0,
    yellow: 0,
    blue: 0,
    hard: 0,
    vhard: 0,
    lix: 0,
    difficulty: "🤷‍♂️",
    chars: 0,
    charsplus: 0,
    readingtime: 0,
    speakingtime: 0,
  };

  // TODO Variance in sentence lengths

  // * Step 1 -- Loop through each block, which may consist of several sentences
  let fullText;
  for (let i = 0; i < blocks.length; i++) {
    const block = cleanText(blocks[i].data.text); // The text content of a specific block - remove all "&nbsp;"
    fullText += block; // Needed to evaluate unique/rare scores later
    // TODO More cleaning required? More test cases needed.

    // * Step 2 -- Get key stats on the block
    let w = countWords(block);
    assistantData.words += w.words;
    assistantData.longwords += w.longWords;

    assistantData.sentences += countSentences(block);
    // TODO sentence lengths here? i.e. countSentences.slengths = [1, 7, 2] etc.

    let c = countCharacters(block);
    assistantData.charsplus += c.charsplus;
    assistantData.chars += c.chars;

    // * Step 3 -- Parcel into sentences & evaluate difficulty
    const sentencesInBlock = getSentencesFromText(block);
    let newBlock = "";
    for (let ii = 0; ii < sentencesInBlock.length; ii++) {
      // Loop through all sentences within a block
      const c = removeTags(sentencesInBlock[ii]); // Remove all tags like <b> so they don't affect letter counts etc.

      // TODO evaluateSentence adds <span> around the sentence -> Can do this at the very end, for safety.
      const w = countWords(c).words;
      const l = countCharacters(c).chars;
      const level = calculateLevel(l, w, 1);
      let sentence = evaluateSentence(w, level, sentencesInBlock[ii]); // Evaluate difficulty of sentence prior to any tagging

      newBlock += `${sentence} `; // Join the sentences together into the original block
    }

    // * Analyze the text at the block level
    let replacementPairs = [];
    replacementPairs.splice(0, replacementPairs.length);

    // let cblock = removeTags(block); // A clean block, i.e. no tags - this should ideally be taken into account
    const analysisOutcome = analyzeText(newBlock, dict, replacementPairs, assistantData);
    assistantData.red += analysisOutcome.red;
    assistantData.yellow += analysisOutcome.yellow;
    assistantData.blue += analysisOutcome.blue;

    let formattedText = analysisOutcome.text;

    // Replace all the IDs with the SpanTag
    formattedText = reconvertBlock(formattedText, replacementPairs);
    console.log("formattedText - after conversion", formattedText);

    blocks[i].data.text = formattedText; // Re-assign
  }

  // * Step Y -- unique & rare analysis on all sentences
  // * Step 2b -- Lemmafy file -> Count unique, rare, happy words
  const lemmaArray = lemmafy(fullText);

  const uniqueWords = getUniqueWords(lemmaArray);
  assistantData.unique += uniqueWords.length;

  // const rareWords = getRareWords(lemmaArray);
  // assistantData.unique += rareWords.length;

  // TODO Fuzzy match
  const happyWords = rateHappyWords(lemmaArray); // Returns array of arrays
  const happyValues = happyWords.map(function (value, index) {
    return value[4];
  });
  let happySum = 0;
  for (let i = 0; i < happyValues.length; i++) {
    const val = parse.Float(happyValues[i]);
    happySum += val;
  }

  // Get column of all values (May need to do a means squared difference or something)

  // * Step X -- Calulate remaining data points
  assistantData.lix = calcLix(assistantData.words, assistantData.sentences, assistantData.longwords);
  assistantData.difficulty = lixDifficulty(assistantData.lix, assistantData.words, assistantData.sentences);
  assistantData.slength = Math.round(assistantData.words / assistantData.sentences);
  assistantData.wlength = Math.round(assistantData.chars / assistantData.words);

  const t = calcTime(assistantData.words);
  assistantData.readingtime = t.readingtime;
  assistantData.speakingtime = t.speakingtime;

  // Happiness = Happy score / Words
  assistantData.happyScore = happuSum / assistantData.words;

  // * Final step -- Re-consitute the body
  body.blocks = blocks;
  const editorJSON = body;
  console.log("EditorJSON", editorJSON);
  console.log(assistantData);
  const returnObj = {
    editorJSON,
    assistantData,
  };

  res.json(returnObj).end(); // Send both JSONs back and the end the connection
});
