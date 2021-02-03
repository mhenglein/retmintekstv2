// Utility functions

function countSentences(p) {
  let s = p
    .replace(/\w[.?!](\s|$)/g, "$1|x")
    .split("|x")
    .filter((s) => s.length > 0).length;

  return s;
}

function countWords(p) {
  let w = removeTags(p)
    .split(" ")
    .filter((n) => n != "");
  const lw = w.filter((s) => s.length > 6).length;
  const ws = w.length;

  return { words: ws, longWords: lw };
}

function countCharacters(p) {
  c = removeTags(p);
  cw = c.split(" ").join("").length;
  return { charsplus: c.length, chars: cw };
}

// * For analysis purposes we replace typical punctuation with full stops and other symbols with whitespace.
// TODO Assess if this is needed at all?
function cleanText(dirtyText) {
  return dirtyText.replace("&nbsp;", " ").replace("  ", " ");

  // return dirtyText.replace(/[\?!;:]/g, ".").replace(/[\,()"'!;\n\r]/g, " ");
}

function removeTags(html) {
  return html
    .replace("<b>", "")
    .replace("</b>", "")
    .replace("<i>", "")
    .replace("</i>", "")
    .replace(/<a.*">/g, "")
    .replace("</a>", "");
}

function calcLix(words, sentences, longWords) {
  if (words === 0) {
    return 0;
  } else {
    let lix = Math.round(words / sentences + (longWords * 100) / words);
    return lix <= 0 ? 0 : lix;
  }
}

function lixDifficulty(lix, words, sentences) {
  if (words < 10 || sentences < 3) {
    return "Ukendt";
  }

  if (lix >= 55) return "Meget svær";
  else if (lix >= 45 && lix < 55) return "Svær";
  else if (lix >= 35 && lix < 45) return "Middel";
  else if (lix >= 25 && lix < 35) return "Let";
  else return "Let for alle";
}

function calcTime(words) {
  // Assume 250 words in one minute
  // Flot flydende læsning 120 ord pr. minut

  const wpm = 250;
  const spm = 120;

  const timeToRead_decimal = words / wpm;
  const timeToRead = minTommss(timeToRead_decimal);

  const timeToSpeak_decimal = words / spm;
  const timeToSpeak = minTommss(timeToSpeak_decimal);

  function minTommss(minutes) {
    const sign = minutes < 0 ? "-" : "";
    const min = Math.floor(Math.abs(minutes));
    const sec = Math.floor((Math.abs(minutes) * 60) % 60);
    return sign + (min < 10 ? "0" : "") + min + ":" + (sec < 10 ? "0" : "") + sec;
  }

  return { readingtime: timeToRead, speakingtime: timeToSpeak };
}

function calculateLevel(letters, words, sentences) {
  if (words === 0 || sentences === 0) {
    return 0;
  }
  let level = Math.round(4.71 * (letters / words) + (0.5 * words) / sentences - 21.43);
  return level <= 0 ? 0 : level;
}

function evaluateSentence(words, level, s) {
  // Evaluates difficulty of a sentence
  // Returns a string
  if (words < 15) {
    return s;
  } else if (level >= 15 && level < 21) {
    // assistantData.hard++;
    return `<span class="hard">${s}</span>`;
  } else if (level >= 21) {
    // assistantData.vhard++;
    return `<span class="vhard">${s}</span>`;
  } else {
    return s;
  }
}

function getSentencesFromText(p) {
  // Takes an input string and splits it by sentence

  /* How it works: Use regex to replace [.!?:] with a pipe, plus an x (|x); split by the pipe-x, which will also consume it.
     In the event of issues, replace pipe with more obscure separator */

  let sentences = p
    .replace(/([.?!:])\s*(?=[A-Z|Æ|Ø|Å])/g, "$1|x")
    .split("|x")
    .filter((s) => s.length > 0);

  // Returns an array
  return sentences;
}

function lemmafy(inputString) {
  let processedString;

  processedString = removeTags(inputString); // 1. Remove all tags
  processedString = processedString.replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase(); // 2. Remove all punctuation & convert to lowercase
  let processedWordsArray = processedString.split(/\s+/).filter((s) => s.length > 0); // 3. Split by words
  for (let i = 0; i < processedWordsArray.length; i++) {
    // 4. Compare against lemma file
    processedWordsArray[i] = lemmafyWord(processedWordsArray[i]);
  }
  return processedWordsArray;
}

function lemmafyWord(inputWord) {
  // lemmaFile from global scope
  const lookUp = lemmaFile.filter(function (value, index) {
    return value[0] == inputWord;
  });

  if (lookUp === [] || lookUp[0] === undefined) {
    return inputWord;
  } else {
    return lookUp[0][1];
  }
}
