//TODO TypeScript
"use strict";

// * Server-related libraries
const express = require("express");
const compression = require("compression");
const cors = require("cors");

// * Other Libraries
const TextParser = require("./js/text.js").TextParser;
const fs = require("fs");
const papa = require("papaparse");

// * Server setup
const app = express();
app.use(express.json());
app.use(compression());
app.use(cors());

const PORT = 3000;
app.listen(PORT, function () {
  console.log(`Server started on ${PORT}`);
});

const path = require("path");
global.appRoot = path.resolve(__dirname);

let stopord;
fs.readFile(`${appRoot}/data/stopord.csv`, "utf8", function (err, csv) {
  if (err) return console.log(err);
  stopord = papa.parse(csv, { fastMode: true }).data;
  console.log("stopord parsed...", stopord.length);
});

let hedonometerFile;
fs.readFile(`${appRoot}/data/hedonometer.csv`, "utf8", function (err, csv) {
  if (err) return console.log(err);
  hedonometerFile = papa.parse(csv, { fastMode: true }).data;
  console.log("hedonometerFile parsed ...", hedonometerFile.length);
});

let lemmaFile;
const lemmaDict = {};
fs.readFile(`${appRoot}/data/lemmas.csv`, "utf8", function (err, csv) {
  if (err) return console.log(err);
  lemmaFile = papa.parse(csv, { fastMode: true }).data;
  for (const key of lemmaFile) {
    lemmaDict[key[0]] = key[1];
  }
  console.log("lemmaFile parsed...", lemmaFile.length);
});

// * End points
app.get("/api/metrics", textMetrics);
app.post("/api/metrics", textMetrics);

app.post("/api/hedonometer", rateHappiness);

// * Main functions
function textMetrics(req, res) {
  // Time stamp
  const currentTime = new Date();
  console.log("Text Metrics API :: Received by the server at ...", currentTime.toLocaleTimeString());

  // Get request input & options
  const input = req.body.input;
  const inputType = typeof input;
  const options = req.body.options;

  // Extract full text from object
  let textForAnalysis = extractFullText(inputType, input);

  // Preparation - Convert to TextParser object && clean HTML
  textForAnalysis = new TextParser(textForAnalysis);
  textForAnalysis.removeHTML();

  // Optional Remove 'stopord' from the text
  if (options.removeStopwords === "remove") textForAnalysis.removeAllStopord(stopord);

  const frequentlyUsedWords = textForAnalysis.getFrequentWords(stopord);

  // TODO Modify text - hold on until I import my highlighter
  // Assume object
  // let output = input;
  // if (options.highlight != "nothing") {
  //   if (inputType === "object") {
  //     frequentlyUsedWords.forEach((item, index) => {
  //       const highlighted = `<span class='yellow'>${item}</span>`;
  //       const replacementArray = [item, highlighted];
  //       output = traverseEditorJS(input, updateText, replacementArray);
  //     });
  //   }

  //   function updateText(text, replacementArray) {
  //     const oldText = replacementArray[0];
  //     const newText = replacementArray[1];
  //     return text.replaceAll(oldText, newText);
  //   }
  // }

  // Calculations
  textForAnalysis.getWords();
  textForAnalysis.countCharacters();
  textForAnalysis.getSentences();
  textForAnalysis.calcAvgLengths();
  textForAnalysis.calcSentenceVariance(); // Calculate sentence variance & std deviation
  textForAnalysis.calcLix(); // Calculate LIX & the associated difficulty
  textForAnalysis.calcTime(); // Calculate reading & speaking time
  const paragraphs = countParagraphs(input);

  // JSON
  const returnJSON = {
    words: textForAnalysis.wordCount,
    longWords: textForAnalysis.longWordCount,
    charSpaces: textForAnalysis.charsAndSpaces,
    charNoSpaces: textForAnalysis.chars,
    sentences: textForAnalysis.sentenceCount,
    slength: textForAnalysis.avgSentenceLength,
    wlength: textForAnalysis.avgWordLength,
    svariance: textForAnalysis.sentenceVariance,
    sentenceStdDev: textForAnalysis.sentenceStdDev,
    lix: textForAnalysis.lix,
    difficulty: textForAnalysis.lixAudience,
    readingtime: textForAnalysis.timeToRead,
    speakingtime: textForAnalysis.timeToSpeak,
    outputText: output,
    arrLongWords: textForAnalysis.longWords,
    paragraphs: paragraphs,
  };

  console.log(returnJSON);
  res.json(returnJSON).end();

  // Time stamp
  const endTime = new Date();
  console.log("Text Metrics API :: Completed by the server at ...", endTime.toLocaleTimeString());
  console.log(`The operation took ... ${endTime - currentTime}ms`);
}

/**
 * Rate the input text for happy words using the Hedonometer file
 */
function rateHappiness(req, res) {
  // Time stamp
  const currentTime = new Date();
  console.log("Hedonometer API :: Received by the server at ...", currentTime.toLocaleTimeString());

  // Get request input & options
  const input = req.body.input;
  const inputType = typeof input;
  const options = req.body.options;

  // Extract full text from object
  let textForAnalysis = extractFullText(inputType, input);

  // Preparation - Convert to TextParser object && clean
  textForAnalysis = new TextParser(textForAnalysis);
  textForAnalysis.removeHTML().removeNonLetters().removePunctuation().removeDoubleSpacing().convLowerCase().trimText();

  // * Optional Remove 'stopord' from the text
  // if (options.removeStopwords === "remove")
  textForAnalysis.removeAllStopord(stopord);

  // Get words --- and sort?
  textForAnalysis.getWords();

  // * Optional - Remove duplicate words
  // if (options.uniqueOnly === "unique")
  textForAnalysis.getUniqueWords();

  // * Optional - Reduce words to their lemmas where possible
  // if (lemmafyText) textArray =
  textForAnalysis.lemmafyText(lemmaDict);

  // * Get all words also in the hedonometer file, their associated values, and the avg score
  let happyWords = textForAnalysis.rateHappyWords(hedonometerFile);
  const happyValues = happyWords.map(function (v, i) {
    return v[1]; // Takes out the value component only
  });

  // Why again? We remove uniques early on for performance; then lemmafy; then recheck quick in case any of the lemmas are duplicate
  // if (options.uniqueOnly === "unique" && options.lemmafy === "lemmafy")
  // Convert to Set and then back to Array
  const set = new Set(happyWords.map((x) => JSON.stringify(x)));
  happyWords = Array.from(set).map((x) => JSON.parse(x));

  // * Sort by value
  happyWords.sort(TextParser.compareSecondColumn);

  // * Calculate Sum & Score
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
}

// * Auxillary functions

/**
 * Count all the paragraph blocks in EditorJS (Headers & Lists not included)
 * @param  {[Array]}   editorBlocks An array of blocks from an EditorJS object
 * @return {[Number]}               Number of paragraphs
 */
function countParagraphs(editorBlocks) {
  let paragraphs = 0;
  for (let i = 0; i < editorBlocks.length; i++) {
    if (editorBlocks[i].type === "paragraph") paragraphs++;
  }

  return paragraphs;
}

/**
 * Takes as input an editorJS object and corrects punctuation (i.e. adding periods to sentences if they don't have one)
 * @param  {[Object]}   editorJsObject A full editorJS object
 * @param  {[Function]} applyFunction  A function to be applied on all text parts
 * @param  {[Array]}    arrArgs        Array with arguments for the function
 * @return {[Object]}                  Updated editorJS object
 */
function traverseEditorJS(editorJsObject, applyFunction, arrArgs) {
  if (typeof editorJsObject !== "object") {
    console.error("Error: Unable to modify blocks; not an object");
    return {};
  }

  let newBlocks = editorJsObject.blocks;
  // Loop through each block
  for (let i = 0; i < newBlocks.length; i++) {
    const specificBlock = newBlocks[i];
    const typeOfBlock = specificBlock.type;

    switch (typeOfBlock) {
      case "list":
        const noOfItems = specificBlock.data.items.length;
        for (let item = 0; item < noOfItems; item++) {
          specificBlock.data.items[item] = applyFunction(specificBlock.data.items[item], arrArgs);
        }
        newBlocks[i] = specificBlock;
        break;

      case "paragraph":
        specificBlock.data.text = applyFunction(specificBlock.data.text, arrArgs);
        newBlocks[i] = specificBlock;
        break;

      case "header":
        specificBlock.data.text = applyFunction(specificBlock.data.text, arrArgs);
        newBlocks[i] = specificBlock;
        break;

      default:
        break;
    }
  }

  let newEditorJSObject = editorJsObject;
  newEditorJSObject.blocks = newBlocks;
  return newEditorJSObject;
}

/**
 * Extracts all text from the request
 * @param  {[String]}         type  (Optional) Specify the type of the input
 * @param  {[Object/String]}  input Either an EditorJS Object or a string
 * @return {[String]}               One string containing all text
 */
function extractFullText(type = "undefined", input) {
  // If no type specified, one will be defined
  if (type === "undefined") type = typeof input;

  // Extract from EditorJS
  if (type === "object") {
    let output = new String();
    try {
      for (let i = 0; i < input.length; i++) {
        const specificBlock = input[i];
        const typeOfBlock = specificBlock.type;

        if (typeOfBlock === "list") {
          const noOfItems = specificBlock.data.items.length;
          for (let item = 0; item < noOfItems; item++) {
            output += specificBlock.data.items[i];
          }
        } else {
          output += specificBlock.data.text;
        }

        // Add whitespace after block
        output += " ";
      }
    } catch (err) {
      console.error(err);
    }

    return output;
  }
  // Regular string, e.g. people using the API
  else if (type === "string") {
    return String(input);
  } else {
    // Something else; try to convert to string; if impossible, return error
    try {
      const convertToString = input.toString();
      return convertToString;
    } catch (err) {
      console.error("Input must either be an EditorJS object or a value with a toString() method", err);
      return "Fejl";
    }
  }
}
