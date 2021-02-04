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
  // TODO More cleaning required? More test cases needed.
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

  if (lix >= 55) return "Mellemsvær";
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
    return { newSentence: s, hard: 0, vhard: 0 };
  } else if (level >= 15 && level < 21) {
    return { newSentence: `<span class="hard">${s}</span>`, hard: 1, vhard: 0 };
  } else if (level >= 21) {
    return { newSentence: `<span class="vhard">${s}</span>`, hard: 0, vhard: 1 };
  } else {
    return { newSentence: s, hard: 0, vhard: 0 };
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
  let processedString, i;

  processedString = removeTags(inputString); // 1. Remove all tags
  processedString = processedString.replace(/[.,\/#!?"'$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase(); // 2. Remove all punctuation & convert to lowercase
  let processedWordsArray = processedString.split(/\s+/).filter((s) => s.length > 0); // 3. Split by words
  const arrLength = processedWordsArray.length;
  for (i = 0; i < arrLength; i++) {
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

// ! Statistical functions

function calculateMean(inputArray) {
  let sum,
    i,
    arrLength = inputArray.length;
  for (i = 0; i < arrLength; i++) {
    const number = inputArray[i];
    sum += number;
  }
  return sum / inputArray.length;
}

function calculateVariance(inputArray, mean) {
  let variance = 0,
    i,
    arrLength = inputArray.length;

  for (i = 0; i < arrLength; i++) {
    const number = inputArray[i];
    const difference_squared = Math.pow(number - mean, 2);
    variance += difference_squared;
  }

  variance = Math.round(variance / inputArray.length);
  return variance;
}

function getUniqueWords(inputStringArray) {
  if (inputStringArray.length <= 1) {
    return inputStringArray;
  } else {
    if (inputStringArray[0].length > 1) {
      let set = new Set(inputStringArray.map(JSON.stringify));
      let arr2 = Array.from(set).map(JSON.parse);
      return arr2.sort(compareSecondColumn);
    } else {
      return inputStringArray.sort().filter(function (v, i, o) {
        return v !== o[i - 1];
      });
    }
  }

  function compareSecondColumn(a, b) {
    if (a[1] === b[1]) {
      return 0;
    } else {
      return a[1] > b[1] ? -1 : 1;
    }
  }
}

function getRareWords(inputStringArray) {
  // frequencyFile from global scope
  let rareWordsArray = [];

  // * Loop through each word in the array
  let i,
    arrLength = inputStringArray.length;
  for (i = 0; i < arrLength; i++) {
    const word = inputStringArray[i];
    if (word !== undefined) {
      // * Check the word against the frequency file
      let rarity = [];
      rarity = frequencyFile.filter(function (value, index) {
        return value[1] == word;
      });

      // * If there is a match, rarity.length will be >0
      if (rarity !== [] && rarity.length > 0) {
        // * Allow it to be considered rare if it's not in the top 5000
        const rareScore = rarity[0][3];
        if (parseInt(rareScore) > 5000) rareWordsArray.push(word);
      } else {
        // * If there is no match, consider it a rare word
        rareWordsArray.push(word);
      }
    }
  }
  return rareWordsArray;
}

function rateHappyWords(inputStringArray) {
  // hedonometerFile from global scope
  let happyWordsArray = [];

  // * Loop through each word in the array
  let i;
  const arrLength = inputStringArray.length;
  for (i = 0; i < arrLength; i++) {
    const word = inputStringArray[i];

    // * Check the word against the hedonometer file [Cols: ID, Original, EN, DA, Val, Std]
    const foundValue = hedonometerFile.filter(function (value, index) {
      return value[3] == word;
    });

    // * Check if there is a match
    if (foundValue.length > 0 && foundValue !== undefined) {
      happyWordsArray.push([foundValue[0][3], foundValue[0][4], foundValue[0][5]]);
    }
  }

  return happyWordsArray;
}
