// TODO Dark mode
// TODO Write/Edit switch
// TODO Modals el. lign hvori den præcise nedbrydning af fx "rød fejl" ses ("Stavefejl, etc.")
// TODO "Set goals": Audience (Brug længere/kortere ord...), Formality (Minus slang / plus formel)
// TODO Standard deviation

// *** EDITOR *** //
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";

// Window onload
window.onload = function () {
  // Get DOM elements
  const totalErr = document.getElementById("totalErr");

  const korrekthed = document.getElementById("korrekthed");
  const originalitet = document.getElementById("originalitet");
  const klarhed = document.getElementById("klarhed");
  const udtryk = document.getElementById("udtryk");

  const unique = document.getElementById("unique");
  const rare = document.getElementById("rare");
  const frequent = document.getElementById("frequent");

  const uniqueWordsList = document.getElementById("uniqueWordsList");

  const lix = document.getElementById("lix");
  const difficulty = document.getElementById("difficulty");
  const audience = document.getElementById("audience");
  const longwords = document.getElementById("longwords");
  const easy = document.getElementById("easy");
  const hard = document.getElementById("hard");
  const veryhard = document.getElementById("veryhard");
  const wordLength = document.getElementById("wordLength");
  const sentenceLength = document.getElementById("sentenceLength");

  const sentenceLength2 = document.getElementById("sentenceLength2");
  const variance = document.getElementById("variance");
  const s1to3 = document.getElementById("s1to3");
  const s4to6 = document.getElementById("s4to6");
  const s7to10 = document.getElementById("s7to10");
  const s11to18 = document.getElementById("s11to18");
  const s19to26 = document.getElementById("s19to26");
  const s26plus = document.getElementById("s26plus");

  const hedonometer = document.getElementById("hedonometer");

  const paragraphs = document.getElementById("paragraphs");
  const normalsider = document.getElementById("normalsider");
  const sentences = document.getElementById("sentences");
  const words = document.getElementById("words");
  const chars = document.getElementById("chars");
  const charsplus = document.getElementById("charsplus");
  const readingtime = document.getElementById("readingtime");
  const speakingtime = document.getElementById("speakingtime");

  // Sidebars
  const btnCollapseSidebar = document.querySelector("#sidebarCollapse");
  const btnShowSidebar = document.querySelector("#showSidebar");
  const sectionSidebar = document.querySelector("#sidebar");
  const sectionContent = document.querySelector("#content");
  const bottomMenu = document.querySelector("#bottom-menu");

  btnCollapseSidebar.addEventListener("click", function () {
    sectionSidebar.classList.toggle("mobile");
    sectionContent.classList.toggle("mobile");
    bottomMenu.classList.toggle("mobile");
    btnShowSidebar.classList.toggle("mobile");
  });

  btnShowSidebar.addEventListener("click", function () {
    sectionSidebar.classList.toggle("mobile");
    sectionContent.classList.toggle("mobile");
    bottomMenu.classList.toggle("mobile");
    btnShowSidebar.classList.toggle("mobile");
  });

  $(document).ready(function () {
    $("#sidebar").mCustomScrollbar({
      theme: "minimal",
    });
  });

  // Bottom menu
  const btnSuggestions = document.getElementById("btnSuggestions");
  const btnVocab = document.getElementById("btnVocab");
  const btnReadability = document.getElementById("btnReadability");
  const btnTextrhythm = document.getElementById("btnTextrhythm");
  const btnSentiment = document.getElementById("btnSentiment");
  const btnRemove = document.getElementById("btnRemove");

  // Update sidebar
  const analyzeSpinner = document.getElementById("spinner");

  // LOCAL STORAGE
  function getFromStorage(identifier) {
    try {
      return String(localStorage.getItem(identifier));
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  function updateLocalStorage(identifier, value) {
    if (identifier === "" || identifier == null) {
      console.log("Failed to update local storage value", identifier);
    }

    try {
      localStorage.setItem(identifier, value);
    } catch (err) {
      console.log(err);
    }
  }

  totalErr.innerText =
    Number(getFromStorage("korrekthed")) +
    Number(getFromStorage("originalitet")) +
    Number(getFromStorage("klarhed")) +
    Number(getFromStorage("udtryk"));

  korrekthed.innerText = Number(getFromStorage("korrekthed"));
  originalitet.innerText = Number(getFromStorage("originalitet"));
  klarhed.innerText = Number(getFromStorage("klarhed"));
  udtryk.innerText = Number(getFromStorage("udtryk"));

  unique.innerText = Number(getFromStorage("unique"));
  rare.innerText = Number(getFromStorage("rare"));
  frequent.innerText = Number(getFromStorage("frequent"));

  easy.innerText = Number(getFromStorage("easy"));
  hard.innerText = Number(getFromStorage("hard"));
  veryhard.innerText = Number(getFromStorage("veryhard"));

  lix.innerText = Number(getFromStorage("lix"));
  difficulty.innerText = String(getFromStorage("difficulty"));
  audience.innerText = String(getFromStorage("audience"));
  longwords.innerText = Number(getFromStorage("longwords"));
  wordLength.innerText = Number(getFromStorage("wordLength"));
  sentenceLength.innerText = Number(getFromStorage("sentenceLength"));

  sentenceLength2.innerText = Number(getFromStorage("sentenceLength"));
  variance.innerText = Number(getFromStorage("variance"));
  s1to3.innerText = Number(getFromStorage("s1to3"));
  s4to6.innerText = Number(getFromStorage("s4to6"));
  s7to10.innerText = Number(getFromStorage("s7to10"));
  s11to18.innerText = Number(getFromStorage("s11to18"));
  s19to26.innerText = Number(getFromStorage("s19to26"));
  s26plus.innerText = Number(getFromStorage("s26plus"));

  hedonometer.innerText = String(getFromStorage("hedonometer"));

  paragraphs.innerText = Number(getFromStorage("paragraphs"));
  normalsider.innerText = Number(getFromStorage("normalsider"));
  sentences.innerText = Number(getFromStorage("sentences"));
  words.innerText = Number(getFromStorage("words"));
  chars.innerText = Number(getFromStorage("chars"));
  charsplus.innerText = Number(getFromStorage("charsplus"));
  readingtime.innerText = String(getFromStorage("readingtime"));
  speakingtime.innerText = String(getFromStorage("speakingtime"));

  // Retrieve data from storage
  const editorData = JSON.parse(localStorage.getItem("editor"));

  const editor = new EditorJS({
    holder: "editorjs",
    tools: {
      header: {
        class: Header,
        inlineToolbar: ["link"],
      },
      list: {
        class: List,
        inlineToolbar: true,
      },
    },

    onReady: () => {
      console.log("Editor.js is ready to work!");

      // * Allow buttons

      // * Bottom menu
      btnReadability.addEventListener("click", () => {
        // Long word or difficults sentences? Option to be made

        const getEditorText = JSON.parse(getFromStorage("highlightedText_longwords"));
        console.log("readability", getEditorText);
        editor.render(getEditorText);
      });

      btnRemove.addEventListener("click", () => {
        editor.save().then((saved) => {
          for (let i = 0; i < saved.blocks.length; i++) {
            saved.blocks[i].data.text = removeHTML(saved.blocks[i].data.text);
          }
          localStorage.setItem("editor", saved);
          editor.render(saved);
        });
        resetSidebar();
      });

      // * Top menu
      // Analyze Text btn
      const analyzeBtn = document.getElementById("analyzeBtn");
      analyzeBtn.addEventListener("click", function () {
        // API Calls
        analyzeSpinner.hidden = false;
        sendRequests();
      });

      // Remove markup button
      const removeMarkupBtn = document.getElementById("removeMarkupBtn");
      removeMarkupBtn.addEventListener("click", function () {
        editor.save().then((saved) => {
          for (let i = 0; i < saved.blocks.length; i++) {
            saved.blocks[i].data.text = removeHTML(saved.blocks[i].data.text);
          }
          localStorage.setItem("editor", saved);
          editor.render(saved);
        });
        resetSidebar();
      });
    },

    onChange: () => {
      editor.save().then((data) => {
        localStorage.setItem("editor", JSON.stringify(data));
      });
    },

    autofocus: false,

    placeholder: generatePlaceholder(),
    data: editorData,
  });

  async function sendRequests() {
    editor.save().then((saved) => {
      if (saved.blocks.length > 0 && saved.blocks[0] !== "") {
        // Save EditorJS to Local Storage
        localStorage.setItem("editor", JSON.stringify(saved));

        const path = "http://localhost:3000";
        const endpointMetrics = `${path}/api/metrics`;
        const endpointVocab = `${path}/api/vocab`;
        const endpointHedonometer = `${path}/api/hedonometer`;
        const endpointSentence = `${path}/api/sentence`;

        // PReference - which highlighting method?

        // Request 1 :: Metrics
        const requestMetrics = {
          input: saved,
          options: {
            highlight: false,
            removeStopwords: false,
          },
        };
        postRequest(endpointMetrics, requestMetrics).then((data) => {
          // Fill in DOM
          words.innerText = dataChecker(data.words);
          longwords.innerText = dataChecker(data.longWords);
          chars.innerText = dataChecker(data.charNoSpaces);
          charsplus.innerText = dataChecker(data.charSpaces);
          sentences.innerText = dataChecker(data.sentences);
          sentenceLength.innerText = dataChecker(data.slength);
          sentenceLength2.innerText = dataChecker(data.slength);
          wordLength.innerText = dataChecker(data.wlength);
          variance.innerText = dataChecker(data.variance);
          lix.innerText = dataChecker(data.lix);
          difficulty.innerText = dataChecker(data.difficulty);
          audience.innerText = dataChecker(data.audience);
          readingtime.innerText = dataChecker(data.readingtime);
          speakingtime.innerText = dataChecker(data.speakingtime);
          paragraphs.innerText = dataChecker(data.paragraphs);
          normalsider.innerText = dataChecker(data.normalsider);

          // Update Local Storage
          updateLocalStorage("words", data.words);
          updateLocalStorage("longWords", data.longWords);
          updateLocalStorage("chars", data.charNoSpaces);
          updateLocalStorage("charsplus", data.charSpaces);
          updateLocalStorage("sentences", data.sentences);
          updateLocalStorage("sentenceLength", data.slength);
          updateLocalStorage("wordLength", data.wlength);
          updateLocalStorage("variance", data.variance);
          updateLocalStorage("lix", data.lix);
          updateLocalStorage("difficulty", data.difficulty);
          updateLocalStorage("audience", data.audience);
          updateLocalStorage("readingtime", data.readingtime);
          updateLocalStorage("speakingtime", data.speakingtime);
          updateLocalStorage("paragraphs", data.paragraphs);
          updateLocalStorage("normalsider", data.normalsider);

          // Calc
          const longWordPercentage = Math.floor((Number(data.longWords) / Number(data.words)) * 100);

          // Save formatted TEXT to Local Storage (w/ long words highlighted? Or nothing for this call)

          updateLocalStorage("highlightedText_longwords", JSON.stringify(data.outputText));

          // Need more than 1 type of long word.
        });

        // Request 2 :: Vocab
        const requestVocab = {
          input: saved,
          options: {
            threshold: 5000,
            lemmafyAll: false,
            removeStopwords: false,
          },
        };
        postRequest(endpointVocab, requestVocab).then((data) => {
          // Fill in DOM
          unique.innerText = dataChecker(data.numUniqueWords);
          rare.innerText = dataChecker(data.numRareWords);
          frequent.innerText = dataChecker(data.numFrequentlyUsed);

          // Update modals
          const frequentlyUsedWords = data.frequentlyUsed;

          unique.innerHTML = "";
          data.uniqueWords.forEach((word) => {
            uniqueWordsList.innerHTML += `<span class='badge text-dark stat mx-2'>${word}</span>`;
          });

          const rareWords = data.rareWords;

          // frequentlyUsedWords.forEach();

          // Update storage
          updateLocalStorage("unique", data.numUniqueWords);
          updateLocalStorage("rare", data.numRareWords);
          updateLocalStorage("frequent", data.numFrequentlyUsed);

          updateLocalStorage("uniqueWords", data.uniqueWords);
          updateLocalStorage("rareWords", data.rareWords);
          updateLocalStorage("frequentWords", data.frequentlyUsed);

          // Calc
          const uniquePercentage = Number(data.numUniqueWords) / Number(data.numAllWords);
          const rarePercentage = Number(data.numRareWords) / Number(data.numAllWords);

          // Saved formatted TEXT to Local Storage (w/ frequent words highlighted)
          // TODO
        });

        // Request 3 :: Sentence analysis
        const requestSentence = {
          input: saved,
          options: {
            highlight: "difficulty",
          },
        };
        postRequest(endpointSentence, requestSentence).then((data) => {
          // Fill in DOM
          easy.innerText = dataChecker(data.easy);
          hard.innerText = dataChecker(data.hard);
          veryhard.innerText = dataChecker(data.veryhard);

          s1to3.innerText = dataChecker(data.s1to3);
          s4to6.innerText = dataChecker(data.s4to6);
          s7to10.innerText = dataChecker(data.s7to10);
          s11to18.innerText = dataChecker(data.s11to18);
          s19to26.innerText = dataChecker(data.s19to26);
          s26plus.innerText = dataChecker(data.s26plus);

          // Update storage
          updateLocalStorage("easy", data.easy);
          updateLocalStorage("hard", data.hard);
          updateLocalStorage("veryhard", data.veryhard);

          updateLocalStorage("s1to3", data.s1to3);
          updateLocalStorage("s4to6", data.s4to6);
          updateLocalStorage("s7to10", data.s7to10);
          updateLocalStorage("s11to18", data.s11to18);
          updateLocalStorage("s19to26", data.s19to26);
          updateLocalStorage("s26plus", data.s26plus);

          // TODO Generate chart.js -> Modals

          // Generate formatted TEXT for Local Storage (w/ diff sentence and rhythm - but hmmm depends on preference chosen earlier)

          analyzeSpinner.hidden = true;
        });

        // Request 4 :: Hedonometer
        const requestSentiment = {
          input: saved,
          options: {
            lemmafyAll: false,
            uniqueOnly: false,
          },
        };

        postRequest(endpointHedonometer, requestSentiment).then((data) => {
          const happinessScore = String(`${dataChecker(data.emoji)} - ${dataChecker(data.happyScore)}/9`);

          // Fill in DOM
          hedonometer.innerText = happinessScore;

          // Store in Local Storage
          updateLocalStorage("hedonometer", happinessScore);

          // TODO Modals, scoring, emojis etc.

          // Formatted text somehow? With span.emoji::after { content: ":)";}
        });

        // Request 5 :: Corrections
        // TODO -- Skip the <b> Stuff for now. Also remove headers and lists.

        // Save ALL to Local Storage -- possible with separate function ...

        // Render new EDITOR
        // const newEditor = data.editorJSON; // Get editor data
        //   editor.blocks.render(newEditor); // Render new editor
      }
      // Initialize popovers
      // TODO wtf is this
      editor.isReady.then(() => {
        setTimeout(() => {
          initializePopovers();
        }, 2000);
      });
    });
  }
};

/**
 * Send a POST request to my server with the input text to get a response back
 * (depending on the API)
 * @param  {[String]} url End point
 * @param  {[Object]} data Body
 */
async function postRequest(url, data) {
  function handleErrors(response) {
    if (!response.ok) {
      console.error("Response not OK");
      throw Error(response.statusText);
    }
    return response;
  }

  try {
    console.log("Sending request ...", url);

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

    console.log("Response status ...", response.statusText, url);
    response = handleErrors(response);
    return response.json();
  } catch (err) {
    console.error("Error in request", err);
    return data;
  }
}

// * Auxilliary functions
// Placeholders
function generatePlaceholder() {
  const placerholderArray = [
    "Jeg havde en Farm i Afrika ved floden af Bjerget Ngong ...", // Karen Blixen - Den afrikanske farm
    "Gud Herren, som kender Sine, gav hende et Liv i Lykke hos en god Husbond ...", // Herman Bang - Ved Bejen
    "Vejen bøjede tilvenstre over en Bro og ind gennem Serritslev By ...", // Johannes V Jensen - Kongens Fald
    "Det var en mørk og stormfuld aften ...", // The Julekalender
    "Det er Skade at Degnen ikke er i Byen, thi der er saa meget Latin i min Søns Brev, som jeg ikke forstaar", // Ludvid Holberg - Erasmus Montanus
    "Gud skjenke os Alle et glædeligt Nytaar! og bevare vor gode Hr. Søren! han slukkede Lyset iaftes, og Moder siger, han lever ikke til næste Nytaar; men det har vel intet at betyde", // St St Blicher - Brudstykker af en Landsbydegns Dagbog
    "Hvad er en Digter? Et ulykkeligt Menneske, der gjemmer dybe Qvaler i sit Hjerte, men hvis Læber ere dannede saaledes, at idet Sukket eller Skriget strømme ud over dem, lyde de som skjøn Musik", // Kierkegaard
    "Den Luft, der laa under Lindetræernes Kroner, havde vugget sig frem over den brune Hede og de tørstige Marker, den var blevet baget af Solen og støvet af Vejene, men nu var den renset af det tætte Løvhang, svalet de kjølige Lindeblade, og Duften af Lindens gule Blomster havde gjort den fugtig og givet den Fylde", // JP Jacobsen - Fru Marie Grubbe
  ];
  return placerholderArray[Math.floor(Math.random() * placerholderArray.length)];
}

function resetSidebar() {
  totalErr.innerText = "🤷‍♂️";
  korrekthed.innerText = "🤷‍♂️";
  originalitet.innerText = "🤷‍♂️";
  klarhed.innerText = "🤷‍♂️";
  udtryk.innerText = "🤷‍♂️";

  unique.innerText = "🤷‍♂️";
  rare.innerText = "🤷‍♂️";
  frequent.innerText = "🤷‍♂️";

  lix.innerText = "🤷‍♂️";
  difficulty.innerText = "🤷‍♂️";
  audience.innerText = "🤷‍♂️";
  longwords.innerText = "🤷‍♂️";
  easy.innerText = "🤷‍♂️";
  hard.innerText = "🤷‍♂️";
  veryhard.innerText = "🤷‍♂️";
  wordLength.innerText = "🤷‍♂️";
  sentenceLength.innerText = "🤷‍♂️";

  sentenceLength2.innerText = "🤷‍♂️";
  variance.innerText = "🤷‍♂️";
  s1to3.innerText = "🤷‍♂️";
  s4to6.innerText = "🤷‍♂️";
  s7to10.innerText = "🤷‍♂️";
  s11to18.innerText = "🤷‍♂️";
  s19to26.innerText = "🤷‍♂️";
  s26plus.innerText = "🤷‍♂️";

  hedonometer.innerText = "🤷‍♂️";

  paragraphs.innerText = "🤷‍♂️";
  normalsider.innerText = "🤷‍♂️";
  sentences.innerText = "🤷‍♂️";
  words.innerText = "🤷‍♂️";
  chars.innerText = "🤷‍♂️";
  charsplus.innerText = "🤷‍♂️";
  readingtime.innerText = "🤷‍♂️";
  speakingtime.innerText = "🤷‍♂️";
}

function removeEmptyBlocks() {
  editor.save().then((savedData) => {
    for (let i = 0; i < savedData.blocks.length; i++) {
      if (savedData[i].data.text === "") {
        savedData.blocks.delete[i];
      }
    }
    editor.render(savedData);
  });
}

function removeHTML(text) {
  return text.replace(/<[^>]*(>|$)|&nbsp;|&zwnj;|&raquo;|&laquo;|&gt;/gi, " ");
}

function dataChecker(input) {
  try {
    input = input.toString();
  } catch (err) {
    console.error("Input must be able to be coerced by the toString() method", err);
    return input;
  }

  if (input === undefined || typeof input === "undefined" || input === "undefined") {
    return "🤷‍♂️";
  } else {
    return input;
  }
}

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
