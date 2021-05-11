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
  // Get elements
  const totalErr = document.getElementById("totalErr");

  const korrekthed = document.getElementById("korrekthed");
  const originalitet = document.getElementById("originalitet");
  const klarhed = document.getElementById("klarhed");
  const udtryk = document.getElementById("udtryk");

  const unique = document.getElementById("unique");
  const rare = document.getElementById("rare");
  const frequent = document.getElementById("frequent");

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
  const toggleBtn = document.querySelector("#sidebarCollapse");
  const showSidebar = document.querySelector("#showSidebar");
  const sidebar = document.querySelector("#sidebar");
  const content = document.querySelector("#content");
  const bottomMenu = document.querySelector(".bottom-menu");

  toggleBtn.addEventListener("click", function () {
    sidebar.classList.toggle("mobile");
    content.classList.toggle("mobile");
    showSidebar.hidden = !showSidebar.hidden;
    bottomMenu.classList.toggle("full-view");
  });

  showSidebar.addEventListener("click", function () {
    sidebar.classList.toggle("mobile");
    content.classList.toggle("mobile");
    showSidebar.hidden = !showSidebar.hidden;
    bottomMenu.classList.toggle("full-view");
  });

  $(document).ready(function () {
    $("#sidebar").mCustomScrollbar({
      theme: "minimal",
    });
  });

  // Download from Local Storage
  const assistantData = JSON.parse(localStorage.getItem("assistant"));

  // Update sidebar
  totalErr.innerText =
    assistantData.korrekthed + assistantData.originalitet + assistantData.klarhed + assistantData.udtryk;
  korrekthed.innerText = assistantData.korrekthed;
  originalitet.innerText = assistantData.originalitet;
  klarhed.innerText = assistantData.klarhed;
  udtryk.innerText = assistantData.udtryk;

  unique.innerText = assistantData.unique;
  rare.innerText = assistantData.rare;
  frequent.innerText = assistantData.frequent;

  easy.innerText = assistantData.easy;
  hard.innerText = assistantData.hard;
  veryhard.innerText = assistantData.veryhard;

  lix.innerText = assistantData.lix;
  difficulty.innerText = assistantData.difficulty;
  audience.innerText = assistantData.audience;
  longwords.innerText = assistantData.longwords;
  easy.innerText = assistantData.easy;
  hard.innerText = assistantData.hard;
  veryhard.innerText = assistantData.veryhard;
  wordLength.innerText = assistantData.wordLength;
  sentenceLength.innerText = assistantData.sentenceLength;

  sentenceLength2.innerText = assistantData.sentenceLength;
  variance.innerText = assistantData.variance;
  s1to3.innerText = assistantData.s1to3;
  s4to6.innerText = assistantData.s4to6;
  s7to10.innerText = assistantData.s7to10;
  s11to18.innerText = assistantData.s11to18;
  s19to26.innerText = assistantData.s19to26;
  s26plus.innerText = assistantData.s26plus;

  hedonometer.innerText = assistantData.hedonometer;

  paragraphs.innerText = assistantData.paragraphs;
  normalsider.innerText = assistantData.normalsider;
  sentences.innerText = assistantData.sentences;
  words.innerText = assistantData.words;
  chars.innerText = assistantData.chars;
  charsplus.innerText = assistantData.charsplus;
  readingtime.innerText = assistantData.readingtime;
  speakingtime.innerText = assistantData.speakingtime;

  lix.innerText = assistantData.lix;
  difficulty.innerText = assistantData.difficulty;
  unique.innerText = assistantData.unique;
  rare.innerText = assistantData.rare;
  wlength.innerText = assistantData.wlength;
  slength.innerText = assistantData.slength;
  chars.innerText = assistantData.chars;
  charsplus.innerText = assistantData.charsplus;
  words.innerText = assistantData.words;
  sentences.innerText = assistantData.sentences;
  readingtime.innerText = assistantData.readingtime;
  speakingtime.innerText = assistantData.speakingtime;

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

      // Analyze Text btn
      const analyzeBtn = document.getElementById("analyzeBtn");
      analyzeBtn.addEventListener("click", function () {
        // API Calls
        sendRequests();
      });

      // Clean all button
      const cleanBtn = document.getElementById("cleanBtn");
      cleanBtn.addEventListener("click", function () {
        if (confirm("Er du sikker?")) {
          editor.save().then((saved) => {
            localStorage.setItem("editor-backup", JSON.stringify(saved)); // Allows a backup in case the user clicked by mistake
            editor.clear();
            resetSidebar();
          });
        }
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
      // Save EditorJS to Local Storage
      localStorage.setItem("editor", JSON.stringify(data));

      const path = "http://localhost:3000";
      const endpointMetrics = `${path}/api/metrics`;
      const endpointVocab = `${path}/api/vocab`;
      const endpointHedonometer = `${path}/api/hedonometer`;
      const endpointSentence = `${path}/api/sentence`;

      // PReference - which highlighting method?

      // Request 1 :: Metrics
      postRequest(endpointMetrics, saved).then((data) => {
        // Fill in
        words.innerText = dataChecker(data.words);
        longwords.innerText = dataChecker(data.longWords);
        chars.innerText = dataChecker(data.chars);
        charsplus.innerText = dataChecker(data.charsAndSpaces);
        sentences.innerText = dataChecker(data.sentences);
        sentenceLength.innerText = dataChecker(data.slength);
        sentenceLength2.innerText = dataChecker(data.slength);
        wordLength.innerText = dataChecker(data.wlength);
        variance.innerText = dataChecker(data.variance);
        lix.innerText = dataChecker(data.lix);
        difficulty.innerText = dataChecker(data.difficulty);
        // TODO audience;
        readingtime.innerText = dataChecker(data.readingtime);
        speakingtime.innerText = dataChecker(data.speakingtime);
        paragraphs.innerText = dataChecker(data.paragraphs);
        // TODO normalsider

        // Calc
        const longWordPercentage = Math.floor((Number(data.longWords) / Number(data.words)) * 100);

        // Save formatted TEXT to Local Storage (w/ long words highlighted? Or nothing for this call)
      });

      // Request 2 :: Vocab
      postRequest(endpointVocab, saved).then((data) => {
        // Fill in sidebar
        unique.innerText = data.numUniqueWords;
        rare.innerText = data.numRareWords;
        frequent.innerText = data.numFrequentlyUsed;

        // Calc
        const uniquePercentage = Number(data.numUniqueWords) / Number(data.numAllWords);
        const rarePercentage = Number(data.numRareWords) / Number(data.numAllWords);

        // Update modals
        // TODO

        // Saved formatted TEXT to Local Storage (w/ frequent words highlighted)
        // TODO
      });

      // Request 3 :: Sentence analysis
      postRequest(endpointSentence, saved).then((data) => {
        // Fill in sidebar
        easy.innerText = dataChecker(data.easy);
        hard.innerText = dataChecker(data.hard);
        veryhard.innerText = dataChecker(data.veryhard);

        s1to3.innerText = dataChecker(data.s1to3);
        s4to6.innerText = dataChecker(data.s4to6);
        s7to10.innerText = dataChecker(data.s7to10);
        s11to18.innerText = dataChecker(data.s11to18);
        s19to26.innerText = dataChecker(data.s19to26);
        s26plus.innerText = dataChecker(data.s26plus);

        // TODO Generate chart.js -> Modals

        // Generate formatted TEXT for Local Storage (w/ diff sentence and rhythm - but hmmm depends on preference chosen earlier)
      });

      // Request 4 :: Hedonometer
      postRequest(endpointHedonometer, saved).then((data) => {
        // Fill in sidebar
        hedonometer.innerText = dataChecker(data.happyScore);

        // TODO Modals, scoring, emojis etc.

        // Formatted text somehow? With span.emoji::after { content: ":)";}
      });

      // Request 5 :: Corrections
      // TODO -- Skip the <b> Stuff for now. Also remove headers and lists.

      // Save ALL to Local Storage -- possible with separate function ...

      // Render new EDITOR
      // const newEditor = data.editorJSON; // Get editor data
      //   editor.blocks.render(newEditor); // Render new editor

      // Initialize popovers
      // TODO wtf is this
      editor.isReady.then(() => {
        analyzeBtn.innerHTML = "Analysér";

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

function resetLocalStorage() {
  localStorage.setItem("assistant", "");
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

  if (input === undefined || typeof input === "undefined") {
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
