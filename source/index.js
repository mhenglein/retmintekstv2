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

let frequencyFile;
fs.readFile(`${appRoot}/data/frequency-ex.csv`, "utf8", function (err, csv) {
  if (err) return console.log(err);
  frequencyFile = papa.parse(csv).data;
  console.log("frequencyFile parsed...", frequencyFile.length);
});

// * End points
app.get("/api/metrics", textMetrics);
app.post("/api/metrics", textMetrics);

app.get("/api/hedonometer", rateHappiness);
app.post("/api/hedonometer", rateHappiness);

app.get("/api/vocab", wordVocab);
app.post("/api/vocab", wordVocab);

app.get("/api/sentence", sentenceEvaluation);
app.post("/api/sentence", sentenceEvaluation);

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
  if (options.removeStopwords) textForAnalysis.removeAllStopord(stopord);

  // Get words --- and sort?
  textForAnalysis.getWords();

  // * Optional - Remove duplicate words
  if (options.uniqueOnly) textForAnalysis.getUniqueWords();

  // * Optional - Reduce words to their lemmas where possible
  if (options.lemmafyText) textForAnalysis.lemmafyText(lemmaDict);

  // * Get all words also in the hedonometer file, their associated values, and the avg score
  let happyWords = textForAnalysis.rateHappyWords(hedonometerFile);
  const happyValues = happyWords.map(function (v, i) {
    return v[1]; // Takes out the value component only
  });

  // Why again? We remove uniques early on for performance; then lemmafy; then recheck quick in case any of the lemmas are duplicate
  if (options.uniqueOnly && options.lemmafyText) {
    // Convert to Set and then back to Array
    const set = new Set(happyWords.map((x) => JSON.stringify(x)));
    happyWords = Array.from(set).map((x) => JSON.parse(x));
  }

  // * Sort by value
  happyWords.sort(TextParser.compareSecondColumn);

  // * Calculate Sum & Score
  // TODO Better scoring, this will bias towards mean
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

// * API that takes a string as input and returns all UNIQUE and RARE words
// ANd ideally more relevant to the user's word choice
function wordVocab(req, res) {
  // Time stamp
  const currentTime = new Date();
  console.log("Vocab API :: Received by the server at ...", currentTime.toLocaleTimeString());

  // Get request input & options
  const input = req.body.input;
  const inputType = typeof input;
  const options = req.body.options;

  let threshold = options.threshold;
  try {
    threshold = ParseInt(threshold);
  } catch (err) {
    threshold = 5000;
  }

  // Extract full text from object
  let textForAnalysis = extractFullText(inputType, input);

  // Preparation - Convert to TextParser object && clean away HTML
  textForAnalysis = new TextParser(textForAnalysis);
  textForAnalysis.removeHTML().removeNonLetters().removePunctuation().removeDoubleSpacing().convLowerCase().trimText();

  // Optional Remove 'stopord' from the text
  if (options.removeStopwords) textForAnalysis.removeAllStopord(stopord);

  // Get words & sort
  textForAnalysis.getWords();
  textForAnalysis.sortWords();
  const allWords = textForAnalysis.words.length;

  // Get all REPEAT words
  textForAnalysis.getFrequentWords(stopord);
  let repeatWords = textForAnalysis.frequentlyUsedWords;

  // Get all unique words (Words that are only used once!)
  const frequencyMap = TextParser.generateFrequencyMap(textForAnalysis.words);

  // Delete if they have more than 1 occurence
  for (const key in frequencyMap) {
    if (Object.prototype.hasOwnProperty.call(frequencyMap, key)) {
      const element = Number(frequencyMap[key]);
      if (element > 1) {
        delete frequencyMap[key];
      }
    }
  }

  // Revert object to 1D-array
  const uniqueWords = Array.from(Object.entries(frequencyMap)).map((s) => s[0]);

  // Get & count all rare words
  // * Remove duplicates  - just to speed things up
  textForAnalysis.getUniqueWords();

  //  * (Optional) -- Lemmafy array
  if (options.lemmafyAll) {
    textForAnalysis.lemmafyText(lemmaDict);

    // Remove any duplicates & store the uniques that may have arisen from the lemmafication
    textForAnalysis.getUniqueWords();
  }

  // Get & count all rare words (word that are not in the top [threshold])
  textForAnalysis.getRareWords(frequencyFile, options.threshold);
  const rareWords = textForAnalysis.rareWords;

  // Prepare returnJSON and close connection
  const returnJSON = {
    numAllWords: allWords,
    numRareWords: rareWords.length,
    rareWords: rareWords,
    numUniqueWords: uniqueWords.length,
    uniqueWords: uniqueWords,
    numFrequentlyUsed: repeatWords.length,
    frequentlyUsed: repeatWords,
  };

  console.log(returnJSON);
  res.json(returnJSON).end();

  // Time stamp
  const endTime = new Date();
  console.log("Vocab API :: Completed by the server at ...", endTime.toLocaleTimeString());
  console.log("The operation took ...", endTime - currentTime);
}

// * API that takes a string or object as input and returns highlighted sentences
// Send back both rhytm and difficulty
function sentenceEvaluation(req, res) {
  // Time stamp
  const currentTime = new Date();
  console.log("Sentence API :: Received by the server at ...", currentTime.toLocaleTimeString());

  // Get request input & options
  const input = req.body.input;
  const inputType = typeof input;
  const options = req.body.options;

  let [all, easy, hard, veryhard] = [0, 0, 0, 0];
  let [s1to3, s4to6, s7to10, s11to18, s19to26, s26plus] = [0, 0, 0, 0, 0, 0];

  if (inputType === "string") {
    // Extract full text from object
    // TODO
    let textForAnalysis = extractFullText(inputType, input);
  } else {
    // Work with EditorJS object -- loop through blocks
    input.forEach((block) => {
      const textForAnalysis = new TextParser(block.data.text);
      textForAnalysis.removeHTMLexceptFormatting();
      textForAnalysis.getSentences();

      all = textForAnalysis.sentenceCount;

      // TODO Bundle up into new blocks; might as well jsut return both difficulty and rhythm sections

      textForAnalysis.sentences.forEach((sentence, index) => {
        const sentenceForAnalysis = new TextParser(sentence);
        sentenceForAnalysis.removeHTML().removeNonLetters().removePunctuation().trimText();
        sentenceForAnalysis.getWords();
        sentenceForAnalysis.countCharacters();

        const sentenceLength = sentenceForAnalysis.wordCount;
        const sentenceLevel = TextParser.calculateLevel(sentenceForAnalysis.chars, sentenceForAnalysis.wordCount, 1);
        const sentenceDifficulty = TextParser.determineDifficulty(sentenceForAnalysis.wordCount, sentenceLevel);

        if ((options.highlight = "difficulty")) {
          // Difficulty
          let newSentence = textForAnalysis.sentences[index];
          if (sentenceDifficulty === "hard") {
            hard++;
            newSentence = `<span class='hard'>${newSentence}</span>`;
          } else if (sentenceDifficulty === "veryhard") {
            veryhard++;
            newSentence = `<span class='veryhard'>${newSentence}</span>`;
          }

          textForAnalysis.sentences[index] = newSentence;
        } else {
          // Rhythm
          let newSentence = textForAnalysis.sentences[index];
          let sentenceEval = assignSentenceByLength(newSentence, sentenceLength);

          newSentence = sentenceEval.newSentence;
          s1to3 += sentenceEval.s1to3;
          s4to6 += sentenceEval.s4to6;
          s7to10 += sentenceEval.s7to10;
          s11to18 += sentenceEval.s11to18;
          s19to26 += sentenceEval.s19to26;
          s26plus += sentenceEval.s26plus;
        }
      });
    });
  }

  easy = all - hard - veryhard;

  // Prepare return objects
  const returnJSON = {
    sentenceCount: all,
    // Sentence difficulty
    easy: easy,
    hard: hard,
    vhard: vhard,
    // Sentence lengths
    s1to3: s1to3,
    s4to6: s4to6,
    s7to10: s7to10,
    s11to18: s11to18,
    s19to26: s19to26,
    s26plus: s26plus,
  };

  console.log(returnJSON);
  res.json(returnJSON).end(); // Send JSON back and end the connection

  // Time stamp
  const endTime = new Date();
  console.log("Sentence API :: Completed by the server at ...", endTime.toLocaleTimeString());
  console.log("The operation took ...", endTime - currentTime);
}

app.post("/api/sentence", function (req, res) {
  // ! Step 2 - Prepare text
  // * The only risk at this point is that the text contains HTML etc. but strip this in the client?
  // Would at some point also like to leave this in

  const sentencesFromText = getSentencesFromText(textForAnalysis);
  const noOfSentences = sentencesFromText.length;

  // ! Step 3 - Optional :: Evaluate sentence difficulty & length
  let [red, yellow, blue, hard, vhard] = [0, 0, 0, 0, 0];
  let [s1to3, s4to6, s7to10, s11to18, s19to26, s26plus] = [0, 0, 0, 0, 0, 0];
  let [finalText, finalTextLength] = ["", ""];

  for (i = 0; i < noOfSentences; i++) {
    let specificSentence = removeHTML(sentencesFromText[i]); // Remove all tags like <b> so they don't affect letter counts etc.
    let [sentenceByDiff, sentenceByLength] = ["", ""];
    // * Evaluate the difficulty of the sentence
    let level = 0,
      words = 0;
    if (sentenceDifficulty) {
      words = getWords(specificSentence).words;
      const chars = countCharacters(specificSentence).chars;
      level = calculateLevel(chars, words, 1); // Sentence difficulty
    }

    // * Evaluate the length of the sentence
    let length = 0;
    if (sentenceRhythm) length = specificSentence.length;

    // ! Step 4 - Optional :: Review sentence against my dictionary
    // let findAndReplaceArray = [];

    // if (textAnalysis) {
    //   findAndReplaceArray.splice(0, findAndReplaceArray.length);
    //   const analysisOutcome = analyzeText(specificSentence, dict, findAndReplaceArray); // dict via global scope
    //   specificSentence = analysisOutcome.text;
    //   red += analysisOutcome.red;
    //   yellow += analysisOutcome.yellow;
    //   blue += analysisOutcome.blue;
    // }
    // ! Step 5 - Optional :: Wrap in <span>s & update stats, depending on step 3

    if (sentenceDifficulty) {
      const sentenceEval = assignSentenceByDifficulty(words, level, specificSentence);
      sentenceByDiff = sentenceEval.newSentence;
      hard += sentenceEval.hard;
      vhard += sentenceEval.vhard;
    }

    if (sentenceRhythm) {
      const sentenceEval = assignSentenceByLength(specificSentence, length);
      sentenceByLength = sentenceEval.newSentence;
      s1to3 += sentenceEval.s1to3;
      s4to6 += sentenceEval.s4to6;
      s7to10 += sentenceEval.s7to10;
      s11to18 += sentenceEval.s11to18;
      s19to26 += sentenceEval.s19to26;
      s26plus += sentenceEval.s26plus;
    }

    // ! Assign sentence back into original string
    if (sentenceRhythm) finalTextLength += sentenceByLength;
    if (sentenceDifficulty) {
      finalText += sentenceDifficulty;
    } else {
      finalText += specificSentence;
    }
  }

  // ! Step 6 - Prepare return objects
  const returnObj = {
    finalText: finalText,
    finalTextLength: finalTextLength,
    // Sentence difficulty
    hard: hard,
    vhard: vhard,
    // Sentence lengths
    s1to3: s1to3,
    s4to6: s4to6,
    s7to10: s7to10,
    s11to18: s11to18,
    s19to26: s19to26,
    s26plus: s26plus,
  };

  console.log(returnObj);
  res.json(returnObj).end(); // Send both JSONs back and the end the connection

  // Time stamp
  const endTime = new Date();
  console.log("Sentence API :: Completed by the server at ...", endTime.toLocaleTimeString());
  console.log("The operation took ...", endTime - currentTime);
});

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

/**
 * Based on length of a sentence, this provides the HTML output
 * Returns the new sentence and its "length category"
 * @param  {[String]} s         The input sentence to be wrapped in tags
 * @param  {[Number]} length    The length of the sentence (in number of words)
 */
function assignSentenceByLength(s, length) {
  switch (length) {
    case value <= 3:
      return { newSentence: `<span class="s1to3">${s}</span>`, s1to3: 1 };
    case value <= 6:
      return { newSentence: `<span class="s4to6">${s}</span>`, s4to6: 1 };
    case value <= 10:
      return { newSentence: `<span class="s7to10">${s}</span>`, s7to10: 1 };
    case value <= 18:
      return { newSentence: `<span class="s11to18">${s}</span>`, s11to18: 1 };
    case value <= 26:
      return { newSentence: `<span class="s19to26">${s}</span>`, s19to26: 1 };
    case value > 26:
      return { newSentence: `<span class="s26plus">${s}</span>`, s26plus: 1 };
    default:
      break;
  }
}
