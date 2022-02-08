const { TextParser } = require("../utilities/text.js");
const { TextHighlighter } = require("../utilities/analysis.js");
const { GetTextMetrics } = require("./textMetrics.js");

module.exports = async (req, res) => {
  const { text, editor, options } = req;

  const threshold = options?.threshold || 6;

  editor.blocks.forEach((block, index) => {
    const { text } = block.data;
    const lws = new ShowLongWords(text, threshold).highlightAllLongWords();
    editor.blocks[index].data.text = lws.formatted;
  });

  const lw = new ShowLongWords(text).highlightAllLongWords(threshold).getAllLongWords(threshold);
  const metrics = new GetTextMetrics(text).calcLix();

  const returnJSON = {
    editor,
    sidebar: {
      noOfLongWords: lw.noOfLongWords,
      arrOfLongWords: lw.longWords,
      lix: metrics.lix,
      audience: metrics.audience,
      difficulty: metrics.difficulty,
    },
  };

  res.json(returnJSON).end();
};

class ShowLongWords {
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
}
