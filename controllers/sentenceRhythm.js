const { TextParser } = require("../utilities/text.js");
const { GetTextMetrics } = require("./textMetrics.js");

module.exports = async (req, res) => {
  const { text, editor, options } = req;

  if (!editor) return;

  editor.blocks.forEach((block, index) => {
    const { text } = block.data;
    const evaluateSentences = new SentenceRhythm(text, options).assessSentenceRhythms();
    editor.blocks[index].data.text = evaluateSentences.formatted;
  });

  const lengths = new SentenceRhythm(text, options).assessSentenceRhythms().sentenceLength;
  const metrics = new GetTextMetrics(text, options).calcAvgLengths().calcSentenceVariance();

  const sidebar = Object.assign({}, lengths);
  sidebar.avgSentenceLength = metrics.avgSentenceLength;
  sidebar.variance = metrics.sentenceVariance;

  return res
    .json({
      editor,
      sidebar,
    })
    .end();
};

class SentenceRhythm {
  constructor(s) {
    if (typeof s === "undefined" || !s.toString)
      throw new Error("Function requires strings and values that can be coerced into a string with toString()");

    this.text = s.toString();

    const textForAnalysis = new TextParser(this.text).removeHTML();
    this.sentences = textForAnalysis.getSentences().sentences;
    this.noAllSentences = this.sentences.length;
    this.formattedSentences = [];

    this.sentenceLength = {
      s1to3: 0,
      s4to6: 0,
      s7to10: 0,
      s11to18: 0,
      s19to26: 0,
      s26plus: 0,
    };
  }

  assessSentenceRhythms() {
    this.sentences.forEach((sentence) => {
      const parsedSentence = new TextParser(sentence)
        .removeHTML()
        .removeNonLetters()
        .removePunctuation()
        .trimText()
        .getWords();

      const lengthOfSentence = parsedSentence.wordCount;

      // ** Assign rhythm **
      const sentenceEval = SentenceRhythm.assignSentenceByLength(sentence, lengthOfSentence);
      const formattedSentence = sentenceEval.newSentence;

      this.formattedSentences.push(formattedSentence);
      this.sentenceLength[String(sentenceEval.sentenceType)] += 1;
    });

    this.formatted = this.formattedSentences.join(" ");
    return this;
  }

  /**
   * Based on length of a sentence, this provides the HTML output
   * Returns the new sentence and its "length category"
   * @param  {[String]} s         The input sentence to be wrapped in tags
   * @param  {[Number]} length    The length of the sentence (in number of words)
   */
  static assignSentenceByLength(s, length) {
    if (length <= 3) {
      return {
        newSentence: `<span class="s1to3">${s}</span>`,
        sentenceType: "s1to3",
      };
    }
    if (length <= 6) {
      return {
        newSentence: `<span class="s4to6">${s}</span>`,
        sentenceType: "s4to6",
      };
    }
    if (length <= 10) {
      return {
        newSentence: `<span class="s7to10">${s}</span>`,
        sentenceType: "s7to10",
      };
    }
    if (length <= 18) {
      return {
        newSentence: `<span class="s11to18">${s}</span>`,
        sentenceType: "s11to18",
      };
    }
    if (length <= 26) {
      return {
        newSentence: `<span class="s19to26">${s}</span>`,
        sentenceType: "s19to26",
      };
    }
    if (length > 26) {
      return {
        newSentence: `<span class="s26plus">${s}</span>`,
        sentenceType: "s26plus",
      };
    }
    return { newSentence: `${s}`, sentenceType: "" };
  }
}
