// TODO Remember assistant data
// TODO Accept both GET and POST

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

/** End points **/
const endpoint = "http://localhost:3000/api";
const endpoinMetrics = `${endpoint}/metrics`;
const endpointHedonometer = `${endpoint}/hedonometer`;
const endpointLemma = `${endpoint}/lemma`;

btnLongWordsSort.addEventListener("click", function () {
  let arr = Array.from(String(localStorage.getItem("arrLongWords")).trim().split(","));
  arr = arr.sort();

  longWordsSection.innerHTML = arr
    .map((txt) => `<span class="badge bg-light text-dark me-1 ms-1">${txt}</span>`)
    .join(" ");
});

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

// *** EDITOR  *** //
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";

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

      console.log("data", data);

      // TODO Error handling - what if undefined etc.
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

// ! Hedonometer
const editorHedonometer = new EditorJS({
  holder: "editor-hedonometer",
  tools: {
    header: Header,
    list: List,
  },
  onReady: () => {
    console.log("Editor.js (Hedonometer) is ready to work!");

    // Refresh button
    btnRefreshHedonometer.addEventListener("click", function () {
      queryHedonometer(editorHedonometer);
    });

    // Checkbox & radios
    // metricsOptions.forEach((option) => {
    //   option.addEventListener("click", function () {
    //     updateHighlightChoice();
    //     // refreshEditor(editorMetrics);
    //   });
    // });
  },

  onChange: () => {
    console.log("Editor (Hedonometer) is changing ...");

    // refreshEditor
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
    // let highlightOption = localStorage.getItem("editor-metrics-highlight");
    // let stopwordsOption = localStorage.getItem("editor-metrics-stopwords");

    const request = {
      input: data.blocks,
      options: {
        uniqueOnly: false,
        lemmafyAll: false,
        removeStopwords: true,
      },
    };

    // Send request
    postRequest(endpointHedonometer, request).then((data) => {
      // Time stamp
      const nowDate = new Date();
      const now = nowDate.toLocaleTimeString();
      hedonometerLastUpdated.innerText = now;
      localStorage.setItem("metrics-lastupdated", now);

      console.log("Response received ...", now);
      // Loop through response and add to list -- remember mechanism to clear the list group.
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

// * Auxillary functions
function dataChecker(input) {
  input = input.toString();

  if (input === undefined || typeof input === "undefined") {
    return "🤷‍♂️";
  } else {
    return input;
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

//

/** API/Hedonometer **/
const hedonometerList = document.getElementById("hedonometerList");
const spinnerHedonometer = document.getElementById("spinner-hedonometer");

// Hedonometer - Options
const chkHedonometerStopord = document.getElementById("hedonometerStopord");
const chkHedonometerLemma = document.getElementById("hedonometerLemma");
const chkHedonometerUnique = document.getElementById("hedonometerUnique");

// Hedonometer - Labels
const hedonometerLastUpdated = document.getElementById("hedonometerLastUpdated");
hedonometerLastUpdated.innerText = localStorage.getItem("hedonometer-lastupdated");

// Hedonometer - Local Storage
const editorHedonometerData = JSON.parse(localStorage.getItem("editor-hedonometer"));
chkHedonometerStopord.checked = localStorage.getItem("editor-hedonometer-stopord");
chkHedonometerLemma.checked = localStorage.getItem("editor-hedonometer-lemma");
chkHedonometerUnique.checked = localStorage.getItem("editor-hedonometer-unique");

/** API/Lemma **/
const lemmaOutputArea = document.getElementById("lemmaOutput");
document.getElementById("lemmaStopord").checked = localStorage.getItem("removeStopord-Lemma");
document.getElementById("lemmaUnique").checked = localStorage.getItem("uniqueOnly-Lemma");
