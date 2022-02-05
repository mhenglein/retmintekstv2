// import { Alert, Button, Collapse, Dropdown, Modal, Popover, Tab, Toast, Tooltip } from "bootstrap";

// Upon clicking a DOM element, get its name and store it in the option JSON (saved in Local Storage, and also on the server)
export function updateSettings(dom) {
  const view = dom.getAttribute("name");
  const options = localStorage.options ? JSON.parse(localStorage.options) || {} : {};
  options.view = view;
  localStorage.options = JSON.stringify(options);
}

// Initialize toasts
export function initToasts() {
  const toastElList = [].slice.call(document.querySelectorAll(".toast"));
  const toastList = toastElList.map(function (toastEl) {
    return new bootstrap.Toast(toastEl, {});
  });
}

export function showWarning(delay = 5000) {
  const warningToast = document.querySelector("#warningToast");
  const newToast = new bootstrap.Toast(warningToast, { delay: delay });
  newToast.show();
}
// ! LOCAL STORAGE
// Update local storage (Just added a try/catch)
export function updateLocalStorage(identifier, value) {
  if (identifier === "" || identifier == null) {
    console.log("Failed to update local storage value", identifier);
  }

  try {
    localStorage.setItem(identifier, value);
  } catch (err) {
    console.log(err);
  }
}

// Get from local storage (logs errors)
export function getFromStorage(identifier) {
  try {
    return String(localStorage.getItem(identifier));
  } catch (err) {
    console.log(err);
    return null;
  }
}

export function incrementStorage(label, number) {
  localStorage.setItem(label, Number(localStorage.getItem(label)) + Number(number));
}

export function clearStorageCache() {
  localStorage.setItem("korrekthed", 0);
  localStorage.setItem("klarhed", 0);
  localStorage.setItem("originalitet", 0);
  localStorage.setItem("udtryk", 0);
}

// ! Connecting with the API
// For some reason I have a function to test the connection to the server
export async function testConnection() {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "/status", false);
  try {
    xhr.send();
    return xhr.status;
  } catch (err) {
    console.log(err);
    return xhr.status;
  }
}

export async function postRequest(url, data) {
  // function handleErrors(response) {
  //   if (!response.ok) {
  //     console.error("Response not OK");
  //     throw Error(response.statusText);
  //   }
  //   return response;
  // }

  // try {
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

  // console.log("Response status ...", response.statusText, url);
  // if (response.statusText !== "OK") {
  //   analyzeSpinner.hidden = true;
  // }
  // response = handleErrors(response);
  // const result = await response.json();
  // return result;
  const json = await response.json();
  return json;
}
// catch (err) {
//   console.error("Error in request", err);
//   return data;
// }

// }

// ! Editor
// Un/locks the editor
export function readEditSwitch(editorJS, spinner, state) {
  if (state === "read") {
    // editorJS.readOnly = true;
    spinner.hidden = false;
    //  editordiv.classList.toggle("text-muted");
  }

  if (state === "edit") {
    // editorJS.readOnly = false;
    spinner.hidden = true;
  }
}

export function getEditorData() {
  // Server option

  // LocalStorage option
  console.log("Getting editor data ...");
  const data = localStorage.editor;
  if (!data) return null;
  if (data === "[object Object]") return null;

  return JSON.parse(data);
}

export function generatePlaceholder() {
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

// ! SIDEBAR
export function resetSidebar() {
  const sidebarList = document.getElementById("sidebarList");
  const allSpans = sidebarList.querySelectorAll("span[id]");
  allSpans.forEach((span) => {
    span.innerText = "🤷";
  });
}

export function updateSidebar(sidebar, view) {
  // evaluate-vocab
  // text-metrics
  // sentence-difficulty
  // sentence-rhythm
  // rate-sentiment
  // correct-text
  // longwords
  // spelling
  // sentence-difficulty

  if (!sidebar) return null;
  console.log({ view });

  switch (view) {
    case "evaluate-vocab":
      updateVocab(sidebar);
      break;

    case "text-metrics":
      updateMetrics(sidebar);
      break;

    case "sentence-difficulty":
      updateDifficulty(sidebar);
      break;

    case "longwords":
      updateLongwords(sidebar);
      break;

    case "sentence-rhythm":
      updateRhythm(sidebar);
      break;

    case "rate-sentiment":
      updateSentiment(sidebar);
      break;

    case "correct-text":
      updateCorrectText(sidebar);
      break;

    default:
      break;
  }
}

export function updateRhythm(sidebar) {
  console.log(typeof sidebar);
  if (!sidebar) return;

  // Sidebar 1?

  // Sidebar 2
  const entries = Object.entries(sidebar);
  entries.forEach(([key, value]) => {
    console.log({ key, value });
    const span = document.getElementById(key);
    if (span) span.innerText = value;
  });
}

export function updateMetrics(results) {
  // Get sidebar results back
  // Assume that ID is the same as OBJECT KEY

  if (!results) return null;

  const val = Object.entries(results);
  val.forEach((entry) => {
    const [key, value] = entry;
    const span = document.getElementById(key);
    if (span) {
      span.innerText = value;
    }
  });
}

export function updateCorrectText(sidebar) {
  if (!sidebar) return;
  const summary = {
    korrekthed: sidebar.Stavefejl + sidebar["Typisk anvendt forkert"] + sidebar.Grammatik + sidebar.Generelt,
    klarhed: sidebar.Fyldeord + sidebar.Dobbeltkonfekt,
    originalitet: sidebar.Kliche + sidebar.Anglicisme,
    udtryk: sidebar.Buzzword + sidebar.Formelt,
  };

  console.log({ summary });

  const val = Object.entries(summary);

  val.forEach((entry) => {
    const [key, value] = entry;
    const id = key.toLowerCase();
    const span = document.getElementById(id);
    if (span) span.innerText = value;
  });
}

function updateSentiment(sidebar) {
  if (!sidebar) return;

  // Sidebar 1
  if (sidebar.happyWords) {
    const arr = Array.from(sidebar.happyWords);
    console.log({ arr });

    const div = document.getElementById("topics-content");
    let html = `<ul class="list-group list-group-flush">`;

    const title = document.querySelector("#topics > span");
    title.innerText = arr.length || "...";

    arr.forEach((result) => {
      html += `<li class="list-group-item list-group-item-flash">
        <span class="badge rounded-pill bg-white text-dark border">${result[0]} (${result[1]})</span>
        </li>`;
    });

    html += `</ul>`;

    div.innerHTML = html;
  }

  // Sidebar 2
  document.getElementById("hedonometer").innerText = String(`${sidebar.emoji} - ${sidebar.happinessScore}/9`);
}

function updateLongwords(sidebar) {
  // Sidebar 1
  const arr = sidebar.arrOfLongWords;
  console.log({ arr });
  const div = document.getElementById("topics-content");
  let html = `<ul class="list-group list-group-flush">`;

  const title = document.querySelector("#topics > span");
  title.innerText = arr.length || "...";

  arr.forEach((result) => {
    html += `<li class="list-group-item list-group-item-flash">
        <span class="badge badge-pill bg-yellow">${result}</span>
        </li>`;
  });

  html += `</ul>`;

  div.innerHTML = html;

  // Sidebar 2
  document.getElementById("lix").innerText = sidebar.lix;
  document.getElementById("difficulty").innerText = sidebar.difficulty;
  document.getElementById("audience").innerText = sidebar.audience;
  document.getElementById("longwords").innerText = sidebar.noOfLongWords;
}

function updateVocab(sidebar) {
  console.log({ sidebar });

  // Sidebar 1
  const values = Object.values(sidebar.results);
  const div = document.getElementById("topics-content");
  let html = `<ul class="list-group list-group-flush">`;

  const red = values.filter((x) => x.color === "red");
  const yellow = values.filter((x) => x.color === "yellow");
  const green = values.filter((x) => x.color === "green");

  const title = document.querySelector("#topics > span");
  title.innerText = values.length || "...";

  [red, yellow, green].forEach((color) => {
    color.forEach((result) => {
      html += `<li class="list-group-item list-group-item-flash">
        <span class="badge badge-pill bg-${result.color}">${result.label}</span>
        ${result.word}`;

      if (result?.count) {
        html += `<span class="badge badge-pill bg-light text-dark">${result.count}</span>`;
      }

      html += `</li>`;
    });
  });

  html += `</ul>`;

  div.innerHTML = html;

  // Sidebar 2
  document.getElementById("unique").innerText = sidebar.numUniqueWords || "...";
  document.getElementById("uncommon").innerText = sidebar.numUncommonWords || "...";
  document.getElementById("overused").innerText = sidebar.numOverusedWords || "...";
}

// ! MODALS
// export function updateModals() {
//   const uniqueWordsList = document.getElementById("uniqueWordsList");
//   const rareWordsList = document.getElementById("rareWordsList");
//   const frequentWordsList = document.getElementById("frequentWordsList");

//   uniqueWordsList.innerHTML = "";
//   const allUniqueWords = JSON.parse(localStorage.getItem("uniqueWords"));
//   allUniqueWords.forEach((word) => {
//     uniqueWordsList.innerHTML += `<span class='badge text-dark stat mx-2'>${word}</span>`;
//   });

//   rareWordsList.innerHTML = "";
//   const allUncommonWords = localStorage.getItem("uncommonWords");
//   allUncommonWords.forEach((word) => {
//     rareWordsList.innerHTML += `<span class='badge text-dark stat mx-2'>${word}</span>`;
//   });

//   frequentWordsList.innerHTML = "";
//   const allOverusedWords = localStorage.getItem("overusedWords");
//   allOverusedWords.forEach((word) => {
//     frequentWordsList.innerHTML += `<span class='badge text-dark stat mx-2'>${word}</span>`;
//   });
// }
