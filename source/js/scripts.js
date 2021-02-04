// TODO Dark mode
// TODO Write/Edit switch
// TODO Modals el. lign hvori den præcise nedbrydning af fx "rød fejl" ses ("Stavefejl, etc.")

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

// Sidebars
const toggleBtn = document.querySelector("#sidebarCollapse");
const sidebar = document.querySelector("#sidebar");
const content = document.querySelector("#content");

toggleBtn.addEventListener("click", function () {
  sidebar.classList.toggle("mobile");
  content.classList.toggle("mobile");
});

// TODO Replace jQuery possible?
$(document).ready(function () {
  $("#sidebar").mCustomScrollbar({
    theme: "minimal",
  });
});

const polarity = document.getElementById("polarity");
const tone = document.getElementById("tone");
const totalErr = document.getElementById("totalErr");
const red = document.getElementById("red");
const yellow = document.getElementById("yellow");
const blue = document.getElementById("blue");
const hard = document.getElementById("hard");
const vhard = document.getElementById("vhard");
const lix = document.getElementById("lix");
const difficulty = document.getElementById("difficulty");
const unique = document.getElementById("unique");
const rare = document.getElementById("rare");
const wlength = document.getElementById("wlength");
const slength = document.getElementById("slength");
const svariance = document.getElementById("svariance");
const chars = document.getElementById("chars");
const charsplus = document.getElementById("charsplus");
const words = document.getElementById("words");
const sentences = document.getElementById("sentences");
const readingtime = document.getElementById("readingtime");
const speakingtime = document.getElementById("speakingtime");
const happiness = document.getElementById("happiness");

const modalReds = document.querySelector("span.rederrors");
const modalYellows = document.querySelector("span.yellowerrors");
const modalBlues = document.querySelector("span.blueerrors");
const modalUniques = document.querySelector("span.uniquewords");
const modalRares = document.querySelector("span.rarewords");
const modalHappy = document.querySelector("span.happyWords");

// Window onload
window.onload = function () {
  // Download from Local Storage
  const assistantData = JSON.parse(localStorage.getItem("assistant"));

  // Update sidebar
  try {
    polarity.innerText = assistantData.polarity;
    tone.innerText = assistantData.tone;
    totalErr.innerText = assistantData.red + assistantData.yellow + assistantData.blue;
    red.innerText = assistantData.red;
    yellow.innerText = assistantData.yellow;
    blue.innerText = assistantData.blue;
    hard.innerText = assistantData.hard;
    vhard.innerText = assistantData.vhard;
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
    happiness.innerText = `${convertValToEmoji(assistantData.happyScore)} ${assistantData.happyScore}/7`;
  } catch (err) {
    console.log("Error on load with the assistant", err);
  }
};

// *** EDITOR *** //
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";

// Retrieve data from storage
const editorData = JSON.parse(localStorage.getItem("editor"));

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
const placerholderText = placerholderArray[Math.floor(Math.random() * placerholderArray.length)];
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
    // Analyze Text btn
    const analyzeBtn = document.getElementById("analyzeBtn");
    analyzeBtn.addEventListener("click", function () {
      analyzeBtn.innerHTML =
        '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Analyserer ...';
      analyzeText();
    });

    // Clean ALL button
    const cleanBtn = document.getElementById("cleanBtn");
    cleanBtn.addEventListener("click", function () {
      if (confirm("Er du sikker?")) {
        editor.save().then((saved) => {
          for (let i = 0; i < saved.blocks.length; i++) {
            saved.blocks[i].data.text = prepareText(saved.blocks[i].data.text);
          }
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
          saved.blocks[i].data.text = prepareText(saved.blocks[i].data.text);
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

  placeholder: placerholderText,
  data: editorData,
});

async function analyzeText() {
  editor.save().then((outputData) => {
    for (let i = 0; i < outputData.blocks.length; i++) {
      outputData.blocks[i].data.text = cleanText(prepareText(outputData.blocks[i].data.text));
    }

    localStorage.setItem("editor", JSON.stringify(outputData));

    const endpoint = "http://localhost:3000";
    const path = `${endpoint}/api`;

    // POST request to server
    postRequest(path, outputData).then((data) => {
      const newEditor = data.editorJSON; // Get editor data
      editor.blocks.render(newEditor); // Render new editor

      const newAssistant = data.assistantData; // Get assistant data
      localStorage.setItem("assistant", JSON.stringify(newAssistant)); // Upload assistant to Local Storage
      localStorage.setItem("editor", JSON.stringify(data.editorJSON));

      // Update sidebar
      polarity.innerText = newAssistant.polarity;
      tone.innerText = newAssistant.tone;
      totalErr.innerText = newAssistant.red + newAssistant.yellow + newAssistant.blue;
      red.innerText = newAssistant.red;
      yellow.innerText = newAssistant.yellow;
      blue.innerText = newAssistant.blue;
      hard.innerText = newAssistant.hard;
      vhard.innerText = newAssistant.vhard;
      lix.innerText = newAssistant.lix;
      difficulty.innerText = newAssistant.difficulty;
      unique.innerText = newAssistant.unique;
      rare.innerText = newAssistant.rare;
      wlength.innerText = newAssistant.wlength;
      slength.innerText = newAssistant.slength;
      svariance.innerText = newAssistant.svariance;
      chars.innerText = newAssistant.chars;
      charsplus.innerText = newAssistant.charsplus;
      words.innerText = newAssistant.words;
      sentences.innerText = newAssistant.sentences;
      readingtime.innerText = newAssistant.readingtime;
      speakingtime.innerText = newAssistant.speakingtime;

      // Initialize popovers
      try {
        editor.isReady.then(() => {
          analyzeBtn.innerHTML = "Analysér";

          setTimeout(() => {
            initializePopovers();

            const redErrors = document.querySelectorAll(".editor span.red");
            const yellowErrors = document.querySelectorAll(".editor span.yellow");
            const blueErrors = document.querySelectorAll(".editor span.blue");

            let i;

            for (i = 0; i < redErrors.length; i++) {
              const txt = redErrors[i].innerText;
              modalReds.innerHTML += `<span class="badge bg-danger me-1 ms-1">${txt}</span>`;
            }

            for (i = 0; i < yellowErrors.length; i++) {
              const txt = yellowErrors[i].innerText;
              modalYellows.innerHTML += `<span class="badge bg-warning me-1 ms-1">${txt}</span>`;
            }

            for (i = 0; i < blueErrors.length; i++) {
              const txt = blueErrors[i].innerText;
              modalBlues.innerHTML += `<span class="badge bg-primary me-1 ms-1">${txt}</span>`;
            }

            const uniqueWordsLength = data.uniqueWords.length;
            modalUniques.innerHTML = "";
            for (i = 0; i < uniqueWordsLength; i++) {
              const txt = data.uniqueWords[i];
              modalUniques.innerHTML += `<span class="badge bg-light text-dark me-1 ms-1">${txt}</span>`;
            }

            const rareWordsLength = data.distinctRareWords.length;
            modalRares.innerHTML = "";
            for (i = 0; i < rareWordsLength; i++) {
              const txt = data.distinctRareWords[i];
              modalRares.innerHTML += `<span class="badge bg-light text-dark me-1 ms-1">${txt}</span>`;
            }

            // Happy words
            const happyWordsLength = data.distinctHappyWords.length;
            console.log("Look here")
            console.log(happyWordsLength)

            for (i = 0; i < happyWordsLength; i++) {
              const happyWord = data.happyWordsLength[i][0];
              const happyValue = parseFloat(data.happyWordsLength[i][1]);
              const happyStd = parseFloat(data.happyWordsLength[i][2]);
              const emoji = convertValToEmoji(parseFloat(happyValue));
              modalHappy.innerHTML += `<li><span class="badge bg-light text-dark font-monospace">${emoji} ${happyWord} - ${happyValue}/7 (σ=${happyStd})</span></li>`;
            }
          }, 2000);
        });
      } catch (err) {
        console.log("Something went wrong", err);
      }
    });
  });
}

async function postRequest(url, data) {
  const response = await fetch(url, {
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
  return response.json();
}

function prepareText(dirtyText) {
  if (dirtyText !== undefined) {
    return dirtyText.replace(/<span.*>/g, "").replace("</span>", "");
  }
}

function cleanText(dirtyText) {
  if (dirtyText !== undefined) {
    return dirtyText.replace("&nbsp;", "");
  }
}

function resetSidebar() {
  // Reset sidebar
  try {
    polarity.innerText = "🤷‍♂️";
    tone.innerText = "🤷‍♂️";
    totalErr.innerText = 0;
    red.innerText = 0;
    yellow.innerText = 0;
    blue.innerText = 0;
    hard.innerText = 0;
    vhard.innerText = 0;
    lix.innerText = "🤷‍♂️";
    difficulty.innerText = "🤷‍♂️";
    unique.innerText = 0;
    rare.innerText = 0;
    wlength.innerText = 0;
    slength.innerText = 0;
    chars.innerText = 0;
    charsplus.innerText = 0;
    words.innerText = 0;
    sentences.innerText = 0;
    readingtime.innerText = 0;
    speakingtime.innerText = 0;
    modalReds.innerText = "";
    modalYellows.innerText = "";
    modalBlues.innerText = "";
    modalUniques.innerText = "";
    modalRares.innerText = "";
  } catch (err) {
    console.log("Error on load with the assistant", err);
  }
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

function convertValToEmoji(inputScore) {
  try {
    let meanValue = Number(inputScore);
    let emoji = "";
    switch (true) {
      case meanValue < 2:
        emoji = "🤬";
        break;
      case meanValue < 3:
        emoji = "😡";
        break;
      case meanValue < 4:
        emoji = "😠";
        break;
      case meanValue < 5:
        emoji = "😐";
        break;
      case meanValue < 6:
        emoji = "🙂";
        break;
      case meanValue < 7:
        emoji = "😄";
        break;
      case meanValue < 8:
        emoji = "😁";
        break;
      case meanValue < 9:
        emoji = "🤩";
        break;
      default:
        emoji = "🤷‍♂️";
    }
    return emoji;
  } catch (err) {
    console.log(err);
    emoji = "🤷‍♂️";
    return emoji;
  }
}
