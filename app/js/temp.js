// Sidebars
// const btnCollapseSidebar = document.querySelector("#sidebarCollapse");
const btnShowSidebar = document.querySelector("#showSidebar");
const sectionSidebar = document.querySelector("#sidebar");
const sectionContent = document.querySelector("#content");
const bottomMenu = document.querySelector("#bottom-menu");

// btnCollapseSidebar.addEventListener("click", () => {
//   sectionSidebar.classList.toggle("mobile");
//   sectionContent.classList.toggle("mobile");
//   bottomMenu.classList.toggle("mobile");
//   btnShowSidebar.classList.toggle("mobile");
// });

btnShowSidebar.addEventListener("click", () => {
  sectionSidebar.classList.toggle("mobile");
  sectionContent.classList.toggle("mobile");
  bottomMenu.classList.toggle("mobile");
  btnShowSidebar.classList.toggle("mobile");
});

// Array and loop For each -- For some reason this works ...???
// forslagSubmenu.addEventListener("show.bs.collapse", function () {
//   vocabSubmenu.classList.remove("show");
//   readabilitySubmenu.classList.remove("show");
//   rhythmSubmenu.classList.remove("show");
//   sentimentSubmenu.classList.remove("show");
//   genereltSubmenu.classList.remove("show");
// });

// arrSubMenus.forEach((menu) => {
//   menu.addEventListener("show.bs.collapse", () => {
//     for (let i = 0; i < arrSubMenus.length; i += 1) {
//       if (arrSubMenus[i] !== menu) {
//         if (arrSubMenus[i].classList.contains("show")) {
//           arrSubMenus[i].classList.remove("show");
//         }
//       }
//     }
//   });
// });

// Update sidebar
const analyzeSpinner = document.getElementById("spinner");

const editorData = JSON.parse(getFromStorage("editor"));

function countParagraphs(editorBlocks) {
  return editorBlocks.filter((x) => x.type === "paragraph").length;
}

function showSuccess(delay = 2500) {
  analyzeBtn.innerText = "Opdateret!";
  setTimeout(function () {
    analyzeBtn.innerText = "Analysér";
  }, delay);
}

// * Auxilliary functions
// Placeholders

function removeHTML(text) {
  // TODO Use TextParser?
  return text.replace(/<[^>]*(>|$)|&nbsp;|&zwnj;|&raquo;|&laquo;|&gt;/gi, " ");
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
  words.innerText = data.wordCount;
  longwords.innerText = data.longWordsCount;
  chars.innerText = data.charsNoSpaces;
  charsplus.innerText = data.charsWithSpaces;
  sentences.innerText = data.sentenceCount;
  sentenceLength.innerText = data.avgSentenceLength;
  sentenceLength2.innerText = data.avgSentenceLength;
  wordLength.innerText = data.avgWordLength;
  variance.innerText = data.sentenceVariance;
  lix.innerText = data.lix;
  difficulty.innerText = data.difficulty;
  audience.innerText = data.audience;
  readingtime.innerText = data.readingTime;
  speakingtime.innerText = data.speakingTime;
  normalsider.innerText = data.normalsider;

  const numberOfParagraphs = countParagraphs(savedEditor.blocks);
  paragraphs.innerText = numberOfParagraphs;

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
