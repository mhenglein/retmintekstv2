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
