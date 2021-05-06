// 'use strict';

/**
 * Removes double-spacing and extra whitespace from a string
 * @param  {[String]} p Ideally a string input, otherwise will be converted
 */
function removeDoubleSpacing(p) {
  try {
    return String(p).replace(/\s+/g, " ");
  } catch (err) {
    console.log(err);
    return p;
  }
}

/**
 * Removes HTML tags and the ever-annoying &nbsp; etc.
 * @param  {[String]} p Ideally a string input, otherwise will be converted
 */
// function removeHTML(p) {
//   try {
//     return String(p).replace(/<[^>]*(>|$)|&nbsp;|&zwnj;|&raquo;|&laquo;|&gt;/g, " ");
//   } catch (err) {
//     console.log(err);
//     return p;
//   }
// }

/**
 * Counts the no. of sentences in a string of text
 * @param  {[String]} p Paragraph of text
 */
function getSentences(p) {
  let s = removeDoubleSpacing(p);
  // TODO get array of sentences -- # of sentences via .length
  return s
    .replace(/\w[.?!:;](\s|$)/g, "$1|x") //  Replace all 'sentence stoppers' with a pipe symbol
    .split("|x") // Split by pipe
    .filter((x) => x.length > 0).length;
}

/**
 * ! Deprecated
 * Takes an input string and splits it by sentence
 * How it works: Use regex to replace [.!?:] with a pipe, plus an x (|x); split by the pipe-x, which will also consume it.
 * (In the event of issues, replace pipe with more obscure separator)
 * @param  {[String]} p Input string, e.g. a paragraph with several sentences
 */
function getSentencesFromText(p) {
  return p
    .replace(/([.?!:])\s*(?=[A-Z|Æ|Ø|Å])/g, "$1|x")
    .split("|x")
    .filter((s) => s.length > 0);
}

/**
 * Counts the no. of characters in a string of text (both w/ and w/o spaces)
 * @param  {[String]} p Paragraph of text
 */
function countCharacters(p) {
  const c = removeHTML(p); // Remove common HTML tags
  const cw = c.split(" ").join("").length;
  return { charsplus: c.length, chars: cw };
}

/**
 * Calculate the LIX-score
 * @param  {[Number]} words All words
 * @param  {[Number]} sentences All sentences
 * @param  {[Number]} longWords All long words (<6 chars)
 */
function calcLix(words, sentences, longWords) {
  // If no words, bail
  if (words === 0) {
    return 0;
  } else {
    // Lix formula
    let lix = Math.round(words / sentences + (longWords * 100) / words);
    return lix <= 0 ? 0 : lix;
  }
}

/**
 * Calculate the reading difficulty associated with the LIX score
 * @param  {[Number]} lix LIX-score
 * @param  {[Number]} words Number of words
 * @param  {[Number]} sentences Number of sentences
 */
function lixDifficulty(lix, words, sentences) {
  // If too little data, return 'unknown'
  if (words < 10 || sentences < 3) {
    return "Ukendt";
  }

  if (lix >= 55) return "Mellemsvær";
  else if (lix >= 45 && lix < 55) return "Svær";
  else if (lix >= 35 && lix < 45) return "Middel";
  else if (lix >= 25 && lix < 35) return "Let";
  else return "Let for alle";
}

/**
 * Calculate the estimated reading & speaking time
 * @param  {[Number]} words Number of words
 */
function calcTime(words) {
  // Assume 250 words in one minute ("Flot flydende læsning 120 ord pr. minut")

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

/**
 * Calculate the reading difficulty level on a sentence level --
 * used for assessing individual sentences (and highlighting with colour)
 * @param  {[Number]} letters Number of letters
 * @param  {[Number]} words Number of words
 * @param  {[Number]} sentences Number of sentences
 */
function calculateLevel(letters, words, sentences) {
  // If no words or sentences, bail
  if (words === 0 || sentences === 0) {
    return 0;
  }
  let level = Math.round(4.71 * (letters / words) + (0.5 * words) / sentences - 21.43);
  return level <= 0 ? 0 : level;
}

/**
 * Based on difficulty of sentence, this provides the HTML output
 * Returns the new sentence and whether it was "hard" or "very hard"
 * @param  {[Number]} letters Number of letters
 * @param  {[Number]} words Number of words
 * @param  {[Number]} sentences Number of sentences
 */
function assignSentenceByDifficulty(words, level, s) {
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

/**
 * Based on length of a sentence, this provides the HTML output
 * Returns the new sentence and its "length category"
 * @param  {[String]} s The input sentence to be wrapped in tags
 * @param  {[Number]} length The length of the sentence (in number of words)
 */
function assignSentenceByLength(s, length) {
  switch (length) {
    case value <= 3:
      return { newSentence: `<span class="s1to3">${s}</span>`, s1to3: 1 };
    case value <= 6:
      return { newSentence: `<span class="s4to6">${s}</span>`, s4to6: 1 };
    case value <= 10:
      return { newSentence: `<span class="s7to10">${s}</span>`, s7to10: 1 };
    case value <= 18:
      return { newSentence: `<span class="s11to18">${s}</span>`, s11to18: 1 };
    case value <= 26:
      return { newSentence: `<span class="s19to26">${s}</span>`, s19to26: 1 };
    case value > 26:
      return { newSentence: `<span class="s26plus">${s}</span>`, s26plus: 1 };
    default:
      break;
  }
}

/**
 * Remove all punctuation
 * @param  {[String]} p Input string, e.g. a paragraph with several sentences
 */
function removePunctuation(p) {
  try {
    return p.replace(/[.,\/#!?"$%\^&\*;:{}=\_`~()]/g, " ").replace("  ", " ");
  } catch (err) {
    console.log(err);
    return p;
  }
}
// Inspiration via https://stackoverflow.com/questions/4328500/how-can-i-strip-all-punctuation-from-a-string-in-javascript-using-regex

/**
 * Split string by  whitespace (\s)
 * ! Unclear why I need this
 * @param  {[String]} p Input string, usually a paragraph with several sentences
 */
function splitStringToArray(p) {
  return p.split(/\s+/).filter((s) => s.length > 0);
}

/**
 * Takes as an input an array of words and returns an array with the lemmas of the words
 * @param  {[Array]} word Input word
 * @param  {[Array]} lemmaDict via global scope´
 */
function lemmafyWord(word) {
  const found = lemmaDict[word];
  // If the word is not in the list, bail
  if (found == undefined) {
    return word;
  } else {
    return found;
  }
}

/**
 * Removes a list of pre-specified words from the text
 * @param  {[Array]} text Text for analysis
 * @param  {[Array]} stopord via global scope´
 */
function removeAllStopord(text) {
  const stopOrdLength = stopord.length;
  for (let i = 0; i < stopOrdLength; i++) {
    const regexString = new RegExp(`\\s${stopord[i]}\\s`, "ig");
    text = text.replaceAll(regexString, " ");
  }
  text = text.replaceAll("  ", " ");
  return text;
}

/**
 * Title-case a word
 * @param  {[String]} word A string of text, like a word
 */
function titleCaseWord(word) {
  return word[0].toUpperCase() + word.slice(1);
}

/**
 * Map a value (number) to a corresponding emoji
 * @param  {[Number]} score A scoring on a scale from 1-9
 */

function convertValToEmoji(score) {
  try {
    let meanValue = Number(score);
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

/**
 * Takes an input array of words and remove all duplicates
 * @param  {[Array]} arr Input array of words
 */
function getUniqueWords(arr) {
  // If only 1 word, bail
  if (arr.length <= 1) {
    return arr;
  } else {
    if (arr[0].length > 1) {
      // Convert to Set and then back to Array
      let set = new Set(arr.map(JSON.stringify));
      let arr2 = Array.from(set).map(JSON.parse);
      return arr2.sort(compareSecondColumn);
    } else {
      return arr.sort().filter(function (v, i, o) {
        return v !== o[i - 1];
      });
    }
  }
}

function compareSecondColumn(a, b) {
  if (a[1] === b[1]) {
    return 0;
  } else {
    return a[1] > b[1] ? -1 : 1;
  }
}

/**
 * Evaluate words in array if they're "rare" (i.e. in top X)
 * @param  {[Array]} arr Input array of words
 * @param  {[Number]} threshold Top X words, default of 5000
 * frequencyFile from global scope
 */
function getRareWords(arr, threshold = 5000) {
  let rareWordsArray = [];

  // Loop through each word in the array
  let i;
  for (i = 0; i < arr.length; i++) {
    const word = arr[i];
    if (word !== undefined) {
      // Check the word against the frequency file
      let rarity = [];
      rarity = frequencyFile.filter(function (value, index) {
        return value[1] == word;
      });

      // If there is a match, rarity.length will be >0
      if (rarity !== [] && rarity.length > 0) {
        // Allow it to be considered rare if it's not in the top X
        const rareScore = rarity[0][3];
        if (parseInt(rareScore) > threshold) rareWordsArray.push(word);
      } else {
        // If there is no match, consider it a rare word
        rareWordsArray.push(word);
      }
    }
  }
  return rareWordsArray;
}

/**
 * Generate array of words found in the hedonometer file and their associated values
 * @param  {[Array]} arr Input array of words
 * hedonometerFile from global scope
 */
function rateHappyWords(arr) {
  let happyWordsArray = [];

  // Loop through each word in the array
  let i;
  for (i = 0; i < arr.length; i++) {
    const word = arr[i];

    // Check the word against the hedonometer file [Cols: ID, Original, EN, DA, Val, Std]
    const foundValue = hedonometerFile.filter(function (value, index) {
      return value[3] == word;
    });

    // Check if there is a match
    if (foundValue.length > 0 && foundValue !== undefined) {
      happyWordsArray.push([foundValue[0][3], foundValue[0][4], foundValue[0][5]]);
    }
  }

  return happyWordsArray;
}

/**
 * * * * * * * * * * * * * * * * * * *
 * * * * Statistical functions * * * *
 * * * * * * * * * * * * * * * * * * *
 */

/**
 * Take array of numbers as input and calculate a mean
 * @param  {[Array]} arr A scoring on a scale from 1-9
 */
function calculateMean(arr) {
  let sum, i;
  for (i = 0; i < arr.length; i++) {
    const number = arr[i];
    sum += number;
  }
  return sum / arr.length;
}

/**
 * Take array of numbers as input and calculate a variance
 * @param  {[Array]} arr A scoring on a scale from 1-9
 */
function calculateVariance(arr, mean) {
  let i,
    variance = 0;

  for (i = 0; i < arr.length; i++) {
    const number = arr[i];
    const difference_squared = Math.pow(number - mean, 2);
    variance += difference_squared;
  }

  variance = Math.round(variance / arr.length);
  return variance;
}
