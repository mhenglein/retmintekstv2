app.post("/api/metrics", function (req, res) {
  // * API that takes a string as input and returns key information on this
  // TODO Filter out long words - can also be as simply as a replaceAll. Longwords -> Uniques only -> ReplaceAll.

  // Time stamp
  const currentTime = new Date();
  console.log("Text Metrics API :: Received by the server at ...", currentTime.toLocaleTimeString());

  // ! Step 1 -- Get input - can both be a string or an object
  const inputType = typeof req.body.input;
  const input = req.body.input;
  const removeStopord = req.body.stopord; // Array of unique words? Or would slow down maybe

  let textForAnalysis = new String("");
  textForAnalysis = extractFullText(inputType, textForAnalysis, input);

  // ! Step 2 - Prepare text
  textForAnalysis = new TextParser(textForAnalysis);
  textForAnalysis.removeHTML();

  // ! Sub-step - Highlight long words
  let returnText;
  let output = input;
  let arrLongWords = [];

  if (inputType === "object") {
    // Object
    for (let i = 0; i < input.length; i++) {
      const editorBlock = input[i].data.text;
      const wordsInBlock = new TextParser(editorBlock).getWords().words;

      for (let j = 0; j < wordsInBlock.length; j++) {
        const specificWord = wordsInBlock[j];
        const cleanedWord = new TextParser(specificWord).removePunctuation().text;

        if (cleanedWord.length > 6) {
          returnText += `<span class='yellow'>${specificWord}</span>`;
          arrLongWords.push(cleanedWord);
        } else {
          returnText += specificWord;
        }
      }
      output[i].data.text = returnText;
    }
  } else {
    // String
    textForAnalysis.getWords();
    const wordsInString = textForAnalysis.words;

    for (let j = 0; j < wordsInString.length; j++) {
      const specificWord = wordsInString[j];
      const cleanedWord = new TextParser(specificWord).removePunctuation().text;

      if (cleanedWord.length > 6) {
        returnText += `<span class='yellow'>${specificWord}</span>`;
        arrLongWords.push(cleanedWord);
      } else {
        returnText += specificWord;
      }
    }

    output = returnText;
  }

  // ! Optional
  // * Remove 'stopord' from the text
  if (removeStopord) textForAnalysis.removeAllStopord();

  // ! Step 3 - Calculate
  textForAnalysis.getWords();
  textForAnalysis.getLongWords();
  textForAnalysis.countCharacters();
  textForAnalysis.getSentences();

  const allSentences = textForAnalysis.sentences;

  const avgSentenceLength = Math.round(textForAnalysis.wordCount / textForAnalysis.sentenceCount); // Calculate the average sentence length
  const avgWordLength = Math.round(textForAnalysis.charNoSpaces / textForAnalysis.wordCount); // Calculate the average word length
  // const paragraphs; // TBD

  // * Get avg. sentence length and sentence variance
  let sentenceLengths = [];
  for (let s = 0; s < sentenceCount; s++) {
    const sentence = new TextParser(allSentences[s]);
    sentence.getWords();
    sentenceLengths.push(sentence.wordCount);
  }

  const sentenceVariance = TextParser.calculateVariance(sentenceLengths, avgSentenceLength);

  // * Calculate LIX & the associated difficulty
  textForAnalysis.calcLix();

  // * Calculate reading & speaking time
  textForAnalysis.calcTime();

  // ! Send back JSON w/ scoring and words
  const returnJSON = {
    words: textForAnalysis.wordCount,
    longWords: textForAnalysis.longWordCount,
    charSpaces: textForAnalysis.charSpaces,
    charNoSpaces: textForAnalysis.charNoSpaces,
    sentences: textForAnalysis.sentenceCount,
    slength: avgSentenceLength,
    wlength: avgWordLength,
    svariance: sentenceVariance,
    lix: textForAnalysis.lix,
    difficulty: textForAnalysis.lixAudience,
    readingtime: textForAnalysis.timeToRead,
    speakingtime: speakingtextForAnalysis.timeToSpeakTime,
    outputText: output,
    arrLongWords: arrLongWords,
  };

  console.log(returnJSON);
  res.json(returnJSON).end();

  // Time stamp
  const endTime = new Date();
  console.log("Text Metrics API :: Completed by the server at ...", endTime.toLocaleTimeString());
  console.log("The operation took ...", endTime - currentTime);
});




// Import files
// ! Data files
const path = require("path");

global.appRoot = path.resolve(__dirname);

let lemmaFile, misspellingsFile, frequencyFile, hedonometerFile, stopord;
const lemmaDict = {};
const misspelllingDict = {};

fs.readFile(`${appRoot}/data/lemmas.csv`, "utf8", function (err, csv) {
  if (err) return console.log(err);
  lemmaFile = papa.parse(csv, { fastMode: true }).data;
  for (const key of lemmaFile) {
    lemmaDict[key[0]] = key[1];
  }

  console.log("lemmaFile parsed...", lemmaFile.length);
});

fs.readFile(`${appRoot}/data/misspellings.csv`, "utf8", function (err, csv) {
  if (err) return console.log(err);
  misspellingsFile = papa.parse(csv).data;
  for (const key of misspellingsFile) {
    misspelllingDict[key[0]] = key[1];
  }
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
