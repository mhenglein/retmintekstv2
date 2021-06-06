/* eslint-disable no-unused-vars */
/* eslint-disable import/extensions */
/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
/* eslint-disable import/no-unresolved */

const express = require("./loaders/express");
const files = require("./loaders/files.js");

const { TextHighlighter } = require("./js/analysis.js");
const { TextParser } = require("./js/text.js");
const { TextMath } = require("./js/math.js");
const { dict } = require("./js/array");
const util = require("./js/util");
const ShowLongwords = require("./api/showLongwords");
const SentenceDifficulty = require("./api/sentenceDifficulty");
const SentenceRhythm = require("./api/sentenceRhythm");
const EvaluateVocabulary = require("./api/evaluateVocabulary");
const CheckPronouns = require("./api/checkPronouns");
const RateSentiment = require("./api/rateSentiment");

// * Server setup
const { app } = express;
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
});

// * Main functions
function retMinTekst(req, res) {
  // Time stamp
  const currentTime = new Date();
  console.log("Corrections API :: Received by the server at ...", currentTime.toLocaleTimeString());

  // Get request input & options
  const { input } = req.body;
  const { blocks } = input;
  // const { options } = req.body;

  const errs = {
    korrekthed: 0,
    originalitet: 0,
    klarhed: 0,
    udtryk: 0,
  };

  // Loop through block (ALso count types of mistakes)
  input.blocks.forEach((block) => {
    // Prepare text block
    const parsedText = new TextParser(block.data.text);
    parsedText.removeHTML();

    // 1A: findAndReplaceLight w/ mispellings file
    const findSpellingErrors = new TextHighlighter(parsedText.text, misspelllingDict);
    findSpellingErrors.findAndReplaceLight(); // Has ID codes in it
    const newText = findSpellingErrors.text;
    const misspelledReplacements = findSpellingErrors.replacements;

    // 1B: findAndReplace w/ regular file
    const highlightedText = new TextHighlighter(newText.text, dict.dict);
    const found = highlightedText.findAndReplace();
    highlightedText.reconvertText();

    // Misspellings
    const finalText = new TextHighlighter(highlightedText.text);
    finalText.reconvertTextLight(misspelledReplacements);

    // Reupload highlighted text
    block.data.text = finalText.text;

    // Count errors
    errs.korrekthed += found.Generelt + found.Stavefejl + found.Grammatik;
    errs.klarhed += found.Fyldeord + found.Dobbeltkonfekt + found["Typisk anvendt forkert"];
    errs.originalitet += found.Anglicisme + found.Kliche;
    errs.udtryk += found.Buzzword + found.Formelt;
  });

  // Prepare return obj
  const output = input;
  output.blocks = blocks;

  const returnJSON = {
    korrekthed: errs.korrekthed,
    klarhed: errs.klarhed,
    originalitet: errs.originalitet,
    udtryk: errs.udtryk,
    formattedText: output,
  };

  res.json(returnJSON).end();

  // Time stamp
  const endTime = new Date();
  console.log("Corrections API :: Completed by the server at ...", endTime.toLocaleTimeString());
  console.log(`The operation took ... ${endTime - currentTime}ms`);
}

// Takes string or object(?), returns metrics;
function textMetrics(req, res) {
  // Time stamp
  const currentTime = new Date();
  console.log("Text Metrics API :: Received by the server at ...", currentTime.toLocaleTimeString());

  // Get request input & options
  const { input } = req.body;
  const { blocks } = input;
  const { options } = req.body;

  // Extract full text from object
  let textForAnalysis = extractFullText(typeof input, blocks);

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
  const paragraphs = countParagraphs(input.blocks); // TODO move to client
  const normalsider = Number(textForAnalysis.chars / 2400).toPrecision(2);

  // JSON
  // TODO Object shorthand syntax
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
    paragraphs,
    normalsider,
  };

  console.log(returnJSON);
  res.json(returnJSON).end();

  // Time stamp
  const endTime = new Date();
  console.log("Text Metrics API :: Completed by the server at ...", endTime.toLocaleTimeString());
  console.log(`The operation took ... ${endTime - currentTime}ms`);
}

app.post("/api/longwords", async (req, res) => {
  // Time stamp
  const currentTime = new Date();
  console.log("Long Words API :: Received by the server at ...", currentTime.toLocaleTimeString());

  const { input } = req.body;
  const output = input;

  let arrOfLongWords = [];
  let noOfLongWords = 0;

  // Call to service layer.
  input.blocks.forEach((block, index) => {
    const threshold = 6;
    const { text } = block.data;
    const lw = new ShowLongwords(text).highlightAllLongWords(threshold).getAllLongWords(threshold);

    output.blocks[index].data.text = lw.formatted;
    noOfLongWords += lw.noOfLongWords;
    arrOfLongWords = arrOfLongWords.concat(lw.longWords);
  });

  const returnJSON = {
    output,
    noOfLongWords,
    arrOfLongWords,
  };

  res.json(returnJSON).end();

  // Time stamp
  const endTime = new Date();
  console.log("Long Words API :: Completed by the server at ...", endTime.toLocaleTimeString());
  console.log(`The operation took ... ${endTime - currentTime}ms`);
});

// ! Moved
// function rateHappiness(req, res) {
//   // Time stamp
//   const currentTime = new Date();
//   console.log("Hedonometer API :: Received by the server at ...", currentTime.toLocaleTimeString());

//   // Get request input & options
//   const { input } = req.body;
//   const { blocks } = input;
//   const { options } = req.body; // uniqueOnly; lemmafyText;

//   // Extract full text from object
//   let textForAnalysis = extractFullText(typeof input, blocks);

//   // Preparation - Convert to TextParser object && clean
//   textForAnalysis = new TextParser(textForAnalysis)
//     .removeHTML()
//     .removeNonLetters()
//     .removePunctuation()
//     .removeDoubleSpacing()
//     .convLowerCase()
//     .trimText();

//   // * Optional Remove 'stopord' from the text
//   if (options.removeStopwords) textForAnalysis.removeAllStopord(stopord);

//   textForAnalysis.getWords();

//   // * Optional - Remove duplicate words
//   if (options.uniqueOnly) textForAnalysis.getUniqueWords();

//   // * Optional - Reduce words to their lemmas where possible
//   if (options.lemmafyText) textForAnalysis.lemmafyText(lemmaDict);

//   // * Get all words also in the hedonometer file, their associated values, and the avg score
//   let happyWords = textForAnalysis.rateHappyWords(hedonometerFile);
//   // Takes out the value component only
//   const happyValues = happyWords.map((v) => v[1]);

//   // Why again? We remove uniques early on for performance; then lemmafy; then recheck quick in case any of the lemmas are duplicate
//   if (options.uniqueOnly && options.lemmafyText) {
//     // Convert to Set and then back to Array
//     const set = new Set(happyWords.map((x) => JSON.stringify(x)));
//     happyWords = Array.from(set).map((x) => JSON.parse(x));
//   }

//   // * Sort by value
//   happyWords.sort(TextParser.compareSecondColumn);

//   // * Calculate Sum, Score, and MSE
//   const happySum = happyValues.reduce((pv, cv) => parseFloat(pv) + parseFloat(cv), 0);
//   const happyScore = (happySum / happyValues.length).toPrecision(2);
//   const happyMSE = TextMath.mse(happyValues);
//   const emoji = TextParser.convertValToEmoji(happyScore);

//   // * Optional - Assigns emojis to each word in text using the :after pseud-class
//   const output = input;
//   output.blocks.forEach((block) => {
//     const text = new TextParser(block.data.text);
//     text.removeHTML().removeDoubleSpacing().trimText().getWords();

//     text.words.forEach((word, index) => {
//       // Check the word against the hedonometer file [Cols: ID, Original, EN, DA, Val, Std]
//       const foundValue = hedonometerFile.filter((v) => v[3] === word);

//       // Check if there is a match
//       let html = "";
//       if (foundValue.length > 0 && foundValue !== undefined) {
//         const score = foundValue[0][4];

//         if (score < 2) {
//           html = `<span class='two'><abbr title="attribute">${word}</abbr></span>`;
//         } else if (score < 3) {
//           html = `<span class='three'>${word}</span>`;
//         } else if (score < 4) {
//           html = `<span class='four'>${word}</span>`;
//         } else if (score < 5) {
//           html = `<span class='five'>${word}</span>`;
//         } else if (score < 6) {
//           html = `<span class='six'><abbr title="attribute">${word}</abbr></span>`;
//         } else if (score < 7) {
//           html = `<span class='seven'>${word}</span>`;
//         } else if (score < 8) {
//           html = `<span class='eight'>${word}</span>`;
//         } else if (score < 9) {
//           html = `<span class='nine'>${word}</span>`;
//         } else {
//           html = word;
//         }

//         // this.happy.push([foundValue[0][3], foundValue[0][4], foundValue[0][5]]);
//       } else {
//         // Fuzzy search
//         // const result = fuse.search(word)[0];
//         html = word;
//       }
//       text.words[index] = html;
//     });

//     text.text = text.words.join(" ");
//     text.removeDoubleSpacing();
//     block.data.text = text.text;
//   });

//   // ! Send back JSON w/ scoring and words
//   const returnJSON = {
//     happyWords,
//     happyScore,
//     happyMSE,
//     emoji,
//     output,
//   };

//   // console.log(returnJSON);
//   res.json(returnJSON).end();

//   // Time stamp
//   const endTime = new Date();
//   console.log("Hedonometer API :: Completed by the server at ...", endTime.toLocaleTimeString());
//   console.log("The operation took ...", endTime - currentTime);
// }

// * API that takes a string as input and returns all UNIQUE and RARE words
// ANd ideally more relevant to the user's word choice
// ! Moved
function wordVocab(req, res) {
  // Time stamp
  const currentTime = new Date();
  console.log("Vocab API :: Received by the server at ...", currentTime.toLocaleTimeString());

  // Get request input & options
  const { input } = req.body;
  const { blocks } = input;
  const { options } = req.body; // Threshold, stopord,

  let { threshold } = options;
  try {
    threshold = Math.floor(Number(threshold));
  } catch (err) {
    threshold = 5000;
  }

  // Extract full text from object
  let textForAnalysis = extractFullText(typeof input, blocks);

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
  const repeatWords = textForAnalysis.getFrequentWords().frequentlyUsedWords;

  // Get all unique words (Words that are only used once!)
  const frequencyMap = TextParser.generateFrequencyMap(textForAnalysis.words);

  // Delete if they have more than 1 occurence
  // eslint-disable-next-line no-restricted-syntax
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
  const { rareWords } = textForAnalysis.getRareWords(frequencyFile, threshold);

  // Highlighted output for FREQUENTLY USED WORDS - Loop through EditorJS object
  const output = input;
  if (textForAnalysis.frequentlyUsedWords.length > 0) {
    for (let i = 0; i < input.blocks.length; i += 1) {
      const block = input.blocks[i];
      const { text } = block.data;

      const highlightedText = new TextHighlighter(text);
      highlightedText.findAndReplaceLight(
        textForAnalysis.frequentlyUsedWords, // replacementArray
        "Ofte anvendt ord",
        "Du bruger dette ord ofte i din tekst. Overvej, om du kan begrænse omfanget eller finde passende synonymer.",
        "frequentword"
      );

      highlightedText.reconvertTextLight();

      output.blocks[i].data.text = highlightedText.text;
    }
  }

  // Prepare returnJSON and close connection
  const returnJSON = {
    numAllWords: allWords,
    numRareWords: rareWords.length,
    rareWords,
    numUniqueWords: uniqueWords.length,
    uniqueWords,
    numFrequentlyUsed: repeatWords.length,
    frequentlyUsed: repeatWords,
    output,
  };

  console.log(returnJSON);
  res.json(returnJSON).end();

  // Time stamp
  const endTime = new Date();
  console.log("Vocab API :: Completed by the server at ...", endTime.toLocaleTimeString());
  console.log("The operation took ...", endTime - currentTime);
}

// * API that takes a string or object as input and returns highlighted sentences plus other stuff
app.post("/api/sentence", async (req, res) => {
  // Time stamp
  const currentTime = new Date();
  console.log("Sentence API (Difficulty) :: Received by the server at ...", currentTime.toLocaleTimeString());

  // Get request input & options
  const { input } = req.body;
  // const { options } = req.body;

  input.blocks.forEach((block) => {
    const evaluateSentences = new SentenceDifficulty(block.data.text);
    console.log(evaluateSentences);
  });
});

// ! Moved
function sentenceEvaluateDifficulty(req, res) {
  // Time stamp
  const currentTime = new Date();
  console.log("Sentence API (Difficulty) :: Received by the server at ...", currentTime.toLocaleTimeString());

  // Get request input & options
  const { input } = req.body;
  // const { options } = req.body;

  let [all, easy, hard, veryhard] = [0, 0, 0, 0];

  input.blocks.forEach((block, b) => {
    const textForAnalysis = new TextParser(block.data.text);
    textForAnalysis.removeHTMLexceptFormatting();
    textForAnalysis.getSentences();

    all += textForAnalysis.sentenceCount;

    // Loop through sentences in block b
    for (let index = 0; index < textForAnalysis.sentenceCount; index += 1) {
      const sentence = textForAnalysis.sentences[index];
      const parsedSentence = new TextParser(sentence);
      parsedSentence.removeHTML().removeNonLetters().removePunctuation().trimText();
      parsedSentence.getWords();
      parsedSentence.countCharacters();

      const sentenceLevel = TextParser.calculateLevel(parsedSentence.chars, parsedSentence.wordCount, 1);
      const sentenceDifficulty = TextParser.determineDifficulty(parsedSentence.wordCount, sentenceLevel);

      // ** Assign difficulty **
      if (sentenceDifficulty === "hard") {
        hard += 1;
        textForAnalysis.sentences[index] = `<span class='hard'>${sentence}</span>`;
      } else if (sentenceDifficulty === "veryhard") {
        veryhard += 1;
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
    easy,
    hard,
    veryhard,
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

// ! Moved
function sentenceEvaluateRhythm(req, res) {
  // Time stamp
  const currentTime = new Date();
  console.log("Sentence API (Rhythm) :: Received by the server at ...", currentTime.toLocaleTimeString());

  // Get request input & options
  const { input } = req.body;
  // const { options } = req.body;

  let [s1to3, s4to6, s7to10, s11to18, s19to26, s26plus] = [0, 0, 0, 0, 0, 0];
  let all = 0;

  input.blocks.forEach((block, b) => {
    const textForAnalysis = new TextParser(block.data.text);
    textForAnalysis.removeHTMLexceptFormatting();
    textForAnalysis.getSentences();

    all += textForAnalysis.sentenceCount;

    // Loop through sentences in block b
    for (let index = 0; index < textForAnalysis.sentenceCount; index += 1) {
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
    s1to3,
    s4to6,
    s7to10,
    s11to18,
    s19to26,
    s26plus,
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

// * End points
app.get("/api/metrics", textMetrics);
app.post("/api/metrics", textMetrics);

app.get("/api/hedonometer", rateHappiness);
app.post("/api/hedonometer", rateHappiness);

app.get("/api/vocab", wordVocab);
app.post("/api/vocab", wordVocab);

app.get("/api/sentence", sentenceEvaluateDifficulty);

app.get("/api/rhythm", sentenceEvaluateRhythm);
app.post("/api/rhythm", sentenceEvaluateRhythm);

app.get("/api/retmintekst", retMinTekst);
app.post("/api/retmintekst", retMinTekst);
