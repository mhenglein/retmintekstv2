// 'use strict';

class TextParser {
  text: string;
  original: string;
  chars: number;
  charsAndSpaces: number;
  words: Array<string>;
  avgWordLength: number;
  longWords: Array<string>;
  wordCount: number;
  longWordCount: number;
  frequentlyUsedWords: Array<string>;
  frequencyMap: Object;
  sentences: Array<string>;
  sentenceCount: number;
  sentenceVariance:number;
  sentenceStdDev: number;
  avgSentenceLength: number;
  lemmas: Array<string>;
  lix: number;
  lixAudience: string;
  let: any;
  lus: any;
  timeToRead: string;
  timeToSpeak: string;
  difficulty: number;
  rareWords: Array<string>;
  happy: Array<any>;


  constructor(s:string) {
    if (typeof s === "undefined" || !s.toString) {
      throw new Error("textParser only works with strings and values that can be coerced into a string");
    }
    this.text = s.toString();
    this.original = s.toString();
    this.words = [];
    this.lix = -1;
    this.happy = []
  }

  /**
   * Removes HTML tags and entities (such as non-breaking space, &nbsp;)
   */
  removeHTML() {
    this.text = this.text.replace(/<[^>]*(>|$)|&nbsp;|&zwnj;|&raquo;|&laquo;|&gt;/gi, " ");
    return this;
  }

  /**
   * Removes double-spacing (and n-spacing, e.g. "a    bc" -> "a bc")
   */
  removeDoubleSpacing() {
    this.text = this.text.replace(/\s+/g, " ");
    return this
  }

  removeNonLetters() {
  this.text = this.text.replace(/&amp;/g,"og").replace(/[\.,()"'!;\n\r]/g, " ").replace(/&amp;|&nbsp;|&zwnj;|&raquo;|&laquo;|&gt;/gi," ").replace("  ", " ")
  return this;
}

/**
 * Remove all punctuation
 */
removePunctuation() {
  this.text = TextParser.staticRemovePunctuation(this.text)
  return this;
  // Inspiration via https://stackoverflow.com/questions/4328500/how-can-i-strip-all-punctuation-from-a-string-in-javascript-using-regex
}

static staticRemovePunctuation(string:string) {
  return string.replace(/[.,\/#!?"$%\^\*;:{}«»=\_`~()]/g, " ").replace("  ", " ");
}

convLowerCase() {
  this.text = this.text.toLowerCase();
  this.words.forEach(word => {
    word = word.toLowerCase();
  })

  return this;
}

convUpperCase() {
  this.text = this.text.toUpperCase();
   this.words.forEach(word => {
    word = word.toUpperCase();
  })
  return this;
}

trimText() {
  this.text = this.text.trim();
  this.words.forEach(word => {
    word = word.trim()
  })
  return this
}

/**
 * Removes a list of pre-specified words from the text
 * @param  {[Array]} stopord via global scope´
 */
removeAllStopord(stopord:Array<string>) {
  for (let i = 0; i < stopord.length; i++) {
    const regexString = new RegExp(`\\s${stopord[i]}\\s`, "ig");
    this.text = this.text.replaceAll(regexString, " ");
  }
  this.text = this.text.replaceAll("  ", " ");
  return this.text;
}

// * Text manipulation
/**
 * Title-case a word
 */
titleCaseWord(word:string) {
  return word[0].toUpperCase() + word.slice(1);
}

  /**
   * Gets array of sentences
   */
 getSentences() {
  // this.removeHTML().removeDoubleSpacing()
  this.sentences = this.text
  .replace(/\w[.?!:;](\s|$)/g, "$1|x") //  Add |x to all sentence stoppers (hyphen not included)
  .split("|x") // Split by |x
  .filter((x) => x.length > 0);

  this.sentenceCount =this.sentences.length;

  return this.sentences;

}
// alt regex ([.?!:])\s*(?=[A-Z|Æ|Ø|Å])

/**
 * Returns array with all words; also separates out long words (default >6 letters or more)
 * Also counts number of words, both ALL and LONG
 * @param  {[Number]} threshold Threshold for what constitutes a long number
 * @return {[Array]}            Array of words (all)
 */
getWords(threshold = 6) {
  // TODO Remove weird lettering (e.g. «)
  this.words = this.text
    .split(/\s+/) // Split by (multiple) whitespace(s)
    .filter((n) => n != "");

  // Word count
  this.wordCount = this.words.length;

  // Long words
   this.longWords = this.words.filter((s) => s.length > threshold);
   this.longWordCount = this.longWords.length;

  return this.words;
}

/**
 * Takes an input array of words and remove all duplicates
 * @param  {[Array]} arr Input array of words
 */
getUniqueWords() {
  if (this.words.length === 0) this.getWords()

  // If only 1 word, bail
  if (this.words.length <= 1) {
    return this.words;
  } else {
    if (this.words[0].length > 1) {
      // Convert to Set and then back to Array
      const set = new Set(this.words.map((x) => JSON.stringify(x)));
      const arr = Array.from(set).map((x) => JSON.parse(x));
      this.words = arr.sort(TextParser.compareSecondColumn);
      return this.words;
    } else {
      this.words = this.words.sort().filter(function (v, i, o) {
        return v !== o[i - 1];
      });
      return this.words;
    }
  }
}

/**
 * Takes an input array of words and remove all duplicates
 * @param  {[Array]} stopord  Array of stopwords
 * @return {[Array]}          The most over-used words
 */
getFrequentWords(stopord:Array<string>) {

  // If the string hasn't been split into words, do so
  if (this.words.length === 0) this.getWords()
  
  let frequentWords:Array<string> = this.words;

  // Remove punctuation
  frequentWords.forEach((item, index) => {
    frequentWords[index] = TextParser.staticRemovePunctuation(frequentWords[index]).trim().toLowerCase();
  })

  // Only look at words that are at least 3 letters long && sort();
  const minCharLength = 3; 
  frequentWords = frequentWords.filter((x) => x.length>=minCharLength).sort();

  // Remove stopwords (stopord)
  for (let i = 0; i < stopord.length; i++) {
    frequentWords = frequentWords.filter(e => e !== stopord[i])
  }

  // Create freq. table
  let frequency:any = {};
  frequentWords.forEach(item => {
      frequency[item] = (frequency[item] || 0) + 1;
  });
  
  // Table stakes
  const minimumOccurences = 3;
  for (const key in frequency) {
    if (Object.prototype.hasOwnProperty.call(frequency, key)) {
      const element:number = Number(frequency[key])
      if (element < minimumOccurences) {
        delete frequency[key];
      }
    }
  }

  // Store frequency map in object
  this.frequencyMap = frequency;

  // Sortable table
  let sortable = Array.from(Object.entries(frequency))
  sortable.sort(TextParser.compareSecondColumn);
  let newSortable = sortable.map(s => s[0])

  // Take top X%
  const percentageThreshold:number =  0.35;
  const lengthOfArray = percentageThreshold*newSortable.length;

  const uniqueFrequentWords = newSortable.slice(0,lengthOfArray)
  this.frequentlyUsedWords = uniqueFrequentWords;

  return uniqueFrequentWords;

}

static compareSecondColumn(a:any, b:any) {
  if (a[1] === b[1]) {
    return 0;
  } else {
    return a[1] > b[1] ? -1 : 1;
  }
}

/**
 * Evaluate words in array if they're "rare" (i.e. in top X)
 * @param  {[Array]} rareWordsArr Input array of words
 * @param  {[Number]} threshold Top X words, default of 5000
 * frequencyFile from global scope
 */
getRareWords(frequencyList:Array<string>, threshold:number = 5000) {
  if (this.words.length === 0) this.getWords()

  // Loop through each word in the array
  for (let i = 0; i < this.words.length; i++) {
    const word = this.words[i];
    if (word !== undefined) {
      // Check the word against the frequency file
      let rarity = [];
      rarity = frequencyList.filter(function (v, i) {
        return v[1] == word;
      });

      // If there is a match, rarity.length will be >0
      if (rarity !== [] && rarity.length > 0) {
        // Allow it to be considered rare if it's not in the top X
        const rareScore = rarity[0][3];
        if (parseInt(rareScore) > threshold) this.rareWords.push(word);
      } else {
        // If there is no match, consider it a rare word
        this.rareWords.push(word);
      }
    }
  }
  return this.rareWords;
}

/**
 * Generate array of words found in the hedonometer file and their associated values
 * @param  {[Array]} arr Input array of words
 * hedonometerFile from global scope
 */
rateHappyWords(happinessList:Array<string>) {
  if (this.words.length === 0) this.getWords()

  // No hedonometer file provided, bail
  if (happinessList.length === 0) {
    console.log("ERR: No hedonometer lookup file provided")
    return this.words;
  }

  // Loop through each of the words
  for (let i = 0; i < this.words.length; i++) {
    const word = this.words[i];

    // Check the word against the hedonometer file [Cols: ID, Original, EN, DA, Val, Std]
    const foundValue = happinessList.filter(function (v, i) {
      return v[3] == word;
    });

    // Check if there is a match
    if (foundValue.length > 0 && foundValue !== undefined) {
      this.happy.push([foundValue[0][3], foundValue[0][4], foundValue[0][5]]);
    }
  }

  return this.happy;
}

// * Calculations

/**
 * Counts the characters in the string
 * @param  {[Boolean]} includeSpaces True by default; set to false to ignore spaces in the count
 * @return {[Number]} Number of characters
 */
countCharacters() {
  this.chars = this.text.length;
  this.charsAndSpaces = this.text.split(" ").join("").length;
}

/**
 * Calculate the LIX-number for the text
 * @param  {[Number]} words Default value is to call the getWords function and take the length;
 * @param  {[Number]} sentences Default value is to call the getSentences function and take the length;
 * @param  {[Number]} longWords Default value is to call the getLongWords function and take the length;
 * @return {[Number]} LIX-value
 */
calcLix() {
  if (this.words.length === 0) this.getWords()
  if (this.sentences.length === 0) this.getSentences()

  // * LIX
  // If no words, bail
  if (this.wordCount === 0) {
    this.lix = 0;
  } else {
    // Lix formula
    let lix = Math.round(this.wordCount / this.sentenceCount + (this.longWordCount * 100) / this.wordCount);
    this.lix = lix <= 0 ? 0 : lix;
  }

  // * Audience associated w/ LIX 
  // If too little data, return 'unknown'
  if (this.wordCount < 10 || this.sentenceCount < 3) {
    this.lixAudience = "Ukendt";
  } else if (this.lix >= 55) this.lixAudience = "Svær";
  else if (this.lix >= 45 && this.lix < 55) this.lixAudience = "Mellemsvær";
  else if (this.lix >= 35 && this.lix < 45) this.lixAudience  = "Middel";
  else if (this.lix >= 25 && this.lix < 35) this.lixAudience = "Let";
  else if (this.lix < 25 && this.lix >0) this.lixAudience = "Let for alle";
  else this.lixAudience = "Ukendt";

  return this.lix;

}

calcLet() {
  if (this.lix === -1) this.calcLix();
// TODO A by-product of LIX

}

calcAvgLengths() {
  if (this.words.length === 0) this.getWords()
  if (this.sentences.length === 0) this.getSentences()
  if (this.chars === 0) this.countCharacters()

  this.avgSentenceLength= Math.round(this.wordCount / this.sentenceCount); // Calculate the average sentence length
  this.avgWordLength = Math.round(this.chars / this.wordCount); // Calculate the average word length

  return this;
}

calcSentenceVariance() {
   if (this.sentences.length === 0) this.getSentences()
   this.calcAvgLengths();

   let sentenceLengths:Array<number> = [];
   this.sentences.forEach((sentence, index) => {
     sentenceLengths.push(sentence
    .split(/\s+/) // Split by (multiple) whitespace(s)
    .filter((n) => n != "")
    .length)
   }
   )

  const sentenceVariance = TextParser.calculateVariance(sentenceLengths, this.avgSentenceLength);

  this.sentenceVariance = sentenceVariance
  this.sentenceStdDev = Math.sqrt(sentenceVariance)

  return sentenceVariance;
}

/**
 * Calculate the estimated reading & speaking time
 * @param  {[Number]} words Number of words
 */
calcTime(wpm:number=250,spm:number=120) {
  if (this.words.length === 0) this.getWords()
  // Assume avg, 250 words per minute (reading) and 120 per minute (speaking)

  const timeToRead_decimal = this.wordCount / wpm;
  const timeToRead = minTommss(timeToRead_decimal);

  const timeToSpeak_decimal = this.wordCount / spm;
  const timeToSpeak = minTommss(timeToSpeak_decimal);

  function minTommss(minutes:number) {
    const sign = minutes < 0 ? "-" : "";
    const min = Math.floor(Math.abs(minutes));
    const sec = Math.floor((Math.abs(minutes) * 60) % 60);
    return sign + (min < 10 ? "0" : "") + min + ":" + (sec < 10 ? "0" : "") + sec;
  }

  this.timeToRead = timeToRead
  this.timeToSpeak = timeToSpeak;
}

/**
 * Calculate the reading difficulty level on a sentence level --
 * used for assessing individual sentences (and highlighting with colour)
 * @param  {[Number]} letters Number of letters
 * @param  {[Number]} words Number of words
 * @param  {[Number]} sentences Number of sentences
 */
calculateLevel(letters=this.chars, words=this.wordCount, sentences=this.sentenceCount) {
  // If no words or sentences, bail
  if (words === 0 || sentences === 0) {
    this.difficulty = 0;
  } else {
  let level = Math.round(4.71 * (letters / words) + (0.5 * words) / sentences - 21.43);
  this.difficulty = level <= 0 ? 0 : level;
  }
}

// * Specific to RetMinTekst

/**
 * Takes as an input an array of words and returns an array with the lemmas of the words
 * @param  {[Array]} lemmaDict via global scope´
 */
lemmafyWord(word:string, lemmaDict:any) {
  const found = lemmaDict[word];
 
  if (found == undefined) {
     // If the word is not in the list, bail
    return word;
  } else {
    return found;
  }
}

/**
 * Takes as an input an array of words and returns an array with the lemmas of the words
 * @param  {[Array]} arr Array of words
 */
lemmafyText(lemmaDict:Array<any>) {
  if (lemmaDict.length === 0) {
    console.log("ERR: No lemma lookup file provided")
    return this.words;
  }

  if (this.words.length === 0) this.getWords()

  this.words = this.words.map((word) => this.lemmafyWord(word, lemmaDict))
  return this.words;
}

/**
 * Map a value (number) to a corresponding emoji
 * @param  {[number]} score A scoring on a scale from 1-9
 */

convertValToEmoji(score:number) {
  try {
    switch (true) {
      case score < 2:
        return "🤬";
      case score < 3:
        return "😡";
      case score < 4:
        return "😠";
      case score < 5:
        return "😐";
      case score < 6:
        return "🙂";
      case score < 7:
        return "😄";
      case score < 8:
        return "😁";
      case score < 9:
        return "🤩";
      default:
        return "🤷‍♂️";
    }
    
  } catch (err) {
    console.log(err);
    return "🤷‍♂️";
  }
}

/**
 * * * * Statistical functions * * * *
 */

/**
 * Take array of numbers as input and calculate a mean
 * @param  {[Array]} arr A scoring on a scale from 1-9
 */
static calculateMean(arr:Array<number>) {
  let sum:number = 0;
  for (let i = 0; i < arr.length; i++) {
    const number = arr[i];
    sum += number;
  }
  return sum / arr.length;
}

/**
 * Take array of numbers as input and calculate a variance
 * @param  {[Array]} arr Array of numbers
 */
static calculateVariance(arr:Array<number>, mean:number) {
  let variance:number = 0;

  for (let i = 0; i < arr.length; i++) {
    const number = arr[i];
    const difference_squared = Math.pow(number - mean, 2);
    variance += difference_squared;
  }

  return Math.round(variance / arr.length);
}

}

module.exports.TextParser = TextParser;

// * Reading list & sources
// On method chaining: https://stackoverflow.com/questions/48219415/method-chaining-in-a-javascript-class
