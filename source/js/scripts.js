/* eslint-disable no-use-before-define */
/* eslint-disable no-console */

// *** EDITOR *** //
import EditorJS from "@editorjs/editorjs";

const path = "http://localhost:3000";
const endpointMetrics = `${path}/api/metrics`;
const endpointVocab = `${path}/api/vocab`;
const endpointHedonometer = `${path}/api/hedonometer`;
const endpointSentence = `${path}/api/sentence`;
const endpointRhythm = `${path}/api/rhythm`;
const endpointCorrections = `${path}/api/retmintekst`;
const endpointLongWords = `${path}/api/longwords`;

// Window onload
window.onload = () => {
  // Aux functions
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

  function getFromStorage(identifier) {
    try {
      return String(localStorage.getItem(identifier));
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  function removeClasses(element, exception = []) {
    if (element.className !== undefined) {
      const classNames = element.className.split(" ");
      classNames.forEach((name) => {
        if (!exception.includes(name)) {
          element.classList.remove(name);
        }
      });
    }
  }

  // Get DOM elements
  const editordiv = document.getElementById("editorjs");

  // * Options
  const fontInter = document.getElementById("fontInter");
  const fontLora = document.getElementById("fontLora");
  const fontOxygen = document.getElementById("fontOxygen");
  const fontLibre = document.getElementById("fontLibre");
  const fontLato = document.getElementById("fontLato");
  const chosenFont = document.getElementById("chosenFont");

  const preferredFont = getFromStorage("RetMinTekst:PreferredFont");
  if (preferredFont !== "null") {
    setFont(preferredFont);
  }

  // * Font
  function setFont(fontName) {
    removeClasses(chosenFont, ["w-50", "align-self-center"]);
    removeClasses(editordiv);
    editordiv.classList.add(fontName.toLowerCase(), ["editor"]);
    chosenFont.classList.add(fontName.toLowerCase().replace(" ", ""));
    chosenFont.innerText = fontName;
    updateLocalStorage("RetMinTekst:PreferredFont", fontName);
  }

  fontInter.onclick = () => {
    setFont(fontInter.innerText);
  };
  fontLora.onclick = () => {
    setFont(fontLora.innerText);
  };
  fontOxygen.onclick = () => {
    setFont(fontOxygen.innerText);
  };
  fontLibre.onclick = () => {
    setFont(fontLibre.innerText);
  };
  fontLato.onclick = () => {
    setFont(fontLato.innerText);
  };

  const aud1 = document.getElementById("aud1");
  const aud2 = document.getElementById("aud2");
  const aud3 = document.getElementById("aud3");
  const audienceCheck = localStorage.getItem("audience");
  if (audienceCheck === "1") {
    aud1.classList.add("active");
    aud2.classList.remove("active");
    aud3.classList.remove("active");
  } else if (audienceCheck === "2") {
    aud2.classList.add("active");
    aud1.classList.remove("active");
    aud3.classList.remove("active");
  } else {
    aud2.classList.add("active");
    aud1.classList.remove("active");
    aud3.classList.remove("active");
  }

  aud1.addEventListener("click", () => {
    aud1.classList.add("active");
    aud2.classList.remove("active");
    aud3.classList.remove("active");
    localStorage.setItem("audience", 1);
  });
  aud2.addEventListener("click", () => {
    aud2.classList.add("active");
    aud1.classList.remove("active");
    aud3.classList.remove("active");
    localStorage.setItem("audience", 2);
  });
  aud3.addEventListener("click", () => {
    aud3.classList.add("active");
    aud2.classList.remove("active");
    aud1.classList.remove("active");
    localStorage.setItem("audience", 3);
  });

  // * Sidebar
  const totalErr = document.getElementById("totalErr");

  const korrekthed = document.getElementById("korrekthed");
  const originalitet = document.getElementById("originalitet");
  const klarhed = document.getElementById("klarhed");
  const udtryk = document.getElementById("udtryk");

  const unique = document.getElementById("unique");
  const rare = document.getElementById("rare");
  const frequent = document.getElementById("frequent");

  const uniqueWordsList = document.getElementById("uniqueWordsList");
  const rareWordsList = document.getElementById("rareWordsList");
  const frequentWordsList = document.getElementById("frequentWordsList");

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

  btnCollapseSidebar.addEventListener("click", () => {
    sectionSidebar.classList.toggle("mobile");
    sectionContent.classList.toggle("mobile");
    bottomMenu.classList.toggle("mobile");
    btnShowSidebar.classList.toggle("mobile");
  });

  btnShowSidebar.addEventListener("click", () => {
    sectionSidebar.classList.toggle("mobile");
    sectionContent.classList.toggle("mobile");
    bottomMenu.classList.toggle("mobile");
    btnShowSidebar.classList.toggle("mobile");
  });

  $(document).ready(() => {
    $("#sidebar").mCustomScrollbar({
      theme: "minimal",
    });
  });

  // Sidebar - Section headers
  const forslagHeader = document.getElementById("forslagSubmenu");
  const vocabHeader = document.getElementById("vocabHeader");
  const readabilityHeader = document.getElementById("readabilityHeader");
  const rhythmHeader = document.getElementById("rhythmHeader");
  const sentimentHeader = document.getElementById("sentimentHeader");

  // Sidebar sections SUBMENUS
  // const collapseElementList = [].slice.call(document.querySelectorAll(".collapse"));
  // const collapseList = collapseElementList.map(function (collapseEl) {
  //   return new bootstrap.Collapse(collapseEl);
  // });
  // console.log(collapseList);

  const forslagSubmenu = document.getElementById("forslagSubmenu");
  const vocabSubmenu = document.getElementById("vocabSubmenu");
  const readabilitySubmenu = document.getElementById("readabilitySubmenu");
  const rhythmSubmenu = document.getElementById("rhythmSubmenu");
  const sentimentSubmenu = document.getElementById("sentimentSubmenu");
  const genereltSubmenu = document.getElementById("genereltSubmenu");
  const arrSubMenus = [
    forslagSubmenu,
    vocabSubmenu,
    readabilitySubmenu,
    rhythmSubmenu,
    sentimentSubmenu,
    genereltSubmenu,
  ];

  // Array and loop For each -- For some reason this works ...???
  // forslagSubmenu.addEventListener("show.bs.collapse", function () {
  //   vocabSubmenu.classList.remove("show");
  //   readabilitySubmenu.classList.remove("show");
  //   rhythmSubmenu.classList.remove("show");
  //   sentimentSubmenu.classList.remove("show");
  //   genereltSubmenu.classList.remove("show");
  // });

  arrSubMenus.forEach((menu) => {
    menu.addEventListener("show.bs.collapse", () => {
      for (let i = 0; i < arrSubMenus.length; i += 1) {
        if (arrSubMenus[i] !== menu) {
          if (arrSubMenus[i].classList.contains("show")) {
            arrSubMenus[i].classList.remove("show");
          }
        }
      }
    });
  });

  // Bottom menu
  const btnCorrections = document.getElementById("btnCorrections");
  const btnVocab = document.getElementById("btnVocab");
  const btnReadability = document.getElementById("btnReadability");
  const btnTextrhythm = document.getElementById("btnTextrhythm");
  const btnSentiment = document.getElementById("btnSentiment");
  const btnSentences = document.getElementById("btnSentences");

  // Update sidebar
  const analyzeSpinner = document.getElementById("spinner");

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
    tools: {},

    onReady: () => {
      console.log("Editor.js is ready to work!");

      // * Bottom menu
      btnCorrections.addEventListener("click", () => {
        forslagHeader.click();
        const getEditorText = JSON.parse(getFromStorage("highlightedText_corrections"));
        editor.render(getEditorText);
      });

      btnVocab.addEventListener("click", () => {
        vocabHeader.click();
        const getEditorText = JSON.parse(getFromStorage("highlightedText_frequent"));

        editor.render(getEditorText);
      });

      btnReadability.addEventListener("click", () => {
        // Long word or difficults sentences? Option to be made

        const getEditorText = JSON.parse(getFromStorage("highlightedText_longwords"));
        console.log("readability", getEditorText);
        editor.render(getEditorText);

        readabilityHeader.click();
      });

      btnTextrhythm.addEventListener("click", () => {
        const getEditorText = JSON.parse(getFromStorage("highlightedText_rhythm"));
        editor.render(getEditorText);

        if (rhythmHeader.classList.contains("show")) {
          //
        } else {
          rhythmHeader.click();
        }
        document.getElementById("rhythmList").scrollIntoView(false);
        // TODO mcustomscrollbar
      });

      btnSentiment.addEventListener("click", () => {
        sentimentHeader.click();
        const getEditorText = JSON.parse(getFromStorage("highlightedText_sentiment"));
        if (getEditorText !== undefined) editor.render(getEditorText);
      });

      btnSentences.addEventListener("click", () => {
        readabilityHeader.click();
        const getEditorText = JSON.parse(getFromStorage("highlightedText_difficulty"));
        if (getEditorText !== undefined) editor.render(getEditorText);
      });

      // * Top menu
      // Analyze Text btn
      const analyzeBtn = document.getElementById("analyzeBtn");
      analyzeBtn.addEventListener("click", () => {
        // API Calls
        analyzeSpinner.hidden = false;
        sendRequests();
        analyzeSpinner.hidden = true;
      });

      // Remove markup button
      const removeMarkupBtn = document.getElementById("removeMarkupBtn");
      removeMarkupBtn.addEventListener("click", () => {
        editor.save().then((saved) => {
          const savedBlocks = saved;
          for (let i = 0; i < saved.blocks.length; i += 1) {
            savedBlocks.blocks[i].data.text = removeHTML(savedBlocks.blocks[i].data.text);
          }
          localStorage.setItem("editor", savedBlocks);
          editor.render(savedBlocks);
        });
        resetSidebar();
        sendRequests();
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

        // Options & preferences
        const preference = getFromStorage("highlightingPreference");
        const options = getFromStorage("options");

        sendRequestLongWords(saved, options);

        // Request 1 :: Metrics + Long words highlighting
        // sendRequestMetrics(saved, preference, options);

        // Request 2 :: Vocab
        // sendRequestVocab(saved, preference, options);

        // Request 3A + 3B :: Sentence analysis + rhythm
        // sendRequestSentence(saved, preference, options);
        // sendRequestRhythm(saved, preference, options);

        // Request 4 :: Hedonometer
        // sendRequestsSentiment(saved, preference, options);

        // Request 5 :: Corrections
        // sendRequestsCorrections(saved, preference, options);
      }
      // TODO Initialize popovers
      editor.isReady.then(() => {
        setTimeout(() => {
          initializePopovers();
        }, 2000);
      });
    });
  }

  function sendRequestMetrics(savedEditor, preference = "", option = "") {
    // Request 1 :: Metrics
    const request = {
      input: savedEditor,
      options: {
        highlight: false,
        removeStopwords: false,
      },
    };
    postRequest(endpointMetrics, request).then((data) => {
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
      const longWordPercentage = `${Math.floor((Number(data.longWords) / Number(data.words)) * 100)}%`;

      // Save formatted TEXT to Local Storage (w/ long words highlighted? Or nothing for this call)
      updateLocalStorage("highlightedText_longwords", JSON.stringify(data.output));
    });
  }

  function sendRequestLongWords(savedEditor, option = "") {
    const request = {
      input: savedEditor,
      options: {},
    };

    postRequest(endpointLongWords, request).then((data) => {
      console.log(data);
    });
  }

  function sendRequestVocab(savedEditor, preference = "", option = "") {
    const request = {
      input: savedEditor,
      options: {
        threshold: 5000,
        lemmafyAll: false,
        removeStopwords: false,
      },
    };
    postRequest(endpointVocab, request).then((data) => {
      // Fill in DOM
      unique.innerText = dataChecker(data.numUniqueWords);
      rare.innerText = dataChecker(data.numRareWords);
      frequent.innerText = dataChecker(data.numFrequentlyUsed);

      // Calc
      const uniquePercentage = Number(data.numUniqueWords) / Number(data.numAllWords);
      const rarePercentage = Number(data.numRareWords) / Number(data.numAllWords);

      // Update modals
      uniqueWordsList.innerHTML = "";
      data.uniqueWords.forEach((word) => {
        uniqueWordsList.innerHTML += `<span class='badge text-dark stat mx-2'>${word}</span>`;
      });

      rareWordsList.innerHTML = "";
      data.rareWords.forEach((word) => {
        rareWordsList.innerHTML += `<span class='badge text-dark stat mx-2'>${word}</span>`;
      });

      frequentWordsList.innerHTML = "";
      data.frequentlyUsed.forEach((word) => {
        frequentWordsList.innerHTML += `<span class='badge text-dark stat mx-2'>${word}</span>`;
      });

      // Update storage
      updateLocalStorage("unique", data.numUniqueWords);
      updateLocalStorage("rare", data.numRareWords);
      updateLocalStorage("frequent", data.numFrequentlyUsed);

      updateLocalStorage("uniqueWords", data.uniqueWords);
      updateLocalStorage("rareWords", data.rareWords);
      updateLocalStorage("frequentWords", data.frequentlyUsed);

      // Saved formatted TEXT to Local Storage (w/ frequent words highlighted)
      updateLocalStorage("highlightedText_frequent", JSON.stringify(data.output));
    });
  }

  function sendRequestRhythm(savedEditor, preference = "", options = {}) {
    const request = {
      input: savedEditor,
      options,
    };

    postRequest(endpointRhythm, request).then((data) => {
      s1to3.innerText = dataChecker(data.s1to3);
      s4to6.innerText = dataChecker(data.s4to6);
      s7to10.innerText = dataChecker(data.s7to10);
      s11to18.innerText = dataChecker(data.s11to18);
      s19to26.innerText = dataChecker(data.s19to26);
      s26plus.innerText = dataChecker(data.s26plus);

      updateLocalStorage("s1to3", data.s1to3);
      updateLocalStorage("s4to6", data.s4to6);
      updateLocalStorage("s7to10", data.s7to10);
      updateLocalStorage("s11to18", data.s11to18);
      updateLocalStorage("s19to26", data.s19to26);
      updateLocalStorage("s26plus", data.s26plus);

      updateLocalStorage("highlightedText_rhythm", JSON.stringify(data.rhythm));
    });
  }

  function sendRequestSentence(editor, preference = "", options = {}) {
    const request = {
      input: editor,
      options,
    };
    postRequest(endpointSentence, request).then((data) => {
      // Fill in DOM
      easy.innerText = dataChecker(data.easy);
      hard.innerText = dataChecker(data.hard);
      veryhard.innerText = dataChecker(data.veryhard);

      // Update storage
      updateLocalStorage("easy", data.easy);
      updateLocalStorage("hard", data.hard);
      updateLocalStorage("veryhard", data.veryhard);

      // TODO Generate chart.js -> Modals

      // Generate formatted TEXT for Local Storage (w/ diff sentence and rhythm)
      updateLocalStorage("highlightedText_difficulty", JSON.stringify(data.difficulty));
    });
  }

  function sendRequestsSentiment(savedEditor, preference = "", options = {}) {
    const request = {
      input: savedEditor,
      options, // lemmafyAll, uniqueOnly
    };

    postRequest(endpointHedonometer, request).then((data) => {
      const happinessScore = String(`${dataChecker(data.emoji)} - ${dataChecker(data.happyScore)}/9`);

      // Fill in DOM
      hedonometer.innerText = happinessScore;

      // Store in Local Storage
      updateLocalStorage("hedonometer", happinessScore);

      // TODO Modals, scoring, emojis etc. Chart.js

      // Formatted text somehow? With span.emoji::after { content: ":)";}
      // Save formatted TEXT to Local Storage
      updateLocalStorage("highlightedText_sentiment", JSON.stringify(data.outputObj));
    });
  }

  function sendRequestsCorrections(savedEditor, preference = "", options = {}) {
    const request = {
      input: savedEditor,
      options,
    };
    postRequest(endpointCorrections, request).then((data) => {
      // Fill in DOM
      korrekthed.innerText = dataChecker(data.korrekthed);
      klarhed.innerText = dataChecker(data.klarhed);
      originalitet.innerText = dataChecker(data.originalitet);
      udtryk.innerText = dataChecker(data.udtryk);

      // Store in Local Storage
      updateLocalStorage("korrekthed", data.korrekthed);
      updateLocalStorage("klarhed", data.klarhed);
      updateLocalStorage("originalitet", data.originalitet);
      updateLocalStorage("udtryk", data.udtryk);

      // Save formatted TEXT to Local Storage
      updateLocalStorage("highlightedText_corrections", JSON.stringify(data.formattedText));
    });
  }

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
      if (response.statusText !== "OK") {
        analyzeSpinner.hidden = true;
      }
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
      "Den Luft, der laa under Lindetræernes Kroner, havde vugget sig frem over den brune Hede og de tørstige Marker, den var blevet baget af Solen og støvet af Vejene, men nu var den renset af det tætte Løvhang, svalet de kjølige Lindeblade, og Duften af Lindens gule Blo  ter havde gjort den fugtig og givet den Fylde", // JP Jacobsen - Fru Marie Grubbe
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

  function removeHTML(text) {
    return text.replace(/<[^>]*(>|$)|&nbsp;|&zwnj;|&raquo;|&laquo;|&gt;/gi, " ");
  }

  function dataChecker(input) {
    let dataToBeChecked = input;
    try {
      dataToBeChecked = input.toString();
    } catch (err) {
      console.error("Input must be able to be coerced by the toString() method", err);
      return input;
    }

    if (input === undefined || typeof input === "undefined" || input === "undefined") {
      return "🤷‍♂️";
    }
    return dataToBeChecked;
  }

  // Popover
  function initializePopovers() {
    const popoverTriggerList = [].slice.call(document.querySelectorAll('.editor [data-bs-toggle="popover"]'));
    // eslint-disable-next-line no-unused-vars
    const popoverList = popoverTriggerList.map(
      (popoverTriggerEl) =>
        // eslint-disable-next-line no-undef
        new bootstrap.Popover(popoverTriggerEl, {
          trigger: "hover focus",
          placement: "auto",
          container: "#editorjs",
          html: true,
        })
    );
  }

  setInterval(initializePopovers(), 5000);
};
