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
