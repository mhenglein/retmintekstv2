// SCRIPTS.JS
const redErrors = document.querySelectorAll(".editor span.red");
const yellowErrors = document.querySelectorAll(".editor span.yellow");
const blueErrors = document.querySelectorAll(".editor span.blue");

let i;

const redLength = redErrors.length;
let redArr = [];
for (i = 0; i < redLength; i++) {
  redArr.push(standardizeText(redErrors[i].innerText));
}
redArr = getUniqueWords(redArr);
modalReds.innerHTML = redArr.map((txt) => `<span class="badge bg-red me-1 ms-1">${txt}</span>`).join(" ");

const yellowLength = yellowErrors.length;
let yellowArr = [];
for (i = 0; i < yellowLength; i++) {
  yellowArr.push(standardizeText(yellowErrors[i].innerText));
}
yellowArr = getUniqueWords(yellowArr);
modalYellows.innerHTML = yellowArr.map((txt) => `<span class="badge bg-yellow me-1 ms-1">${txt}</span>`).join(" ");

const blueLength = blueErrors.length;
let blueArr = [];
for (i = 0; i < blueLength; i++) {
  blueArr.push(standardizeText(blueErrors[i].innerText));
}
blueArr = getUniqueWords(blueArr);
modalBlues.innerHTML = blueArr.map((txt) => `<span class="badge bg-blue me-1 ms-1">${txt}</span>`).join(" ");

const uniqueWordsLength = data.uniqueWords.length;
modalUniques.innerHTML = "";
for (i = 0; i < uniqueWordsLength; i++) {
  const txt = data.uniqueWords[i];
  modalUniques.innerHTML += `<span class="badge bg-light text-dark me-1 ms-1">${txt}</span>`;
}

const rareWordsLength = data.distinctRareWords.length;
modalRares.innerHTML = "";
for (i = 0; i < rareWordsLength; i++) {
  const txt = data.distinctRareWords[i];
  modalRares.innerHTML += `<span class="badge bg-light text-dark me-1 ms-1">${txt}</span>`;
}

// Happy words
const happyWordsLength = data.distinctHappyWords.length;

for (i = 0; i < happyWordsLength; i++) {
  const happyWord = data.distinctHappyWords[i][0];
  const happyValue = parseFloat(data.distinctHappyWords[i][1]);
  const happyStd = parseFloat(data.distinctHappyWords[i][2]);
  const emoji = convertValToEmoji(parseFloat(happyValue));
  modalHappy.innerHTML += `<li>${emoji} ${happyWord} <span class="badge bg-light text-dark font-monospace">[${happyValue} / 9]</span></li>`;
}

// INDEX.JS
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
  textForAnalysis = removePunctuation(removeHTML(textForAnalysis).toLowerCase());

  // ! Optional
  // * Remove 'stopord' from the text
  if (removeStopord) textForAnalysis = removeAllStopord(textForAnalysis);

  // ! Step 3 - Split into array of words and sort
  let textArray = getWords(textForAnalysis).w;
  textArray = textArray.sort();

  // * Optional - Remove duplicate words
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

app.post("/api/vocab", function (req, res) {
  // * API that takes a string as input and returns all UNIQUE and RARE words

  // Time stamp
  const currentTime = new Date();
  console.log("Vocab API :: Received by the server at ...", currentTime.toLocaleTimeString());

  // ! Step 1 -- Get input
  let textForAnalysis = req.body.text; // String of text
  const threshold = parseInt(req.body.threshold) || 5000; // When is a word considered "common"
  const lemmafyText = req.body.lemmafy || false;
  const stopord = req.body.stopord || false;

  // ! Step 2 - Prepare text
  textForAnalysis = removePunctuation(removeHTML(textForAnalysis).toLowerCase());

  // * Remove stopord  - just to speed things up
  if (stopord) textForAnalysis = removeAllStopord(textForAnalysis);

  // ! Step 3 - Split into array of words and sort
  let textArray = splitStringToArray(textForAnalysis).sort();

  // * Remove duplicates  - just to speed things up
  textArray = Array.from(new Set(textArray));

  // ! Step 4 (Optional) -- Lemmafy array
  if (lemmafyText) textArray = lemmafy(textArray);

  // * Remove any duplicates & store the uniques that may have arisen from the lemmafication
  let uniqueWords = getUniqueWords(textArray);

  // ! Step 5 - Get & count all rare words
  // * Get & count all rare words (word that are not in the top [threshold])
  let rareWords = getRareWords(uniqueWords, threshold);

  // * Title case the words
  rareWords = rareWords.map((word) => titleCaseWord(word));
  uniqueWords = uniqueWords.map((word) => titleCaseWord(word));

  // ! Step 6 - Prepare returnJSON and close connection
  const returnJSON = {
    noOfRareWords: rareWords.length,
    rareWords: rareWords,
    noOfUniqueWords: uniqueWords.length,
    uniqueWords: uniqueWords,
  };

  console.log(returnJSON);
  res.json(returnJSON).end();

  // Time stamp
  const endTime = new Date();
  console.log("Vocab API :: Completed by the server at ...", endTime.toLocaleTimeString());
  console.log("The operation took ...", endTime - currentTime);
});

app.post("/api/lemma", function (req, res) {
  // Time stamp
  const currentTime = new Date();
  console.log("Lemma API :: Received by the server at ...", currentTime.toLocaleTimeString());

  // ! Step 1 -- Get input
  let textForAnalysis = req.body.text; // String of text
  const uniqueOnly = req.body.unique;
  const removeStopord = req.body.stopord;

  // ! Step 2 - Prepare text
  textForAnalysis = convertHTML(textForAnalysis);

  // * Optional - Remove 'stopord' from the text
  if (removeStopord) textForAnalysis = removeAllStopord(textForAnalysis);

  // ! Step 3 - Split into array of words
  let textArray = splitStringToArray(textForAnalysis);

  // * Optional - Remove duplicate words
  if (uniqueOnly) textArray = Array.from(new Set(textArray));

  // ! Reduce words to their lemmas where possible
  textArray = lemmafy(textArray);

  // ! Prepare return obj
  const returnJSON = { lemmas: textArray };

  res.json(returnJSON).end();

  // Time stamp
  const endTime = new Date();
  console.log("Lemma API :: Completed by the server at ...", endTime.toLocaleTimeString());
  console.log("The operation took ...", endTime - currentTime);
});

app.post("/api/sentence", function (req, res) {
  // * API that takes a string as input and returns ...
  // Send back both rhytm and difficulty

  let i;

  // Time stamp
  const currentTime = new Date();
  console.log("Sentence API :: Received by the server at ...", currentTime.toLocaleTimeString());

  // ! Step 1 -- Get input
  let textForAnalysis = req.body.text; // String of text
  const sentenceRhythm = req.body.rhytm || false;
  const sentenceDifficulty = req.body.difficulty;
  const textAnalysis = req.body.textanalysis;

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
    let findAndReplaceArray = [];

    if (textAnalysis) {
      findAndReplaceArray.splice(0, findAndReplaceArray.length);
      const analysisOutcome = analyzeText(specificSentence, dict, findAndReplaceArray); // dict via global scope
      specificSentence = analysisOutcome.text;
      red += analysisOutcome.red;
      yellow += analysisOutcome.yellow;
      blue += analysisOutcome.blue;
    }
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
    // Errors
    red: red,
    yellow: yellow,
    blue: blue,
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

// API.JS
const editorHedonometer = new EditorJS({
  /**
   * Id of Element that should contain the Editor
   */
  holder: "editor-hedonometer",
  onChange: () => {
    console.log("Editor (Hedonometer) is changing ...");
    editorHedonometer.save().then((data) => {
      // Collect preferences
      const removeStopord = document.getElementById("hedonometerStopord").checked;
      const lemmafyText = document.getElementById("hedonometerLemma").checked;
      const uniqueOnly = document.getElementById("hedonometerUnique").checked;

      localStorage.setItem("removeStopord-Hedo", document.getElementById("hedonometerStopord").checked);
      localStorage.setItem("lemmafyText-Hedo", document.getElementById("hedonometerLemma").checked);
      localStorage.setItem("uniqueOnly-Hedo", document.getElementById("hedonometerUnique").checked);

      // Collect all text into one string
      const blocks = data.blocks;
      let editorText = blocks.map((x) => x.data.text).join(". ");
      let editorObj = { text: editorText, unique: uniqueOnly, lemmafy: lemmafyText, stopord: removeStopord };

      postRequest(endpointHedonometer, editorObj).then((data) => {
        console.log("status", data.status);
        const score = data.happyScore;
        const words = data.happyWords;

        hedonometerUl.innerHTML = `<li class="list-group-item">
                <strong>Ord</strong> <span class="badge bg-primary">Score 1 til 9</span> <span>Stdafvigelse</span>
              </li>`;
        words.forEach(
          (element) =>
            (hedonometerUl.innerHTML += `<li class="list-group-item">
            <span>${convertValToEmoji(element[1])} ${element[0]}</span> -  <span class="badge bg-primary">${
              element[1]
            }</span> - <span>${element[2]}</span></li>`)
        );

        hedonometerScore.innerText = `Glædesbarometeret siger ${convertValToEmoji(score)} ${score}`;
      });
      // TODO Click modal to get PDF
    });
  },
});

const editorLemma = new EditorJS({
  /**
   * Id of Element that should contain the Editor
   */
  holder: "editor-lemma",
  onChange: () => {
    console.log("Editor (Lemma) is changing ...");
    editorHedonometer.save().then((data) => {
      // Collect preferences
      const removeStopord = document.getElementById("lemmaStopord").checked;
      const uniqueOnly = document.getElementById("lemmaUnique").checked;

      localStorage.setItem("removeStopord-Lemma", document.getElementById("lemmaStopord").checked);
      localStorage.setItem("uniqueOnly-Lemma", document.getElementById("lemmaUnique").checked);

      // Collect all text into one string
      const blocks = data.blocks;
      let editorText = blocks.map((x) => x.data.text).join(". ");
      let editorObj = { text: editorText, unique: uniqueOnly, stopord: removeStopord };

      postRequest(endpointLemma, editorObj).then((data) => {
        console.log("status", data.status);
        lemmaOutputArea.innerHTML = "";
        const lemmas = data.lemmas;

        words.forEach(
          (element) => (lemmaOutputArea.innerHTML += `<span class="badge bg-primary px-1 py-1">${element}</span>`)
        );
      });
    });
  },
});

//
// Popover
function initializePopovers() {
  var popoverTriggerList = [].slice.call(document.querySelectorAll('.editor [data-bs-toggle="popover"]'));
  var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl, {
      trigger: "hover focus",
      placement: "auto",
      container: "#editorjs",
      html: true,
    });
  });
}

setInterval(initializePopovers(), 5000);

//

// if (inputType === "object") {
//   returnText = [];

//   // Loop through object
//   for (let j = 0; j < input.length; j++) {
//     const block = input[j];
//     let blockText = block.data.text;
//     const counter = (blockText[j].match(/\.|\,|\?|!|:/g) || []).length;
//     const textLength = blockText.length - counter;
//     console.log("tl", textLength);
//     if (textLength > 6) {
//       blockText = `<span class='yellow'>${blockText}</span>`;
//       arrLongWords.push(blockText);
//     }
//     returnText[j] = blockText;
//   }

//   // If input instead is string
// } else if (inputType === "string") {
//   returnText = textForAnalysis.split(" "); // Split into words;

//   // Loop through all words
//   for (let i = 0; i < returnText.length; i++) {
//     // Count all punctuation
//     let counter = (returnText[i].match(/\.|\,|\?|!|:/g) || []).length;

//     let textLength = returnText.length - counter;
//     if (textLength > 6) {
//       returnText[i] = `<span class='yellow'>${returnText[i]}</span>`;
//     } else {
//       returnText[i] = returnText[i];
//     }
//   }

//   returnText = returnText.join(" ");
// }

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
