//TODO TypeScript
//TODO Fuzzy search Hedonometer

// * Server-related libraries
const express = require("express");
const compression = require("compression");
const cors = require("cors");

// * Other Libraries
const TextParser = require("./js/text.js").TextParser;
const TextHighlighter = require("./js/analysis.js").TextHighlighter;
const dict = require(__dirname + "/js/array.js");

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

app.get("/api/sentence", sentenceEvaluateDifficulty);
app.post("/api/sentence", sentenceEvaluateDifficulty);

app.get("/api/rhythm", sentenceEvaluateRhythm);
app.post("/api/rhythm", sentenceEvaluateRhythm);

app.get("/api/retmintekst", retMinTekst);
app.post("/api/retmintekst", retMinTekst);

// * Main functions
function retMinTekst(req, res) {
  // Time stamp
  const currentTime = new Date();
  console.log("Corrections API :: Received by the server at ...", currentTime.toLocaleTimeString());

  // Get request input & options
  const input = req.body.input;
  const blocks = input.blocks;
  const inputType = typeof input;
  const options = req.body.options;

  const outputObject = {
    korrekthed: 0,
    originalitet: 0,
    klarhed: 0,
    udtryk: 0,
  };

  // Loop through block (ALso count types of mistakes)
  input.blocks.forEach((block, index) => {
    // Prepare text block
    const parsedText = new TextParser(block.data.text);
    parsedText.removeHTML();

    // 1A: findAndReplaceLight w/ mispellings file
    // TODO

    // 1B: findAndReplace w/ regular file
    const highlightedText = new TextHighlighter(parsedText.text, dict.dict);
    const errObject = highlightedText.findAndReplace();
    highlightedText.reconvertText();

    // Reupload highlighted text
    block.data.text = highlightedText.text;

    // Count errors
    outputObject.korrekthed = outputObject.korrekthed + errObject.Generelt + errObject.Stavefejl + errObject.Grammatik;
    outputObject.klarhed =
      outputObject.klarhed + errObject.Fyldeord + errObject.Dobbeltkonfekt + errObject["Typisk anvendt forkert"];
    outputObject.originalitet = outputObject.originalitet + errObject.Anglicisme + errObject.Kliche;
    outputObject.udtryk = outputObject.udtryk + errObject.Buzzword + errObject.Formelt;
  });

  // Prepare return obj
  let output = input;
  output.blocks = blocks;

  const returnJSON = {
    korrekthed: outputObject.korrekthed,
    klarhed: outputObject.klarhed,
    originalitet: outputObject.originalitet,
    udtryk: outputObject.udtryk,
    formattedText: output,
  };

  res.json(returnJSON).end();

  // Time stamp
  const endTime = new Date();
  console.log("Corrections API :: Completed by the server at ...", endTime.toLocaleTimeString());
  console.log(`The operation took ... ${endTime - currentTime}ms`);
}

function textMetrics(req, res) {
  // Time stamp
  const currentTime = new Date();
  console.log("Text Metrics API :: Received by the server at ...", currentTime.toLocaleTimeString());

  // Get request input & options
  const input = req.body.input;
  const blocks = input.blocks;
  const inputType = typeof input;
  const options = req.body.options;

  // Extract full text from object
  let textForAnalysis = extractFullText(inputType, blocks);

  // Preparation - Convert to TextParser object && clean HTML
  textForAnalysis = new TextParser(textForAnalysis);
  textForAnalysis.removeHTML();

  // Optional Remove 'stopord' from the text
  if (options.removeStopwords === "remove") textForAnalysis.removeAllStopord(stopord);

  // Calculations
  textForAnalysis.getWords();
  textForAnalysis.countCharacters();
  textForAnalysis.getSentences();
  textForAnalysis.calcAvgLengths();
  textForAnalysis.calcSentenceVariance(); // Calculate sentence variance & std deviation
  textForAnalysis.calcLix(); // Calculate LIX & the associated difficulty
  textForAnalysis.calcTime(); // Calculate reading & speaking time
  const paragraphs = countParagraphs(input);
  const normalsider = Number(textForAnalysis.chars / 2400).toPrecision(2);

  // Highlighted output - Loop through EditorJS object
  let highlightedObject = input;
  for (let i = 0; i < input.blocks.length; i++) {
    const block = input.blocks[i];
    const text = block.data.text;

    const highlightedText = new TextHighlighter(text);
    highlightedText.findAndReplaceLight(
      textForAnalysis.longWords, // replacementArray
      "Langt ord",
      "Ord på over 6 bogstaver trækker dit LIX-tal op",
      "longword"
    );

    highlightedText.reconvertTextLight();

    highlightedObject.blocks[i].data.text = highlightedText.text;
  }

  // JSON
  const returnJSON = {
    words: textForAnalysis.wordCount,
    longWords: textForAnalysis.longWordCount,
    charSpaces: textForAnalysis.charsAndSpaces,
    charNoSpaces: textForAnalysis.chars,
    sentences: textForAnalysis.sentenceCount,
    slength: textForAnalysis.avgSentenceLength,
    wlength: textForAnalysis.avgWordLength,
    variance: textForAnalysis.sentenceVariance,
    sentenceStdDev: textForAnalysis.sentenceStdDev,
    lix: textForAnalysis.lix,
    difficulty: textForAnalysis.lixDifficulty,
    audience: textForAnalysis.lixAudience,
    readingtime: textForAnalysis.timeToRead,
    speakingtime: textForAnalysis.timeToSpeak,
    outputText: highlightedObject,
    arrLongWords: textForAnalysis.longWords,
    paragraphs: paragraphs,
    normalsider: normalsider,
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
  const blocks = input.blocks;
  const inputType = typeof input;
  const options = req.body.options; // uniqueOnly; lemmafyText;

  // Extract full text from object
  let textForAnalysis = extractFullText(inputType, blocks);

  // Preparation - Convert to TextParser object && clean
  textForAnalysis = new TextParser(textForAnalysis)
    .removeHTML()
    .removeNonLetters()
    .removePunctuation()
    .removeDoubleSpacing()
    .convLowerCase()
    .trimText();

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
  const emoji = TextParser.convertValToEmoji(happyScore);

  // ! Send back JSON w/ scoring and words
  const returnJSON = {
    happyWords: happyWords,
    happyScore: happyScore,
    emoji: emoji,
    outputText: "",
  };

  // console.log(returnJSON);
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
  const blocks = input.blocks;
  const inputType = typeof input;
  const options = req.body.options; // Threshold, stopord,

  let threshold = options.threshold;
  try {
    threshold = ParseInt(threshold);
  } catch (err) {
    threshold = 5000;
  }

  // Extract full text from object
  let textForAnalysis = extractFullText(inputType, blocks);

  // Preparation - Convert to TextParser object && clean away HTML
  textForAnalysis = new TextParser(textForAnalysis);
  textForAnalysis.removeHTML().removeNonLetters().removePunctuation().removeDoubleSpacing().convLowerCase().trimText();

  // Optional Remove 'stopord' from the text
  if (options.removeStopwords) textForAnalysis.removeAllStopord(stopord);

  // Get words & sort
  textForAnalysis.getWords();
  textForAnalysis.sortWords();
  const allWords = textForAnalysis.words.length;

  // Get all REPEAT words (Do not include stopord file)
  let repeatWords = textForAnalysis.getFrequentWords().frequentlyUsedWords;

  // Get all unique words (Words that are only used once!)
  const frequencyMap = TextParser.generateFrequencyMap(textForAnalysis.words);

  // Delete if they have more than 1 occurence
  for (const key in frequencyMap) {
    if (Object.prototype.hasOwnProperty.call(frequencyMap, key)) {
      const element = Number(frequencyMap[key]);
      if (element > 1) delete frequencyMap[key];
    }
  }

  // Revert object to 1D-array
  const uniqueWords = Array.from(Object.entries(frequencyMap)).map((s) => s[0]);

  // Get & count all rare words
  textForAnalysis.getUniqueWords(); // Remove duplicates  - just to speed things up

  //  * (Optional) -- Lemmafy array
  if (options.lemmafyAll) {
    textForAnalysis.lemmafyText(lemmaDict);
    textForAnalysis.getUniqueWords(); // Remove any duplicates & store the uniques that may have arisen from the lemmafication
  }

  // Get & count all rare words (word that are not in the top [threshold])
  const rareWords = textForAnalysis.getRareWords(frequencyFile, options.threshold).rareWords;

  // Highlighted output for FREQUENTLY USED WORDS - Loop through EditorJS object
  let highlightedObject = input;
  if (textForAnalysis.frequentlyUsedWords.length > 0) {
    for (let i = 0; i < input.blocks.length; i++) {
      const block = input.blocks[i];
      const text = block.data.text;

      const highlightedText = new TextHighlighter(text);
      highlightedText.findAndReplaceLight(
        textForAnalysis.frequentlyUsedWords, // replacementArray
        "Ofte anvendt ord",
        "Du bruger dette ord ofte i din tekst. Overvej, om du kan begrænse omfanget eller finde passende synonymer.",
        "frequentword"
      );

      highlightedText.reconvertTextLight();

      highlightedObject.blocks[i].data.text = highlightedText.text;
    }
  }

  // Prepare returnJSON and close connection
  const returnJSON = {
    numAllWords: allWords,
    numRareWords: rareWords.length,
    rareWords: rareWords,
    numUniqueWords: uniqueWords.length,
    uniqueWords: uniqueWords,
    numFrequentlyUsed: repeatWords.length,
    frequentlyUsed: repeatWords,
    outputObject: highlightedObject,
  };

  console.log(returnJSON);
  res.json(returnJSON).end();

  // Time stamp
  const endTime = new Date();
  console.log("Vocab API :: Completed by the server at ...", endTime.toLocaleTimeString());
  console.log("The operation took ...", endTime - currentTime);
}

// * API that takes a string or object as input and returns highlighted sentences plus other stuff
function sentenceEvaluateDifficulty(req, res) {
  // Time stamp
  const currentTime = new Date();
  console.log("Sentence API (Difficulty) :: Received by the server at ...", currentTime.toLocaleTimeString());

  // Get request input & options
  const input = req.body.input;
  const options = req.body.options;

  let [all, easy, hard, veryhard] = [0, 0, 0, 0];

  input.blocks.forEach((block, b) => {
    const textForAnalysis = new TextParser(block.data.text);
    textForAnalysis.removeHTMLexceptFormatting();
    textForAnalysis.getSentences();

    all += textForAnalysis.sentenceCount;

    // Loop through sentences in block b
    for (let index = 0; index < textForAnalysis.sentenceCount; index++) {
      const sentence = textForAnalysis.sentences[index];
      const parsedSentence = new TextParser(sentence);
      parsedSentence.removeHTML().removeNonLetters().removePunctuation().trimText();
      parsedSentence.getWords();
      parsedSentence.countCharacters();

      const sentenceLevel = TextParser.calculateLevel(parsedSentence.chars, parsedSentence.wordCount, 1);
      const sentenceDifficulty = TextParser.determineDifficulty(parsedSentence.wordCount, sentenceLevel);

      // ** Assign difficulty **
      if (sentenceDifficulty === "hard") {
        hard++;
        textForAnalysis.sentences[index] = `<span class='hard'>${sentence}</span>`;
      } else if (sentenceDifficulty === "veryhard") {
        veryhard++;
        textForAnalysis.sentences[index] = `<span class='veryhard'>${sentence}</span>`;
      }
    }

    input.blocks[b].data.text = textForAnalysis.sentences.join("");
  });

  easy = all - hard - veryhard;

  // Prepare return objects
  const returnJSON = {
    sentenceCount: all,
    // * Sentence difficulty
    easy: easy,
    hard: hard,
    veryhard: veryhard,
    // * Formatted objects
    difficulty: input,
  };

  console.log(returnJSON);
  res.json(returnJSON).end(); // Send JSON back and end the connection

  // Time stamp
  const endTime = new Date();
  console.log("Sentence API (Difficulty) :: Completed by the server at ...", endTime.toLocaleTimeString());
  console.log("The operation took ...", endTime - currentTime);
}

function sentenceEvaluateRhythm(req, res) {
  // Time stamp
  const currentTime = new Date();
  console.log("Sentence API (Rhythm) :: Received by the server at ...", currentTime.toLocaleTimeString());

  // Get request input & options
  const input = req.body.input;
  const options = req.body.options;

  let [s1to3, s4to6, s7to10, s11to18, s19to26, s26plus] = [0, 0, 0, 0, 0, 0];
  let all = 0;

  input.blocks.forEach((block, b) => {
    const textForAnalysis = new TextParser(block.data.text);
    textForAnalysis.removeHTMLexceptFormatting();
    textForAnalysis.getSentences();

    all += textForAnalysis.sentenceCount;

    // Loop through sentences in block b
    for (let index = 0; index < textForAnalysis.sentenceCount; index++) {
      const sentence = textForAnalysis.sentences[index];
      const parsedSentence = new TextParser(sentence);
      parsedSentence.removeHTML().removeNonLetters().removePunctuation().trimText();
      parsedSentence.getWords();
      const sentenceLength = parsedSentence.wordCount;

      // ** Asign rhythm **
      const sentenceEval = assignSentenceByLength(sentence, sentenceLength);
      textForAnalysis.sentences[index] = String(sentenceEval.newSentence);

      s1to3 += Number(sentenceEval.s1to3);
      s4to6 += Number(sentenceEval.s4to6);
      s7to10 += Number(sentenceEval.s7to10);
      s11to18 += Number(sentenceEval.s11to18);
      s19to26 += Number(sentenceEval.s19to26);
      s26plus += Number(sentenceEval.s26plus);
    }
    input.blocks[b].data.text = textForAnalysis.sentences.join("");
  });

  // Prepare return objects
  const returnJSON = {
    sentenceCount: all,
    // * Sentence lengths
    s1to3: s1to3,
    s4to6: s4to6,
    s7to10: s7to10,
    s11to18: s11to18,
    s19to26: s19to26,
    s26plus: s26plus,
    // * Formatted objects
    rhythm: input,
  };

  console.log(returnJSON);
  res.json(returnJSON).end(); // Send JSON back and end the connection

  // Time stamp
  const endTime = new Date();
  console.log("Sentence API (Rhythm) :: Completed by the server at ...", endTime.toLocaleTimeString());
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

/**
 * Based on length of a sentence, this provides the HTML output
 * Returns the new sentence and its "length category"
 * @param  {[String]} s         The input sentence to be wrapped in tags
 * @param  {[Number]} length    The length of the sentence (in number of words)
 */
function assignSentenceByLength(s, length) {
  if (length <= 3) {
    return {
      newSentence: `<span class="s1to3">${s}</span>`,
      s1to3: 1,
      s4to6: 0,
      s7to10: 0,
      s11to18: 0,
      s19to26: 0,
      s26plus: 0,
    };
  } else if (length <= 6) {
    return {
      newSentence: `<span class="s4to6">${s}</span>`,
      s1to3: 0,
      s4to6: 1,
      s7to10: 0,
      s11to18: 0,
      s19to26: 0,
      s26plus: 0,
    };
  } else if (length <= 10) {
    return {
      newSentence: `<span class="s7to10">${s}</span>`,
      s1to3: 0,
      s4to6: 0,
      s7to10: 1,
      s11to18: 0,
      s19to26: 0,
      s26plus: 0,
    };
  } else if (length <= 18) {
    return {
      newSentence: `<span class="s11to18">${s}</span>`,
      s1to3: 0,
      s4to6: 0,
      s7to10: 0,
      s11to18: 1,
      s19to26: 0,
      s26plus: 0,
    };
  } else if (length <= 26) {
    return {
      newSentence: `<span class="s19to26">${s}</span>`,
      s1to3: 0,
      s4to6: 0,
      s7to10: 0,
      s11to18: 0,
      s19to26: 1,
      s26plus: 0,
    };
  } else if (length > 26) {
    return {
      newSentence: `<span class="s26plus">${s}</span>`,
      s1to3: 0,
      s4to6: 0,
      s7to10: 0,
      s11to18: 0,
      s19to26: 0,
      s26plus: 1,
    };
  } else {
    return { newSentence: `${s}`, s1to3: 0, s4to6: 0, s7to10: 0, s11to18: 0, s19to26: 0, s26plus: 0 };
  }
}
