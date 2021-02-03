function analyzeText(text, dict, replacementPairs) {
  // misspellingsFile from global scope
  let red = 0,
    yellow = 0,
    blue = 0;

  // Take a string of text (usually a sentence), a dictionary, and an array as input
  // Returns a string (unchanged if no match); otherwise the string will have IDs in it and the array will indicate how to bring in the changes

  if (!text || !dict) console.log("Error in the first part of the analyzeText function; missing text or dictionary");

  // Mimicking the regex boundary (which doesn't include ÆÆÅ)
  const b1 = "(\\s|\\.|\\,|\\!|\\?|\\(|\\)|\\'|\\\"|^)";
  const b2 = "(\\s|\\.|\\,|\\!|\\?|\\(|\\)|\\'|\\\"|$)";

  // ! Misspellings
  // Loop through the text and see if there are any matches in the misspellings file
  let allWords = text.split(/\s+/).filter((s) => s.length > 0).replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()]/g, "");.toLowerCase() // 1. Split by words
  console.log("all words", allWords);

  // 2. Loop through all words
  // for (let i = 0; i < allWords.length; i++) {
  //   const word = allWords[i];

  //   // 3. Check against file
  //   const lookupWord = misspellingsFile.filter(function (value, index) {
  //     return value[0] == word;
  //   });
  //   console.log(lookupWord);
  //   let replacementString;
  //   if (lookupWord !== undefined && lookupWord.length > 0) {
  //     const popover = `<p><span class="bg bg-danger"><del>${lookupWord[0]}</del> ${lookupWord[1]}</span></p>
  //   <p><small>Kilde: Det Danske Sprog- og Litteraturselskab</small></p>`;
  //     replacementString = ` <span class="red"
  //     data-bs-toggle="popover"
  //     data-bs-original-title="Stavefejl"
  //     data-bs-content="${popover}">${word}</span> `;
  //   }

  //   const idSpelling = ` ${String(randomIdGenerator())} `;
  //   replacementPairs.push([idSpelling, replacementString]);
  //   text = text.replace(word, idSpelling);
  // }

  // ! Main routine
  // Loop through the dictionary & see if there are any matches in the text.
  for (let k = 0; k < dict.length; k++) {
    let regex, type, popover, i_case, b_left, b_right;
    [regex, type, popover, i_case, b_left, b_right] = [
      dict[k][1],
      dict[k][2],
      dict[k][3],
      dict[k][4],
      dict[k][5],
      dict[k][6],
    ];

    let searchString = regex;
    if (b_left === 1) searchString = b1 + searchString;
    if (popover === null) popover = "";
    if (b_right === 1) searchString = searchString + b2;
    searchString = `(${searchString})`;

    let rex;
    i_case === 0 ? (rex = new RegExp(searchString)) : (rex = new RegExp(searchString, "i"));

    // Run the test
    let rexMatch = rex.test(text);

    // Only proceed if there is a match
    if (rexMatch) replaceRex();

    function replaceRex() {
      // Regex "Last Match" (Works on Node v10.0+ :: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/lastMatch)
      let matchedRex = RegExp["$&"];
      matchedRex = matchedRex.trim();

      let colour = typeSwitch(type);
      if (colour === "yellow") yellow++;
      if (colour === "red") red++;
      if (colour === "blue") blue++;

      let spanString = ` <span class="${colour}" 
      data-bs-toggle="popover" 
      data-bs-original-title="${type}" 
      data-bs-content="${popover}">${matchedRex}</span> `;

      // Create array with unique IDs and replacement HTML strings, with spaces surrounding it
      let id = ` ${String(randomIdGenerator())} `;
      replacementPairs.push([id, spanString]);

      // Replace the offending bit of text with an ID so as to avoid re-running this process on the popover text.
      text = text.replace(rex, id);

      // Run a new search; re-run function if yes
      rex = new RegExp(searchString, "i");
      rexMatch = rex.test(text);
      if (rexMatch) replaceRex();
    }
  }

  return { text: text, red: red, yellow: yellow, blue: blue };
}

function reconvertBlock(text, replacementPairs) {
  let rex_replacement;
  let rex_test;

  let convertedText = text;

  // Check if there is anything to replace
  if (replacementPairs !== undefined && replacementPairs.length > 0) {
    // Loop through replacements (0 is the ID, 1 is the <span>text</span>)
    for (let x = 0; x < replacementPairs.length; x++) {
      rex_replacement = new RegExp(replacementPairs[x][0], "g");

      // Test if the text contains the offending ID
      rex_test = rex_replacement.test(convertedText);
      if (rex_test) convertedText = convertedText.replace(rex_replacement, replacementPairs[x][1]);
    }

    return convertedText;
  }
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

function getUniqueWords(inputStringArray) {
  try {
    return inputStringArray.sort().filter(function (v, i, o) {
      return v !== o[i - 1];
    });
  } catch (err) {
    console.log("Error in getting unique words from string", err);
  }
}

function getRareWords(inputStringArray) {
  // frequencyFile from global scope
  let rareWordsArray;
  for (let i = 0; i < inputStringArray.length; i++) {
    const word = inputStringArray[i];
    const rarity = frequencyFile.filter(function (value, index) {
      return value[1] == word;
    });
    if (parseInt(rarity) <= 5000) rareWordsArray.push(rarity);
  }

  return rareWordsArray;
}

function rateHappyWords(inputStringArray) {
  let happyWordsArray;
  for (let i = 0; i < inputStringArray.length; i++) {
    const word = inputStringArray[i];
    const foundValue = hedonometerFile.filter(function (value, index) {
      return value[3] == word;
    });

    happyWordsArray.push([foundValue[i][3], foundValue[i][4], foundValue[i][5]]);
  }

  return happyWordsArray;
}
