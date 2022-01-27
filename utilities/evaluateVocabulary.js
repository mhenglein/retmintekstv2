const { TextParser } = require("../utilities/text.js");
const { TextHighlighter } = require("../utilities/analysis.js");

const stopord = require("../data/stopord.json");
const freq = require("../data/frequency.json");

// TODO No numbers in unique words
module.exports = class EvaluateVocabulary {
  constructor(s, options) {
    if (typeof s === "undefined" || !s.toString) {
      throw new Error("Function requires strings and values that can be coerced into a string with toString()");
    }

    this.text = s.toString();
    this.options = options;
    this.formatted = this.text;

    const textForAnalysis = new TextParser(this.text)
      .removeHTML()
      .removeNonLetters()
      .removePunctuation()
      .removeDoubleSpacing()
      .convLowerCase()
      .trimText();

    this.words = textForAnalysis.getWords().words;
    this.wordsNoDuplicates = textForAnalysis.removeDuplicates();

    this.uncommonWords = [];
    this.uniqueWords = [];
    this.overusedWords = [];
    this.results = {};
    this.frequencyMapMaster = {};
    this.frequencyMap = {};
  }

  generateFrequencyMap(inputArray = this.words) {
    const map = {};
    inputArray.forEach((item) => {
      map[item] = (map[item] || 0) + 1;
    });

    const minCharLength = this.options?.minCharLength || 4;
    const removeStopwords = this.options?.removeStopwords || true;

    for (const key in map) {
      if (key.length < minCharLength) delete map[key];
      if (!isNaN(key)) delete map[key];
      if (removeStopwords && stopord.includes(key)) delete map[key];
    }

    this.frequencyMap = map;
    return this;
  }

  findOverusedWords(minCharLength = 3, minOccurences = 3, removeStopwords = true, threshold = 0.2) {
    const map = Object.assign({}, this.frequencyMap);

    for (const key in map) {
      if (map[key] < minOccurences) delete map[key];
    }

    if (typeof map === "undefined" || !map) return;

    // Sortable table
    const sortedArray = Object.entries(map).sort(TextParser.compareSecondColumn);
    const sortedList = sortedArray.map((s) => s[0]);

    // Take top X%
    const howMany = Math.max(threshold * sortedList.length, 1);
    this.overusedWords = sortedList.slice(0, howMany);

    return this;
  }

  highlightOverusedWords(text = this.text, replacementArr = this.overusedWords) {
    if (this.overusedWords.length === 0) this.findOverusedWords();

    if (replacementArr.length > 0) {
      const highlightedText = new TextHighlighter(text);
      highlightedText.findAndReplaceLight(
        replacementArr, // replacementArray
        "Ofte anvendt ord",
        "Du bruger dette ord ofte i din tekst. Overvej, om du kan begrænse omfanget eller finde passende synonymer.",
        "frequentword"
      );
      // Dernæst ... Unikke ord (Godt! ), og så .. den sidste usædvanlige ord.

      highlightedText.reconvertTextLight();
      this.formatted = highlightedText.text;
    }
    return this;
  }

  findUncommonWords(threshold = 5000) {
    if (this.words.length > 0) {
      let words = this.wordsNoDuplicates;

      //  * (Optional) -- Lemmafy array
      if (this.options?.lemmafyAll) {
        words.map((word) => TextParser.lemmafyWord(word));
        words = TextParser.removeDuplicates(words);
      }

      words.forEach((word) => {
        const rarity = freq.filter((v) => v[1] === word);
        // If there is a match, rarity.length will be >0
        if (rarity !== [] && rarity.length > 0) {
          // Allow it to be considered rare if it's not in the top X
          const rareScore = Math.floor(Number(rarity[0][3]));
          if (rareScore > threshold) this.uncommonWords.push(word);
        } else {
          // If there is no match, consider it a rare word
          this.uncommonWords.push(word);
        }
      });
    }
    return this;
  }

  // Get all unique words (Words that are only used once!)
  findUniqueWords(removeStopwords = true) {
    // If only 1 word, bail
    if (this.words.length <= 1) return this;

    if (this.words.length > 0) {
      const allWords = this.words;
      if (stopord.length > 0 && removeStopwords) {
        stopord.forEach((word, index) => {
          allWords.filter((e) => e !== stopord[index]);
        });
      }

      const frequencyMap = Object.assign({}, this.frequencyMap);

      // Delete if they have more than 1 occurence
      for (const key in frequencyMap) {
        if (Object.prototype.hasOwnProperty.call(frequencyMap, key)) {
          const element = Number(frequencyMap[key]);
          if (element > 1) delete frequencyMap[key];
        }
      }

      // Revert object to 1D-array
      this.uniqueWords = Array.from(Object.entries(frequencyMap)).map((s) => s[0]);
    }
    return this;
  }

  // Generate object for sidebar
  createObjectOfResults() {
    if (typeof this.frequencyMap === "undefined" || !this.frequencyMap) {
      this.generateFrequencyMap();
    }

    const obj = {};
    this.overusedWords.forEach((word) => {
      obj[word] = {
        word: word,
        count: this.frequencyMap[word],
        type: "overused",
        label: "Genganger",
        color: "red",
      };
    });

    this.uncommonWords.forEach((word) => {
      obj[word] = {
        word: word,
        count: this.frequencyMap[word],
        type: "uncommon",
        label: "Sjældent",
        color: "yellow",
      };
    });

    this.uniqueWords.forEach((word) => {
      obj[word] = {
        word: word,
        count: this.frequencyMap[word],
        type: "unique",
        label: "Unikt",
        color: "green",
      };
    });

    this.results = obj;
    return this;
  }
};
