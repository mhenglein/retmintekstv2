"use strict";

// Single word (misspelling) vs. multiple words (phrases)
// Generalized function for highlighting -- mostly the mechanism by which you find & replace
// Advanced: Remove HTML, remember where it was taken from, and then reinsert it. But necessary anymore?
// Typescript
// Move away from red/yellow/blue
// Grammarly has Correctness (red), Clarity (blue), Engagement? (green), Delivery (blue)

function analyzeText(text, dict, findAndReplaceArray) {
  // Take a string of text (usually a sentence), a dictionary, and an array as input
  // Returns a string (unchanged if no match); otherwise the string will have IDs in it and the array will indicate how to bring in the changes

  // ! Setup - Defining misc variables
  // misspellingsFile from global scope
  let i;
  let [red, yellow, blue] = [0, 0, 0];

  if (!text || !dict) console.log("Error in the first part of the analyzeText function; missing text or dictionary");

  // ! Step 1 - Misspellings (DSL)
  // Loop through the text and see if there are any matches in the misspellings file

  // * Split into array of clean words
  let textForAnalysis = removePunctuation(removeTags(text).toLowerCase()); // Prepare text
  let textArray = splitStringToArray(textForAnalysis).sort();
  textArray = Array.from(new Set(textArray)); // Remove duplicates  - just to speed things up

  // * Compare all words against misspellings file
  const allWordsLength = textArray.length;

  for (i = 0; i < allWordsLength; i++) {
    const specificWord = textArray[i];

    let replacementWord = misspellingsFile[specificWord];

    // * If there was a match, proceed to generate the replacement span
    let replaceWithThis = "";
    if (replacementWord != undefined && replacementWord.length > 0) {
      const popover = `<span class='badge bg-danger'><s>${specificWord}</s> ${replacementWord}</span><br/><small class='small'>Kilde: Det Danske Sprog- og Litteraturselskab</small>`;
      replaceWithThis = ` <span class="red" data-bs-toggle="popover" data-bs-html="true" data-bs-original-title="Stavefejl" data-bs-content="${popover}">${specificWord}</span> `;

      // * Add the ID-value pair to the replacement array; and replace value with ID in the main text
      const id = ` ${String(randomIdGenerator())} `;
      findAndReplaceArray.push([id, replaceWithThis]);
      text = text.replaceAll(specificWord, id);

      // * Spelling errors are a red mistake
      red++;
    }
  }

  // ! Step 2 - Main routine (Own list)
  // Mimicking the regex boundary (which doesn't include ÆÆÅ)
  const b1 = "(\\s|\\.|\\,|\\!|\\?|\\(|\\)|\\'|\\\"|^)";
  const b2 = "(\\s|\\.|\\,|\\!|\\?|\\(|\\)|\\'|\\\"|$)";

  // Loop through the dictionary & see if there are any matches in the text.
  const dictLength = dict.length;
  for (i = 0; i < dictLength; i++) {
    let [regex, type, popover, i_case, b_left, b_right] = [
      dict[i][1],
      dict[i][2],
      dict[i][3],
      dict[i][4],
      dict[i][5],
      dict[i][6],
    ];

    let searchString = regex;
    if (b_left === 1) searchString = b1 + searchString;
    if (popover === null) popover = "";
    if (b_right === 1) searchString = searchString + b2;
    searchString = `(${searchString})`;

    let regexString;
    i_case === 0 ? (regexString = new RegExp(searchString, "g")) : (regexString = new RegExp(searchString, "gi"));

    // Run the test
    let checkIfMatch = regexString.test(text);

    // Only proceed if there is a match
    if (checkIfMatch) replacePhrase();

    // ! Internal function to replace
    function replacePhrase() {
      // Regex "Last Match" (Works on Node v10.0+ :: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/lastMatch)
      let textMatch = RegExp["$&"];
      textMatch = textMatch.trim();

      textForPopoverTitle = textMatch.replace(/[.,\/#!?"'$%\^&\*;:{}=\_`~()]/g, "");

      // Colour
      let colour = typeSwitch(type);
      if (colour === "yellow") yellow++;
      if (colour === "red") red++;
      if (colour === "blue") blue++;

      let popoverTitle = `${type} <span class='badge bg-${colour} ms-2'>${textForPopoverTitle}</span>`;

      let replacementPhrase = ` <span class="${colour}" 
        data-bs-toggle="popover" 
        data-bs-original-title="${popoverTitle}"
        data-bs-html="true" 
        data-bs-content="${popover}">${textMatch}</span> `;

      // Create array with unique IDs and replacement HTML strings, with spaces surrounding it
      let id = ` ${String(randomIdGenerator())} `;
      findAndReplaceArray.push([id, replacementPhrase]);

      // Replace the offending bit of text with an ID so as to avoid re-running this process on the popover text.
      text = text.replaceAll(regexString, id);

      // Run a new search; re-run function if yes
      // ? No need for this after I switched to ReplaceAll
      regexString = new RegExp(searchString, "i");
      checkIfMatch = regexString.test(text);
      if (checkIfMatch) replacePhrase();
    }
  }

  // ! Step 3 - Reconvert
  text = reconvertText(text, findAndReplaceArray);

  // ! Step 4 - Return JSON
  // TODO Also return the type of error?
  return { text: text, red: red, yellow: yellow, blue: blue };
}

function reconvertText(inputText, replacementArray) {
  const arrayLength = replacementArray.length;
  let outputText = inputText;

  // * Check if there is anything to replace
  if (replacementArray != undefined && arrayLength > 0) {
    // * Loop through replacements
    for (i = 0; i < arrayLength; i++) {
      const replacementPhrase = new RegExp(replacementArray[i][0], "g"); // 0 is the ID
      // Test if the text contains the offending ID
      const regexTest = replacementPhrase.test(inputText);
      if (regexTest) outputText = outputText.replace(replacementPhrase, replacementArray[i][1]); // 1 is the <span>text</span>
    }
  }
  return outputText;
}

function typeSwitch(type) {
  switch (type.toLowerCase()) {
    case "kliche":
      return "yellow";
    case "anglicisme":
      return "yellow";
    case "stavefejl":
      return "red";
    case "dobbeltkonfekt":
      return "red";
    case "typisk anvendt forkert":
      return "blue";
    case "grammatik":
      return "red";
    case "formelt":
      return "yellow";
    case "buzzword":
      return "yellow";
    case "fyldeord":
      return "blue";
    case "generelt":
      return "red";
    default:
      console.log("Switch statement in replaceRex went all the way to the default statement for the cssClass");
      return "grey";
  }
}

function randomIdGenerator() {
  // Used to generate a random ID for the Replacement Pairs array.
  // ? Why random and not sequential??
  let a = "";
  for (let i = 0; i < 6; i++) {
    a = a + String(Math.floor(Math.random() * 9) + 1);
  }
  return Number(a);
}
