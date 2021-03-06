import * as util from "./util";

import { Alert, Button, Collapse, Dropdown, Modal, Popover, Tab, Toast, Tooltip } from "bootstrap";
// import $ from "jquery";
import EditorJS from "@editorjs/editorjs";

// ! On init
// Get options from storage, if any.
const currentView = document.getElementById("current-view");
const options = JSON.parse(localStorage.options) || {};
const view = options?.view || "general";
// currentView.innerText = view;
// console.log(view);

const spinner = document.getElementById("spinner");
const spinner2 = document.getElementById("spinner2");

// Popovers & Toasts
setInterval(initializePopovers(), 1000);
util.initToasts();

// ! Editor
const editorData = util.getEditorData();
const editor = new EditorJS({
  holder: "editorjs",
  tools: {},

  onReady: () => {
    console.log("Editor.js is ready to work!");

    // Add markup
    analyzeBtn.addEventListener("click", async () => {
      const response = await analyzePage();

      // editor.render(editor);
      // editor.render(JSON.parse(localStorage.formatted));
    });

    const gptBtn = document.getElementById("gptBtn");
    gptBtn.addEventListener("click", async () => {
      console.log("GPT Button clicked");
      generateNextSentence();
    });

    // Remove markup
    const removeMarkupBtn = document.getElementById("removeMarkupBtn");
    removeMarkupBtn.addEventListener("click", () => {
      removeMarkup();
    });

    // Restore data
    const restoreBtn = document.getElementById("restoreBtn");
    restoreBtn.addEventListener("click", () => {
      restoreData();
    });
  },

  onChange: () => {
    editor.save().then((data) => {
      // Change to storage on server
      localStorage.editor = JSON.stringify(data);
    });
  },

  autofocus: false,
  placeholder: util.generatePlaceholder(),
  data: editorData,
});

async function analyzePage() {
  console.trace("Analyzing page ...");
  util.readEditSwitch(editor, spinner, "read");

  const saved = await editor.save();

  // Local storage backup ...
  util.updateLocalStorage("editor", JSON.stringify(saved));

  // Get options
  const options = JSON.parse(localStorage.options) || {};
  const { view = "correct-text" } = options;

  console.log(`???? Sending to ... /api/${view}`);
  const response = await util.postRequest(`./api/${view}`, { input: saved, options });
  console.log("??? Received response!", response);
  localStorage.formatted = JSON.stringify(response.editor);

  // Render editor, if there is an editor response
  if (response.editor) await editor.render(response.editor);
  console.log(response.editor);

  // Update Sidebar 1
  if (response.sidebar) util.updateSidebar(response.sidebar, view);

  // Enable the editor ...
  util.readEditSwitch(editor, spinner, "edit");

  // Re-init
  initializePopovers();

  return response;
}

// Remove markup from page
async function removeMarkup() {
  // Save and render to remove markup, apparently.
  const saved = await editor.save();
  await editor.render(saved);
  localStorage.editor = JSON.stringify(saved);
}

async function restoreData() {
  const data = util.getEditorData();
  await editor.render(data);
}

async function generateNextSentence() {
  // Remove markup like the highlights for any previously generated sentences.
  await removeMarkup();

  console.log("Generating next sentence with GPT-3 ...");
  util.readEditSwitch(editor, spinner2, "read");

  const saved = await editor.save();
  console.log("Saved: ", saved.blocks.length);

  // Get options
  const options = JSON.parse(localStorage.options) || {};

  // Get the latest block of the editor
  const block = saved.blocks[saved.blocks.length - 1];

  // Get the latest block's text
  let text = "";

  try {
    text = block.data.text;
  } catch (error) {
    console.log("No text to generate from");
    return;
  }

  console.log("Text before ... ", text);
  if (text.length > 220) text = text.substring(text.length - 220, text.length);
  console.log("Text after ... ", text);

  const response = await util.postRequest("/api/gpt", { prompt: text, options });
  let completion = response.completion;

  // Wrap completion in a span
  completion = `<span class='purple'>${completion}</span>`;

  // update editor with completion
  saved.blocks[saved.blocks.length - 1].data.text += completion;

  await editor.render(saved);
  const stored = await editor.save();
  localStorage.editor = JSON.stringify(stored);

  // Enable the editor ...
  util.readEditSwitch(editor, spinner2, "edit");
}

function initializePopovers() {
  const popoverTriggerList = [].slice.call(document.querySelectorAll('#editorjs [data-bs-toggle="popover"]'));
  popoverTriggerList.map((popoverTriggerEl) => {
    new bootstrap.Popover(popoverTriggerEl, {
      trigger: "hover focus",
      placement: "auto",
      html: true,
    });
  });
}

// Sidebar :: Add an event listener to all. If clicked, update the view setting and fire analyzePage().
const headings = ["Generelt", "Forslag", "Ordforr??d", "L??sbarhed", "Tekstrytme", "Sentiment", "S??tningsanalyse"];
headings.forEach((heading) => {
  const dom = document.querySelector(`#heading${heading} > button`);
  dom.addEventListener("click", async () => {
    console.log(`???? ${heading} clicked ...`);

    // Only run if sidebar is not already open
    const collapse = document.querySelector(`#heading${heading} + .accordion-collapse`);
    if (!collapse.classList.contains("show")) {
      // Update options with view
      const options = localStorage.options ? JSON.parse(localStorage.options) || {} : {};
      options.view = dom.getAttribute("name");
      localStorage.options = JSON.stringify(options);

      // Run analyze page
      await analyzePage();
    }
  });
});

// TODO : Connection between content area and sidebars
const btnShowSidebar = document.querySelector("#showSidebar");
const sectionSidebar = document.querySelector("#sidebar");
const sectionContent = document.querySelector("#content");

btnShowSidebar.addEventListener("click", () => {
  sectionSidebar.classList.toggle("mobile");
  sectionContent.classList.toggle("mobile");
  btnShowSidebar.classList.toggle("mobile");
});
