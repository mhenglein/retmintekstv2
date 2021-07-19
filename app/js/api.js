// TODO Remember assistant data for metrics
// TODO Accept both GET and POST

import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";

/** API/Metrics **/
const spinnerMetrics = document.getElementById("spinner-metrics");
const lix = document.getElementById("lix");
const difficulty = document.getElementById("difficulty");
const wlength = document.getElementById("wlength");
const slength = document.getElementById("slength");
const chars = document.getElementById("charnospaces");
const charsplus = document.getElementById("charspaces");
const words = document.getElementById("words");
const longwords = document.getElementById("longwords");
const sentences = document.getElementById("sentences");
const readingtime = document.getElementById("readingtime");
const speakingtime = document.getElementById("speakingtime");

const longWordsSection = document.getElementById("longWordsSection");
const btnLongWordsSort = document.getElementById("btnLongWordsSort");

btnLongWordsSort.addEventListener("click", function () {
  let arr = Array.from(String(localStorage.getItem("arrLongWords")).trim().split(","));
  arr = arr.sort();

  longWordsSection.innerHTML = arr
    .map((txt) => `<span class="badge bg-light text-dark me-1 ms-1">${txt}</span>`)
    .join(" ");
});

// Refresh button
const btnRefreshMetrics = document.getElementById("btnRefreshMetrics");

// Radio buttons & checkmark boxes
const rdoMetricsLongWords = document.getElementById("rdoMetricsLongWords");
const rdoMetricsNothing = document.getElementById("rdoMetricsNothing");
const rdoMetricsRepeatWords = document.getElementById("rdoMetricsRepeatWords");
const chkMetricsRemoveStopwords = document.getElementById("chkMetricsRemoveStopwords");
const metricsOptions = [rdoMetricsLongWords, rdoMetricsNothing, rdoMetricsRepeatWords, chkMetricsRemoveStopwords];

// Labels
const metricsLastUpdated = document.getElementById("metricsLastUpdated");
metricsLastUpdated.innerText = localStorage.getItem("metrics-lastupdated");

// Download from Local Storage
const editorMetricsData = JSON.parse(localStorage.getItem("editor-metrics"));
const editorMetricsHighlight = localStorage.getItem("editor-metrics-highlight");
const editorMetricsStopwords = localStorage.getItem("editor-metrics-stopwords");

// Set options based on LS
if (editorMetricsHighlight === "longwords") {
  rdoMetricsLongWords.checked = true;
} else if (editorMetricsHighlight === "repeatwords") {
  rdoMetricsRepeatWords.checked = true;
} else {
  rdoMetricsNothing.checked = true;
}

if (editorMetricsStopwords === "remove") {
  chkMetricsRemoveStopwords.checked = true;
} else {
  chkMetricsRemoveStopwords.checked = false;
}

/** End points **/
const endpoint = "http://localhost:3000/api";
const endpoinMetrics = `${endpoint}/metrics`;
const endpointHedonometer = `${endpoint}/hedonometer`;
const endpointSentence = `${endpoint}/sentence`;
const endpointVocab = `${endpoint}/vocab`;

// * Auxillary functions
/**
 * Send a POST request to my server with the input text to get a response back
 * (depending on the API)
 * @param  {[String]} url End point
 * @param  {[Object]} data Body
 */
async function postRequest(url, data) {
  try {
    console.log("Sending request ...");

    let response = await fetch(url, {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
      body: JSON.stringify(data),
    });

    console.log("Response status ...", response.statusText);
    response = handleErrors(response);
    return response.json();
  } catch (err) {
    console.error("Error in request", err);
    return data;
  }
}

function handleErrors(response) {
  if (!response.ok) {
    console.error("Response not OK");
    throw Error(response.statusText);
  }
  return response;
}

// Placeholders
function generatePlaceholder() {
  const placerholderArray = [
    "Jeg havde en Farm i Afrika ved floden af Bjerget Ngong ...",
    "Gud Herren, som kender Sine, gav hende et Liv i Lykke hos en god Husbond ...",
    "Vejen bøjede tilvenstre over en Bro og ind gennem Serritslev By ...",
    "Det var en mørk og stormfuld aften ...",
    "Det er Skade at Degnen ikke er i Byen, thi der er saa meget Latin i min Søns Brev, som jeg ikke forstaar",
    "Gud skjenke os Alle et glædeligt Nytaar! og bevare vor gode Hr. Søren! han slukkede Lyset iaftes, og Moder siger, han lever ikke til næste Nytaar; men det har vel intet at betyde",
    "Hvad er en Digter? Et ulykkeligt Menneske, der gjemmer dybe Qvaler i sit Hjerte, men hvis Læber ere dannede saaledes, at idet Sukket eller Skriget strømme ud over dem, lyde de som skjøn Musik",
    "Den Luft, der laa under Lindetræernes Kroner, havde vugget sig frem over den brune Hede og de tørstige Marker, den var blevet baget af Solen og støvet af Vejene, men nu var den renset af det tætte Løvhang, svalet de kjølige Lindeblade, og Duften af Lindens gule Bloster havde gjort den fugtig og givet den Fylde",
  ];
  return placerholderArray[Math.floor(Math.random() * placerholderArray.length)];
}

function dataChecker(input) {
  try {
    input = input.toString();
  } catch (err) {
    console.error("Input must be able to be coerced by the toString() method", err);
    return input;
  }

  if (input === undefined || typeof input === "undefined") {
    return "🤷‍♂️";
  } else {
    return input;
  }
}

/**
 * Map a value (number) to a corresponding emoji
 * @param  {[number]} score A scoring on a scale from 1-9
 */
function convertValToEmoji(score) {
  try {
    switch (true) {
      case score < 2:
        return "🤬";
      case score < 3:
        return "😡";
      case score < 4:
        return "😠";
      case score < 5:
        return "😐";
      case score < 6:
        return "🙂";
      case score < 7:
        return "😄";
      case score < 8:
        return "😁";
      case score < 9:
        return "🤩";
      default:
        return "🤷‍♂️";
    }
  } catch (err) {
    console.log(err);
    return "🤷‍♂️";
  }
}

function refreshEditor(editorJS) {
  // Refresh editor
  // TODO separate function that reupload to server
  editorJS.save().then((data) => {
    editorJS.render(data);
  });
}

/**
 * Takes as input an editorJS object and corrects punctuation (i.e. adding periods to sentences if they don't have one)
 * @param  {[Object]}   editorJsObject A full editorJS object
 * @param  {[Function]} applyFunction  A function to be applied on all text parts
 * @return {[Object]}                  Updated editorJS object
 */
function traverseEditorJS(editorJsObject, applyFunction, optArg = "") {
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
          specificBlock.data.items[item] = applyFunction(specificBlock.data.items[item]);
        }
        newBlocks[i] = specificBlock;
        break;

      case "paragraph":
        specificBlock.data.text = applyFunction(specificBlock.data.text);
        newBlocks[i] = specificBlock;
        break;

      case "header":
        specificBlock.data.text = applyFunction(specificBlock.data.text);
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
 * Adds a full stop to a string if it doesn't end with a typical punctuation mark
 * @param  {[String]} text Input string, possibly w/o a sentence stopper
 * @return {[String]}
 */
function addPeriodIfMissing(text) {
  const punctuation = [".", ":", ";", ":", "!", "?"];
  const rightMostCharacter = text.slice(text.length - 1, text.length);
  const testIfPunctuation = punctuation.some((el) => rightMostCharacter.includes(el));
  return !testIfPunctuation ? `${text}.` : text;
}

// *** EDITOR  *** //
/** API/Metrics */
const editorMetrics = new EditorJS({
  holder: "editor-metrics",
  tools: {
    header: Header,
    list: List,
  },
  onReady: () => {
    console.log("Editor.js (Metrics) is ready to work!");

    // Refresh button
    btnRefreshMetrics.addEventListener("click", function () {
      queryMetrics(editorMetrics);
    });

    // Checkbox & radios
    metricsOptions.forEach((option) => {
      option.addEventListener("click", function () {
        updateHighlightChoice();
        // refreshEditor(editorMetrics);
      });
    });
  },

  onChange: () => {
    console.log("Editor (Metrics) is changing ...");

    // refreshEditor
  },
  placeholder: generatePlaceholder(),
  data: editorMetricsData,
});

function updateHighlightChoice() {
  if (rdoMetricsLongWords.checked) {
    localStorage.setItem("editor-metrics-highlight", "longwords");
  } else if (rdoMetricsRepeatWords.checked) {
    localStorage.setItem("editor-metrics-highlight", "repeatwords");
  } else {
    localStorage.setItem("editor-metrics-highlight", "nothing");
  }

  if (chkMetricsRemoveStopwords.checked) {
    localStorage.setItem("editor-metrics-stopwords", "remove");
  } else {
    localStorage.setItem("editor-metrics-stopwords", "keep");
  }
}
function queryMetrics(editorJS) {
  editorJS.save().then((data) => {
    // Show spinner
    spinnerMetrics.hidden = false;

    // Back-up: Save whatever is in the editor to local storage
    localStorage.setItem("editor-metrics", JSON.stringify(data));

    // Traverse editor to make adjustments
    data = traverseEditorJS(data, addPeriodIfMissing);

    // Prepare request
    let highlightOption = localStorage.getItem("editor-metrics-highlight");
    let stopwordsOption = localStorage.getItem("editor-metrics-stopwords");

    const request = {
      input: data.blocks,
      options: {
        highlight: highlightOption,
        removeStopwords: stopwordsOption,
      },
    };

    // Send request
    postRequest(endpoinMetrics, request).then((data) => {
      // Time stamp
      const nowDate = new Date();
      const now = nowDate.toLocaleTimeString();
      metricsLastUpdated.innerText = now;
      localStorage.setItem("metrics-lastupdated", now);

      console.log("Response received ...", now);

      try {
        lix.innerText = dataChecker(data.lix);
        words.innerText = dataChecker(data.words);
        longwords.innerText = dataChecker(data.longWords);
        chars.innerText = dataChecker(data.charSpaces);
        charsplus.innerText = dataChecker(data.charNoSpaces);
        sentences.innerText = dataChecker(data.sentences);
        slength.innerText = dataChecker(data.slength);
        wlength.innerText = dataChecker(data.wlength);
        difficulty.innerText = dataChecker(data.difficulty);
        readingtime.innerText = dataChecker(data.readingtime);
        speakingtime.innerText = dataChecker(data.speakingtime);

        if (data.arrLongWords === [] || data.arrLongWords === undefined) {
          longWordsSection.innerHTML = "";
          localStorage.setItem("arrLongWords", []);
        } else {
          longWordsSection.innerHTML = data.arrLongWords
            .map((txt) => `<span class="badge bg-light text-dark me-1 ms-1">${txt}</span>`)
            .join(" ");
          localStorage.setItem("arrLongWords", arrLongWords);
        }

        spinnerMetrics.hidden = true;
      } catch (err) {
        // If something goes wrong, restart the editor
        console.error(err);
        // editorMetrics.render(data);
        spinnerMetrics.hidden = true;
      }
    });
  });
}

/** API/Hedonometer **/
const hedonometerList = document.getElementById("hedonometerList");
const spinnerHedonometer = document.getElementById("spinner-hedonometer");
const btnRefreshHedonometer = document.getElementById("btnRefreshHedonometer");

// Hedonometer - Options
const chkHedonometerStopord = document.getElementById("hedonometerStopord");
const chkHedonometerLemma = document.getElementById("hedonometerLemma");
const chkHedonometerUnique = document.getElementById("hedonometerUnique");

// Hedonometer - Labels
const hedonometerLastUpdated = document.getElementById("hedonometerLastUpdated");
hedonometerLastUpdated.innerText = localStorage.getItem("hedonometer-lastupdated");

// Hedonometer - Local Storage
const editorHedonometerData = JSON.parse(localStorage.getItem("editor-hedonometer"));

chkHedonometerStopord.checked = localStorage.getItem("editor-hedonometer-stopord") === "true";
chkHedonometerLemma.checked = localStorage.getItem("editor-hedonometer-lemma") === "true";
chkHedonometerUnique.checked = localStorage.getItem("editor-hedonometer-unique") === "true";

// ! Hedonometer
const editorHedonometer = new EditorJS({
  holder: "editor-hedonometer",
  tools: {
    header: Header,
    list: List,
  },
  onReady: () => {
    console.log("Editor.js (Hedonometer) is ready to work!");

    // Manual refresh button
    btnRefreshHedonometer.addEventListener("click", function () {
      queryHedonometer(editorHedonometer);
    });

    // Options
    chkHedonometerStopord.addEventListener("click", () => {
      localStorage.setItem("editor-hedonometer-stopord", chkHedonometerStopord.checked);
    });

    chkHedonometerLemma.addEventListener("click", () => {
      localStorage.setItem("editor-hedonometer-lemma", chkHedonometerLemma.checked);
    });

    chkHedonometerUnique.addEventListener("click", () => {
      localStorage.setItem("editor-hedonometer-unique", chkHedonometerUnique.checked);
    });
  },

  onChange: () => {
    console.log("Editor (Hedonometer) is changing ...");

    // refreshEditor
    //queryHedonometer(editorHedonometer)
  },
  placeholder: generatePlaceholder(),
  data: editorHedonometerData,
});

function queryHedonometer(editorJS) {
  editorJS.save().then((data) => {
    // Show spinner
    spinnerHedonometer.hidden = false;

    // Back-up: Save whatever is in the editor to local storage
    localStorage.setItem("editor-hedonometer", JSON.stringify(data));

    // Traverse editor to make adjustments
    data = traverseEditorJS(data, addPeriodIfMissing);

    // Prepare request
    const request = {
      input: data.blocks,
      options: {
        uniqueOnly: chkHedonometerUnique.checked,
        lemmafyAll: chkHedonometerLemma.checked,
        removeStopwords: chkHedonometerStopord.checked,
      },
    };

    // Send request
    postRequest(endpointHedonometer, request).then((data) => {
      // Time stamp
      const nowDate = new Date();
      const now = nowDate.toLocaleTimeString();

      hedonometerLastUpdated.innerText = now;
      localStorage.setItem("hedonometer-lastupdated", now);

      console.log("Response received ...", now);

      // Clear sidebar list
      hedonometerList.innerHTML = "";

      // Store response
      const happyScore = data.happyScore;
      const happyWords = data.happyWords;

      // Validation check?

      // Create heading
      const heading = `Overordnet: ${convertValToEmoji(happyScore)} ${happyScore} / 9`;

      // Add heading to sidebar
      hedonometerList.innerHTML += `<li class="list-group-item text-center active"><strong>${heading}</strong></li>`;

      // Loop through happy words
      happyWords.forEach((item) => {
        hedonometerList.innerHTML += `<li class="list-group-item">${convertValToEmoji(item[1])} ${item[0]} (${
          item[1]
        }) </li>`;
      });

      // Hide spinner
      spinnerHedonometer.hidden = true;
    });
  });
}

// ! Word vocab
/** API/Vocab **/
const spinnerVocab = document.getElementById("spinner-vocab");
const btnRefreshVocab = document.getElementById("btnRefreshVocab");
const vocabAllWords = document.getElementById("vocabAllWords");
const uniqueWords = document.getElementById("uniqueWords");
const rareWords = document.getElementById("rareWords");
const repeatWords = document.getElementById("repeatWords");

vocabAllWords.innerHTML = Number(localStorage.getItem("numAllWords"));
uniqueWords.innerHTML = Number(localStorage.getItem("numUniqueWords"));
rareWords.innerHTML = Number(localStorage.getItem("numRareWords"));
repeatWords.innerHTML = Number(localStorage.getItem("numRepeatWords"));

// Vocab - Options
const chkVocabStopord = document.getElementById("vocabStopord");
const chkVocabLemma = document.getElementById("vocabLemma");

// Vocab - Labels
const vocabLastUpdated = document.getElementById("vocabLastUpdated");
vocabLastUpdated.innerText = localStorage.getItem("vocab-lastupdated");

const uniqueWordsSection = document.getElementById("uniqueWordsSection");
const rareWordsSection = document.getElementById("rareWordsSection");
const repeatWordsSection = document.getElementById("repeatWordsSection");

// Vocab - Local storage
const editorVocabData = JSON.parse(localStorage.getItem("editor-vocab"));
const arrUniqueWords =
  localStorage.getItem("arrUniqueWords") == null
    ? []
    : Array.from(String(localStorage.getItem("arrUniqueWords")).trim().split(","));
const arrRareWords =
  localStorage.getItem("arrRareWords") == null
    ? []
    : Array.from(String(localStorage.getItem("arrRareWords")).trim().split(","));
const arrRepeatWords =
  localStorage.getItem("arrRepeatWords") == null
    ? []
    : Array.from(String(localStorage.getItem("arrRepeatWords")).trim().split(","));

arrUniqueWords.forEach((word) => {
  uniqueWordsSection.innerHTML += `<span class='badge bg-light text-dark me-2'>${word}</span>`;
});
arrRareWords.forEach((word) => {
  rareWordsSection.innerHTML += `<span class='badge bg-light text-dark me-2'>${word}</span>`;
});
arrRepeatWords.forEach((word) => {
  repeatWordsSection.innerHTML += `<span class='badge bg-light text-dark me-2'>${word}</span>`;
});

chkVocabStopord.checked = localStorage.getItem("editor-vocab-stopord") === "true";
chkVocabLemma.checked = localStorage.getItem("editor-vocab-lemma") === "true";

const editorVocab = new EditorJS({
  holder: "editor-vocab",
  tools: {
    header: Header,
    list: List,
  },
  onReady: () => {
    console.log("Editor.js (Vocab) is ready to work!");

    // Manual refresh button
    btnRefreshVocab.addEventListener("click", function () {
      queryVocab(editorVocab);
    });

    // Options
    chkVocabStopord.addEventListener("click", () => {
      localStorage.setItem("editor-vocab-stopord", chkVocabStopord.checked);
    });

    chkVocabLemma.addEventListener("click", () => {
      localStorage.setItem("editor-vocab-lemma", chkVocabLemma.checked);
    });
  },

  onChange: () => {
    console.log("Editor (Vocab) is changing ...");

    //query ...
  },
  placeholder: generatePlaceholder(),
  data: editorVocabData,
});

function queryVocab(editorJS) {
  editorJS.save().then((data) => {
    // Show spinner
    spinnerVocab.hidden = false;

    // Back-up: Save whatever is in the editor to local storage
    localStorage.setItem("editor-vocab", JSON.stringify(data));

    // Traverse editor to make adjustments
    data = traverseEditorJS(data, addPeriodIfMissing);

    const request = {
      input: data.blocks,
      options: {
        lemmafyAll: chkVocabLemma.checked,
        removeStopwords: chkVocabStopord.checked,
        threshold: 5000,
      },
    };

    // Send request
    postRequest(endpointVocab, request).then((data) => {
      // Time stamp
      const nowDate = new Date();
      const now = nowDate.toLocaleTimeString();

      vocabLastUpdated.innerText = now;
      localStorage.setItem("vocab-lastupdated", now);

      console.log("Response received ...", now);

      // Validation check?

      // Add numbers to sidebar
      vocabAllWords.innerText = dataChecker(data.numAllWords);
      uniqueWords.innerText = dataChecker(data.numUniqueWords);
      rareWords.innerText = dataChecker(data.numRareWords);
      repeatWords.innerText = dataChecker(data.numFrequentlyUsed);

      // Populate modals
      uniqueWordsSection.innerHTML = "";
      rareWordsSection.innerHTML = "";
      repeatWordsSection.innerHTML = "";

      data.uniqueWords.forEach((word) => {
        uniqueWordsSection.innerHTML += `<span class='badge bg-light text-dark me-2'>${word}</span>`;
      });

      data.rareWords.forEach((word) => {
        rareWordsSection.innerHTML += `<span class='badge bg-light text-dark me-2'>${word}</span>`;
      });

      data.frequentlyUsed.forEach((word) => {
        repeatWordsSection.innerHTML += `<span class='badge bg-light text-dark me-2'>${word}</span>`;
      });

      // TODO onclick highlight the words (vent på markeringsværktøj)

      // Store in local storage
      localStorage.setItem("numAllWords", data.numAllWords);
      localStorage.setItem("numUniqueWords", data.numUniqueWords);
      localStorage.setItem("numRareWords", data.numRareWords);
      localStorage.setItem("numRepeatWords", data.numFrequentlyUsed);
      localStorage.setItem("arrUniqueWords", data.uniqueWords);
      localStorage.setItem("arrRareWords", data.rareWords);
      localStorage.setItem("arrRepeatWords", data.repeatWords);

      // Hide spinner
      spinnerVocab.hidden = true;
    });
  });
}

// ! Sentence analyse
/** API/Sentence **/
const spinnerSentence = document.getElementById("spinner-sentence");
const btnRefreshSentence = document.getElementById("btnRefreshSentence");
const sentenceAllSentences = document.getElementById("sentenceAllSentences");

const sentencesEasy = document.getElementById("sentencesEasy");
const sentencesHard = document.getElementById("sentencesHard");
const sentencesVeryHard = document.getElementById("sentencesVeryHard");

const s1to3 = document.getElementById("s1to3");
const s4to6 = document.getElementById("s4to6");
const s7to10 = document.getElementById("s7to10");
const s11to18 = document.getElementById("s11to18");
const s19to26 = document.getElementById("s19to26");
const s26plus = document.getElementById("s26plus");

sentenceAllSentences.innerHTML = Number(localStorage.getItem("numAllSentences"));
sentencesEasy.innerHTML = Number(localStorage.getItem("sentencesEasy"));
sentencesHard.innerHTML = Number(localStorage.getItem("sentencesHard"));
sentencesVeryHard.innerHTML = Number(localStorage.getItem("sentencesVeryHard"));

s1to3.innerHTML = Number(localStorage.getItem("s1to3"));
s4to6.innerHTML = Number(localStorage.getItem("s4to6"));
s7to10.innerHTML = Number(localStorage.getItem("s7to10"));
s11to18.innerHTML = Number(localStorage.getItem("s11to18"));
s19to26.innerHTML = Number(localStorage.getItem("s19to26"));
s26plus.innerHTML = Number(localStorage.getItem("s26plus"));

// Sentence - Labels
const sentenceLastUpdated = document.getElementById("sentenceLastUpdated");
sentenceLastUpdated.innerText = localStorage.getItem("sentence-lastupdated");

// Vocab - Local storage
const editorSentenceData = JSON.parse(localStorage.getItem("editor-sentence"));

const editorSentence = new EditorJS({
  holder: "editor-sentence",
  tools: {
    header: Header,
    list: List,
  },
  onReady: () => {
    console.log("Editor.js (Sentence) is ready to work!");

    // Manual refresh button
    btnRefreshSentence.addEventListener("click", function () {
      querySentence(editorSentence);
    });
  },

  onChange: () => {
    console.log("Editor (Sentence) is changing ...");

    //query ...
  },
  placeholder: generatePlaceholder(),
  data: editorSentenceData,
});

function querySentence(editorJS) {
  editorJS.save().then((data) => {
    // Show spinner
    spinnerSentence.hidden = false;

    // Back-up: Save whatever is in the editor to local storage
    localStorage.setItem("editor-sentence", JSON.stringify(data));

    // Traverse editor to make adjustments
    data = traverseEditorJS(data, addPeriodIfMissing);

    const request = {
      input: data.blocks,
      options: { highlight: "difficulty" },
    };

    // Send request
    postRequest(endpointSentence, request).then((data) => {
      // Time stamp
      const nowDate = new Date();
      const now = nowDate.toLocaleTimeString();

      sentenceLastUpdated.innerText = now;
      localStorage.setItem("sentence-lastupdated", now);

      console.log("Response received ...", now);

      // Validation check?

      // Add numbers to sidebar
      sentenceAllSentences.innerText = dataChecker(data.all);

      sentencesEasy.innerText = dataChecker(data.easy);
      sentencesHard.innerText = dataChecker(data.hard);
      sentencesVeryHard.innerText = dataChecker(data.veryhard);

      s1to3.innerText = dataChecker(data.s1to3);
      s4to6.innerText = dataChecker(data.s4to6);
      s7to10.innerText = dataChecker(data.s7to10);
      s11to18.innerText = dataChecker(data.s11to18);
      s19to26.innerText = dataChecker(data.s19to26);
      s26plus.innerText = dataChecker(data.s26plus);

      // Store in local storage
      localStorage.setItem("numAllSentences", data.all);
      localStorage.setItem("sentencesEasy", data.easy);
      localStorage.setItem("sentencesHard", data.hard);
      localStorage.setItem("sentencesVeryHard", data.veryhard);

      localStorage.setItem("s1to3", data.s1to3);
      localStorage.setItem("s4to6", data.s4to6);
      localStorage.setItem("s7to10", data.s7to10);
      localStorage.setItem("s11to18", data.s11to18);
      localStorage.setItem("s19to26", data.s19to26);
      localStorage.setItem("s26plus", data.s26plus);

      // Hide spinner
      spinnerSentence.hidden = true;
    });
  });
}
