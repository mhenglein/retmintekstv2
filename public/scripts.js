/* eslint-disable */
// import EditorJS from "@editorjs/editorjs";
const editordiv = document.getElementById("editorjs");

// Aux functions

// Toast
var toastElList = [].slice.call(document.querySelectorAll(".toast"));
var toastList = toastElList.map(function (toastEl) {
  return new bootstrap.Toast(toastEl, {});
});

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

window.onload = () => {
  $(document).ready(() => {
    $("#sidebar").mCustomScrollbar({
      theme: "minimal",
    });
  });
};

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

// TODO Not working
function initializePopovers() {
  const popoverTriggerList = [].slice.call(document.querySelectorAll('.editor [data-bs-toggle="popover"]'));
  // eslint-disable-next-line no-unused-vars
  // eslint-disable-next-line array-callback-return
  const popoverList = popoverTriggerList.map((popoverTriggerEl) => {
    new bootstrap.Popover(popoverTriggerEl, {
      trigger: "hover focus",
      placement: "auto",
      container: "#editorjs",
      html: true,
    });
  });
}

setInterval(initializePopovers(), 5000);


/* eslint-disable */
// @codekit-prepend "dom.js";

const path = "http://localhost:3000";
const endpointMetrics = `${path}/api/textmetrics`;
const endpointVocab = `${path}/api/evaluatevocab`;
const endpointHedonometer = `${path}/api/rateSentiment`;
const endpointSentence = `${path}/api/sentence-difficulty`;
const endpointRhythm = `${path}/api/sentence-rhythm`;
const endpointCorrections = `${path}/api/retmintekst`;
const endpointLongWords = `${path}/api/longwords`;

const editorData = JSON.parse(getFromStorage("editor"));

const editor = new EditorJS({
  holder: "editorjs",
  tools: {},

  onReady: () => {
    console.log("Editor.js is ready to work!");

    // * Bottom menu
    btnCorrections.addEventListener("click", () => {
      // closeAllMenus();
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
      analyzeSpinner.hidden = false;
      testConnection().then((result) => {
        if (result === 200) {
          const options = JSON.parse(getFromStorage("options"));
          editor.save().then((saved) => {
            clearStorageCache();
            readEditSwitch();
            const fullText = extractFullText(saved);
            updateLocalStorage("editor", JSON.stringify(saved));

            const promises = [];
            const promisesOverall = [
              postRequest(endpointMetrics, { input: fullText, options }),
              postRequest(endpointHedonometer, { input: fullText, options }),
            ];

            promises.push(promisesOverall);

            saved.blocks.forEach((block, index) => {
              const { id, type, data } = block;
              const { text } = data;

              const request = {
                input: text,
                options,
              };

              const blockPromises = [
                postRequest(endpointLongWords, request),
                postRequest(endpointVocab, request),
                postRequest(endpointRhythm, request),
                postRequest(endpointSentence, request),
                postRequest(endpointHedonometer, request),
                postRequest(endpointCorrections, request),
              ];
              promises.push(blockPromises);
            });

            const promise4all = Promise.all(
              promises.map(function (innerPromiseArray) {
                return Promise.all(innerPromiseArray);
              })
            );

            promise4all.then((results) => {
              console.log(results);
              const overall = results[0];
              const metrics = overall[0];
              const happinessScore = overall[1];

              resolveMetrics(metrics, saved);
              resolveOverallHappinessScore(happinessScore);

              for (let i = 1; i < results.length; i++) {
                const block = results[i];
                const longwords = block[0];
                const vocab = block[1];
                const rhythm = block[2];
                const difficulty = block[3];
                const hedonometer = block[4];
                const corrections = block[5];

                // Functions return an updated editor / have a return value
                resolveLongwords(longwords);
                resolveVocab(vocab);
                resolveSentenceRhythm(rhythm);
                resolveSentenceDifficulty(difficulty);
                resolveHedonometer(hedonometer);
                resolveCorrections(corrections);
              }

              // Update local storage here .. with the editors

              readEditSwitch(); // Unlock editor
            });
          });
        } else {
          showWarning();
          editor.save();
        }
      });
    });

    const removeMarkupBtn = document.getElementById("removeMarkupBtn");
    removeMarkupBtn.addEventListener("click", () => {
      editor.save().then((saved) => {
        saved.forEach((block) => {
          block.data.text = removeHTML(blocks.data.text);
        });
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

function countParagraphs(editorBlocks) {
  return editorBlocks.filter((x) => x.type === "paragraph").length;
}

function extractFullText(savedEditor) {
  let output = "";
  savedEditor.blocks.forEach((block) => {
    let { text } = block.data;
    text = text.trim();
    const rightmostCharacter = text.slice(text.length - 1);
    const endsWithPunctuation = rightmostCharacter.match(/[.?!:;](\s|$)/gi);
    if (endsWithPunctuation === null) text += ". ";
    output += ` ${text}`;
  });
  return output.trim();
}

function showWarning(delay = 5000) {
  const warningToast = document.querySelector("#warningToast");
  const newToast = new bootstrap.Toast(warningToast, { delay: delay });
  newToast.show();
}

function showSuccess(delay = 2500) {
  analyzeBtn.innerText = "Opdateret!";
  setTimeout(function () {
    analyzeBtn.innerText = "Analysér";
  }, delay);
}

async function testConnection() {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", `${path}/status`, false);
  try {
    xhr.send();
    return xhr.status;
  } catch (err) {
    console.log(err);
    return xhr.status;
  }
}

function incrementStorage(label, number) {
  localStorage.setItem(label, Number(localStorage.getItem(label)) + Number(number));
}

function readEditSwitch() {
  editor.readOnly.toggle();
  editordiv.classList.toggle("text-muted");
  analyzeSpinner.hidden = !analyzeSpinner.hidden;
}

function clearStorageCache() {
  localStorage.setItem("korrekthed", 0);
  localStorage.setItem("klarhed", 0);
  localStorage.setItem("originalitet", 0);
  localStorage.setItem("udtryk", 0);
}

function updateModals() {
  uniqueWordsList.innerHTML = "";
  const allUniqueWords = JSON.parse(localStorage.getItem("uniqueWords"));
  allUniqueWords.forEach((word) => {
    uniqueWordsList.innerHTML += `<span class='badge text-dark stat mx-2'>${word}</span>`;
  });

  rareWordsList.innerHTML = "";
  const allUncommonWords = localStorage.getItem("uncommonWords");
  allUncommonWords.forEach((word) => {
    rareWordsList.innerHTML += `<span class='badge text-dark stat mx-2'>${word}</span>`;
  });

  frequentWordsList.innerHTML = "";
  const allOverusedWords = localStorage.getItem("overusedWords");
  allOverusedWords.forEach((word) => {
    frequentWordsList.innerHTML += `<span class='badge text-dark stat mx-2'>${word}</span>`;
  });
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
  // TODO nicer way of doing this
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
  // TODO Use TextParser?
  return text.replace(/<[^>]*(>|$)|&nbsp;|&zwnj;|&raquo;|&laquo;|&gt;/gi, " ");
}

function dataChecker(input) {
  // TODO DO i need this?
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

function updateSidebar() {
  longwords.innerText = localStorage.getItem("counterLongWords");
  unique.innerText = localStorage.getItem("counterUnique");
  rare.innerText = localStorage.getItem("counterUncommon");
  frequent.innerText = localStorage.getItem("counterOverused");

  const sentenceLengths = JSON.parse(localStorage.getItem("sentenceLengths"));
  s1to3.innerText = sentenceLengths.s1to3;
  s4to6.innerText = sentenceLengths.s4to6;
  s7to10.innerText = sentenceLengths.s7to10;
  s11to18.innerText = sentenceLengths.s11to18;
  s19to26.innerText = sentenceLengths.s19to26;
  s26plus.innerText = sentenceLengths.s26plus;

  // Fill in DOM
  korrekthed.innerText = localStorage.getItem("korrekthed");
  klarhed.innerText = localStorage.getItem("klarhed");
  originalitet.innerText = localStorage.getItem("originalitet");
  udtryk.innerText = localStorage.getItem("udtryk");
}

function resolveMetrics(data, savedEditor) {
  words.innerText = dataChecker(data.wordCount);
  longwords.innerText = dataChecker(data.longWordsCount);
  chars.innerText = dataChecker(data.charsNoSpaces);
  charsplus.innerText = dataChecker(data.charsWithSpaces);
  sentences.innerText = dataChecker(data.sentenceCount);
  sentenceLength.innerText = dataChecker(data.avgSentenceLength);
  sentenceLength2.innerText = dataChecker(data.avgSentenceLength);
  wordLength.innerText = dataChecker(data.avgWordLength);
  variance.innerText = dataChecker(data.sentenceVariance);
  lix.innerText = dataChecker(data.lix);
  difficulty.innerText = dataChecker(data.difficulty);
  audience.innerText = dataChecker(data.audience);
  readingtime.innerText = dataChecker(data.readingTime);
  speakingtime.innerText = dataChecker(data.speakingTime);
  normalsider.innerText = dataChecker(data.normalsider);

  const numberOfParagraphs = countParagraphs(savedEditor.blocks);
  paragraphs.innerText = dataChecker(numberOfParagraphs);

  // Update Local Storage
  // TODO One object pls ...
  updateLocalStorage("words", data.wordCount);
  updateLocalStorage("longWords", data.longWordsCount);
  updateLocalStorage("chars", data.charsNoSpaces);
  updateLocalStorage("charsplus", data.charsWithSpaces);
  updateLocalStorage("sentences", data.sentenceCount);
  updateLocalStorage("sentenceLength", data.avgSentenceLength);
  updateLocalStorage("wordLength", data.avgWordLength);
  updateLocalStorage("variance", data.sentenceVariance);
  updateLocalStorage("lix", data.lix);
  updateLocalStorage("difficulty", data.difficulty);
  updateLocalStorage("audience", data.audience);
  updateLocalStorage("readingtime", data.readingTime);
  updateLocalStorage("speakingtime", data.speakingTime);
  updateLocalStorage("paragraphs", numberOfParagraphs);
  updateLocalStorage("normalsider", data.normalsider);

  // Calc
  // TODO Move to other request
  const longWordPercentage = `${Math.floor((Number(data.longWords) / Number(data.words)) * 100)}%`;
}

// ! Resolvers
function resolveCorrections(editorStructure, index, outcome) {
  editorStructure.blocks[index].data.text = outcome.formattedText;

  incrementStorage("korrekthed", outcome.korrekthed);
  incrementStorage("klarhed", outcome.klarhed);
  incrementStorage("originalitet", outcome.originalitet);
  incrementStorage("udtryk", outcome.udtryk);

  updateLocalStorage("highlightedText_corrections", JSON.stringify(editorStructure));
}

function resolveLongwords(data, index) {
  const editor = getFromStorage("editor");
  editor.blocks[index].data.text = data.returnText;
  incrementStorage("counterLongWords", Number(data.noOfLongWords));

  updateLocalStorage("highlightedText_longwords", JSON.stringify(editor));
}

function resolveVocab(editorStructure, index, outcome) {
  editorStructure.blocks[index].data.text = outcome.returnText;

  // localStorage.setItem(
  //   "numUniqueWords",
  //   Number(localStorage.getItem("numUniqueWords")) + Number(outcome.numUniqueWords)
  // );
  // localStorage.setItem(
  //   "uncommonWords",
  //   Number(localStorage.getItem("numUncommonWords")) + Number(outcome.numUncommonWords)
  // );
  // localStorage.setItem(
  //   "overusedWords",
  //   Number(localStorage.getItem("numOverusedWords")) + Number(outcome.numOverusedWords)
  // );
  // const uniqueArray = Array.from(localStorage.getItem("uniqueWords"));
  // localStorage.setItem("uniqueWords", JSON.stringify(uniqueArray.concat(outcome.uniqueWords)));
  // const uncommonArray =
  //   localStorage.getItem("uncommonWords") === null ? {} : Array.from(localStorage.getItem("uncommonWords"));
  // localStorage.setItem("uncommonWords", JSON.stringify(uncommonArray.concat(outcome.uncommonArray)));
  // const overusedArray = Array.from(localStorage.getItem("overusedWords"));
  // localStorage.setItem("overusedWords", JSON.stringify(overusedArray.concat(outcome.overusedWords)));
  // Calc
  const uniquePercentage = Number(outcome.numUniqueWords) / Number(outcome.numAllWords);
  const rarePercentage = Number(outcome.numUncommonWords) / Number(outcome.numAllWords);
}

function resolveSentenceRhythm(editorStructure, index, outcome) {
  editorStructure.blocks[index].data.text = outcome.returnText;
  let existing = JSON.parse(localStorage.getItem("sentenceLengths")); // Object
  if (existing === null) existing = {};

  localStorage.setItem(
    "sentenceLengths",
    JSON.stringify({
      s1to3: Number(existing?.s1to3) + Number(outcome.errors.s1to3),
      s4to6: Number(existing?.s4to6) + Number(outcome.errors.s4to6),
      s7to10: Number(existing?.s7to10) + Number(outcome.errors.s7to10),
      s11to18: Number(existing?.s11to18) + Number(outcome.errors.s11to18),
      s19to26: Number(existing?.s19to26) + Number(outcome.errors.s19to26),
      s26plus: Number(existing?.s26plus) + Number(outcome.errors.s26plus),
    })
  );
}

function resolveSentenceDifficulty(editorStructure, index, outcome) {
  editorStructure.blocks[index].data.text = outcome.returnText;

  let existing = JSON.parse(localStorage.getItem("sentenceDifficulty")); // Object
  if (existing === null) existing = {};

  localStorage.setItem(
    "sentenceDifficulty",
    JSON.stringify({
      easy: Number(existing?.easy) + Number(outcome.noEasySentences),
      hard: Number(existing?.hard) + Number(outcome.noHardSentences),
      veryhard: Number(existing?.veryhard) + Number(outcome.noVeryHardSentences),
    })
  );

  // TODO Generate chart.js -> Modals
  updateLocalStorage("highlightedText_difficulty", JSON.stringify(editorStructure));
}

function resolveOverallHappinessScore(data) {
  const happinessScore = String(`${dataChecker(data.emoji)} - ${dataChecker(data.happinessScore)}/9`);
  hedonometer.innerText = happinessScore;
  updateLocalStorage("hedonometer", happinessScore);
}

function resolveHedonometer(editorStructure, index, outcome) {
  editorStructure.blocks[index].data.text = outcome.returnText;
  updateLocalStorage("highlightedText_sentiment", JSON.stringify(editorStructure));
}
