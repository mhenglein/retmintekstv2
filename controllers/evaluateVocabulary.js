const { TextParser } = require("../utilities/text.js");
const { TextHighlighter } = require("../utilities/analysis.js");

module.exports = async (req, res) => {
  const { input, options } = req.body;
  const evaluteVocab = new EvaluateVocabulary(input, options, files)
    .generateFrequencyMap()
    .findOverusedWords()
    .findUncommonWords()
    .findUniqueWords()
    .highlightOverusedWords();

  const returnJSON = {
    returnText: evaluteVocab.formatted,
    uncommonWords: evaluteVocab.uncommonWords,
    uniqueWords: evaluteVocab.uniqueWords,
    overusedWords: evaluteVocab.overusedWords,
    numUncommonWords: evaluteVocab.uncommonWords.length,
    numUniqueWords: evaluteVocab.uniqueWords.length,
    numOverusedWords: evaluteVocab.overusedWords.length,
    numAllWords: evaluteVocab.words.length,
  };

  res.json(returnJSON).end();
};

class EvaluateVocabulary {
  constructor(s, options, files) {
    if (typeof s === "undefined" || !s.toString) {
      throw new Error("Function requires strings and values that can be coerced into a string with toString()");
    }

    this.text = s.toString();
    this.options = options;
    this.files = files;
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
  }

  generateFrequencyMap(inputArray = this.words) {
    const frequency = {};
    inputArray.forEach((item) => {
      frequency[item] = (frequency[item] || 0) + 1;
    });
    this.frequencyMap = frequency;
    return this;
  }

  findOverusedWords(minCharLength = 3, minOccurences = 3, removeStopwords = true, threshold = 0.2) {
    // Get all REPEAT words (Do not include stopord file)
    // const repeatWords = textForAnalysis.getFrequentWords().frequentlyUsedWords;
    this.overusedWords = new TextParser(this.text).removePunctuation().trimText().convLowerCase().getWords().words;
    this.overusedWords = this.overusedWords.filter((x) => x.length >= minCharLength).sort();

    if (this.files.stopord.length > 0 && removeStopwords) {
      // Remove stopwords (stopord) if a file has been supplied
      this.files.stopord.forEach((word, index) => {
        this.overusedWords = this.overusedWords.filter((e) => e !== this.files.stopord[index]);
      });
    }

    const { frequencyMap } = this.generateFrequencyMap(this.overusedWords);

    for (const key in frequencyMap) {
      if (Object.prototype.hasOwnProperty.call(frequencyMap, key)) {
        const element = Number(frequencyMap[key]);
        if (element < minOccurences) {
          delete frequencyMap[key];
        }
      }
    }

    // Sortable table
    const sortedArray = Array.from(Object.entries(frequencyMap)).sort(TextParser.compareSecondColumn);
    const sortedList = sortedArray.map((s) => s[0]);

    // Take top X%
    this.overusedWords = sortedList.slice(0, threshold * sortedList.length);

    return this;
  }

  highlightOverusedWords(text = this.text) {
    if (this.overusedWords.length === 0) this.findOverusedWords();

    if (this.overusedWords.length > 0) {
      const highlightedText = new TextHighlighter(text);
      highlightedText.findAndReplaceLight(
        this.overusedWords, // replacementArray
        "Ofte anvendt ord",
        "Du bruger dette ord ofte i din tekst. Overvej, om du kan begrænse omfanget eller finde passende synonymer.",
        "frequentword"
      );

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
        const rarity = this.files.freq.filter((v) => v[1] === word);
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
      if (this.files.stopord.length > 0 && removeStopwords) {
        this.files.stopord.forEach((word, index) => {
          allWords.filter((e) => e !== this.files.stopord[index]);
        });
      }

      this.frequencyMap = this.generateFrequencyMap(allWords).frequencyMap;

      // Delete if they have more than 1 occurence
      // eslint-disable-next-line no-restricted-syntax
      for (const key in this.frequencyMap) {
        if (Object.prototype.hasOwnProperty.call(this.frequencyMap, key)) {
          const element = Number(this.frequencyMap[key]);
          if (element > 1) delete this.frequencyMap[key];
        }
      }

      // Revert object to 1D-array
      this.uniqueWords = Array.from(Object.entries(this.frequencyMap)).map((s) => s[0]);
    }
    return this;
  }
}
