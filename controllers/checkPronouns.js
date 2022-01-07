const { TextParser } = require("../utilities/text.js");
const { TextHighlighter } = require("../utilities/analysis.js");

module.exports = async (req, res) => {
  const { input, options } = req.body;
  const checkPronouns = new CheckPronouns(input).countPronouns();

  const returnJSON = {
    returnText: checkPronouns.formatted,
    noOfPronouns: checkPronouns.noOfPronouns,
  };

  res.json(returnJSON).end();
};

class CheckPronouns {
  constructor(s) {
    if (typeof s === "undefined" || !s.toString) {
      throw new Error("Function requires strings and values that can be coerced into a string with toString()");
    }

    this.text = s.toString();
    this.pronouns = ["han", "hun", "ham", "hende", "sin", "hans", "hendes", "sit", "sine", "høn"];

    const cleanedUpText = new TextParser(this.text).removeHTML().text;
    const checkTextForPronouns = new TextHighlighter(cleanedUpText);
    this.formatted = checkTextForPronouns
      .findAndReplaceLight(this.pronouns, "Stedord", "", "stedord")
      .reconvertTextLight().text;
  }

  countPronouns(text = this.text) {
    const textForCounting = new TextParser(text);
    const allWordsInText = textForCounting.getWords().words;
    const filterOnlyPronouns = allWordsInText.filter((word) => this.pronouns.includes(word));
    this.noOfPronouns = filterOnlyPronouns.length;
    return this;
  }
}
