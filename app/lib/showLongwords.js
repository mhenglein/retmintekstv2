/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
const { TextParser } = require(__dirname + "/text.js");
const { TextHighlighter } = require(__dirname + "/analysis.js");

module.exports = class ShowLongWords {
  constructor(text) {
    if (typeof text === "undefined" || !text.toString) {
      throw new Error("Function requires strings and values that can be coerced into a string with toString()");
    }

    this.original = text;
    this.formatted = text;
    this.parsed = new TextParser(text);
    this.words = [];
    this.longWords = [];
    this.noOfLongWords = 0;
  }

  getAllLongWords(threshold = 6) {
    this.longWords = this.parsed.getWords(threshold).longWords;
    this.noOfLongWords = this.longWords.length;
    return this;
  }

  highlightAllLongWords(threshold = 6) {
    this.parsed.getWords(threshold);
    this.longWords = this.parsed.longWords;

    const highlighted = new TextHighlighter(this.original);
    highlighted.findAndReplaceLight(
      this.longWords,
      "Langt ord",
      "Ord på over 6 bogstaver trækker dit LIX-tal op",
      "longword"
    );
    highlighted.reconvertTextLight();
    this.formatted = highlighted.text;
    return this;
  }
};
