const editordiv = document.getElementById("editorjs");

// * Sidebar
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

const paragraphs = document.getElementById("paragraphs");
const normalsider = document.getElementById("normalsider");
const sentences = document.getElementById("sentences");
const words = document.getElementById("words");
const chars = document.getElementById("chars");
const charsplus = document.getElementById("charsplus");
const readingtime = document.getElementById("readingtime");
const speakingtime = document.getElementById("speakingtime");

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
