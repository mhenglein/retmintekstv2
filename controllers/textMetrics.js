const { TextParser } = require("../utilities/text.js");
const { TextMath } = require("../utilities/math.js");

// Data files
const stopord = require("../data/stopord.json");

module.exports = (req, res) => {
  const { text, editor, options } = req;

  const textMetrics = new GetTextMetrics(text, options).calcLix().calcSentenceVariance().calcAvgLengths().calcTime();

  const {
    wordCount,
    longWordsCount,
    lix,
    difficulty,
    audience,
    readingTime,
    speakingTime,
    normalsider,
    charsWithSpaces,
    charsNoSpaces,
    sentenceCount,
    avgSentenceLength,
    avgWordLength,
    sentenceVariance,
  } = textMetrics;

  const paragraphs = editor.blocks.length;

  const returnJSON = {
    sidebar: {
      paragraphs,
      wordCount,
      longWordsCount,
      lix,
      difficulty,
      audience,
      readingTime,
      speakingTime,
      normalsider,
      charsWithSpaces,
      charsNoSpaces,
      sentenceCount,
      avgSentenceLength,
      avgWordLength,
      sentenceVariance,
    },
  };

  console.log(returnJSON);
  return res.json(returnJSON).end();
};

class GetTextMetrics {
  constructor(s, options) {
    if (typeof s === "undefined" || !s.toString) {
      throw new Error("Function requires strings and values that can be coerced into a string with toString()");
    }

    this.text = s.toString();
    this.options = options || {};

    // Preparation - Convert to TextParser object && clean HTML
    const textForAnalysis = new TextParser(this.text).removeHTML();

    if (options?.removeStopwords) textForAnalysis.removeWords(stopord);

    textForAnalysis.getWords().countCharacters().getSentences();

    this.words = textForAnalysis.words;
    this.wordCount = textForAnalysis.wordCount;
    this.sentences = textForAnalysis.sentences;
    this.sentenceCount = textForAnalysis.sentenceCount;
    this.longWordsCount = textForAnalysis.longWordCount;
    this.charsWithSpaces = textForAnalysis.charsWithSpaces;
    this.charsNoSpaces = textForAnalysis.charsNoSpaces;
    this.normalsider = Number((textForAnalysis.charsWithSpaces / 2400).toPrecision(2));
  }

  calcSentenceVariance() {
    this.calcAvgLengths();

    const sentenceLengths = [];
    this.sentences.forEach((sentence) => {
      sentenceLengths.push(
        sentence
          .split(/\s+/) // Split by (multiple) whitespace(s)
          .filter((n) => n !== "").length
      );
    });

    const sentenceVariance = TextMath.calcVariance(sentenceLengths);

    this.sentenceVariance = Math.floor(sentenceVariance);
    return this;
  }

  calcLix() {
    // * LIX
    // If no words, bail
    if (this.words.length === 0) {
      this.lix = 0;
    } else {
      // Lix formula
      const lix = Math.round(this.wordCount / this.sentenceCount + (this.longWordsCount * 100) / this.wordCount);
      this.lix = lix <= 0 ? 0 : lix;
    }

    // * Difficulty associated w/ LIX
    // If too little data, return 'unknown'
    if (this.words.length < 10 || this.sentences.length < 3) {
      this.difficulty = "Ukendt";
      this.audience = "Ukendt";
    } else if (this.lix >= 55) {
      this.difficulty = "Svær";
      this.audience = "Universitet";
    } else if (this.lix >= 45 && this.lix < 55) {
      this.difficulty = "Mellemsvær";
      this.audience = "Gymnasium";
    } else if (this.lix >= 35 && this.lix < 45) {
      this.difficulty = "Middel";
      this.audience = "7-9. klasse";
    } else if (this.lix >= 25 && this.lix < 35) {
      this.difficulty = "Let";
      this.audience = "4-6. klasse";
    } else if (this.lix < 25 && this.lix > 0) {
      this.difficulty = "Let for alle";
      this.audience = "1-3. klasse";
    } else {
      this.difficulty = "Ukendt";
      this.audience = "Ukendt";
    }

    return this;
  }

  static determineDifficulty(words, level) {
    if (words < 15) {
      return "easy";
    }
    if (level >= 15 && level < 21) {
      return "hard";
    }
    if (level >= 21) {
      return "veryhard";
    }
    return "easy";
  }

  calcAvgLengths() {
    this.avgSentenceLength = Math.round(this.wordCount / this.sentenceCount); // Calculate the average sentence length
    this.avgWordLength = Math.round(this.charsNoSpaces / this.wordCount); // Calculate the average word length
    return this;
  }

  calcTime(wpm = 250, spm = 120) {
    // Assume avg, 250 words per minute (reading) and 120 per minute (speaking)

    function minTommss(minutes) {
      const sign = minutes < 0 ? "-" : "";
      const min = Math.floor(Math.abs(minutes));
      const sec = Math.floor((Math.abs(minutes) * 60) % 60);
      return `${sign + (min < 10 ? "0" : "") + min}:${sec < 10 ? "0" : ""}${sec}`;
    }

    const timeToReadDecimal = this.words.length / wpm;
    this.readingTime = minTommss(timeToReadDecimal);

    const timeToSpeakDecimal = this.words.length / spm;
    this.speakingTime = minTommss(timeToSpeakDecimal);
    return this;
  }
}
