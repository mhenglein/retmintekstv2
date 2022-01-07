const { TextParser } = require("../utilities/text.js");
const { TextMath } = require("../utilities/math.js");

module.exports = async (req, res) => {
  const { input, options } = req.body;

  // TODO Skip (vs remove) stopwords
  // if (options === {}) {
  //   options.removeStopwords = true;
  // }
  const rateSentiment = new RateSentiment(input, options)
    .rateHappiness()
    .calculateHappyMetrics()
    .augmentTextWithEmojis();

  const returnJSON = {
    returnText: rateSentiment.formatted,
    emoji: rateSentiment.emoji,
    happinessScore: rateSentiment.happinessScore,
    happinessMSE: rateSentiment.happinessMSE,
  };
  res.json(returnJSON).end();
};

class RateSentiment {
  constructor(s, options, files) {
    if (typeof s === "undefined" || !s.toString) {
      throw new Error("Function requires strings and values that can be coerced into a string with toString()");
    }

    this.text = s.toString();
    this.options = options;
    this.files = files;
    this.happyWords = [];
  }

  rateHappiness(text = this.text) {
    const parsedText = new TextParser(text)
      .removeHTML()
      .removeNonLetters()
      .removePunctuation()
      .removeDoubleSpacing()
      .convLowerCase()
      .trimText();

    if (this.options?.removeStopwords) parsedText.removeAllStopord(this.files.stopord);
    this.words = parsedText.getWords().words;
    if (this.options?.uniqueOnly) parsedText.getUniqueWords();
    if (this.options?.lemmafyText) parsedText.lemmafyText(this.files.lemmas);

    // No hedonometer file provided, bail
    if (this.files?.hedonometer.length === 0) return this;

    // Loop through each of the words
    this.words.forEach((word) => {
      // Check the word against the hedonometer file [Cols: ID, Original, EN, DA, Val, Std]
      const foundValue = this.files.hedonometer.filter((v) => v[3] === word);

      // Check if there is a match
      if (foundValue.length > 0 && foundValue !== undefined) {
        this.happyWords.push([foundValue[0][3], foundValue[0][4], foundValue[0][5]]);
      }
    });
    return this;
  }

  calculateHappyMetrics() {
    const happyValues = this.happyWords.map((v) => Number(v[1])); // Mean

    // Why again? We remove uniques early on for performance; then lemmafy; then recheck quick in case any of the lemmas are duplicate
    // if (this.options?.uniqueOnly && this.options?.lemmafyText) {
    //   // Convert to Set and then back to Array
    //   const set = new Set(this.happyWords.map((x) => JSON.stringify(x)));
    //   this.happyWords = Array.from(set).map((x) => JSON.parse(x));
    // }

    // * Sort by value
    // this.happyWords.sort(TextParser.compareSecondColumn);

    // * Calculate Sum, Score, and MSE
    this.happinessScore = TextMath.calcAvg(happyValues).toPrecision(2);
    this.happinessMSE = TextMath.calcMSE(happyValues).toPrecision(2);
    this.emoji = TextParser.convertValToEmoji(this.happinessScore);

    return this;
  }

  augmentTextWithEmojis(text = this.text) {
    // * Optional - Assigns emojis to each word in text using the :after pseud-class
    const parsedText = new TextParser(text).removeHTML().removeDoubleSpacing().trimText().getWords();
    parsedText.words.forEach((word, index) => {
      // Check the word against the hedonometer file [Cols: ID, Original, EN, DA, Val, Std]
      const foundValue = this.files?.hedonometer.filter((v) => v[3] === word);
      if (foundValue.length > 0 && foundValue !== undefined) {
        const score = foundValue[0][4];

        if (score < 2) {
          parsedText.words[index] = `<span class='two'><abbr title="attribute">${word}</abbr></span>`;
        } else if (score < 3) {
          parsedText.words[index] = `<span class='three'>${word}</span>`;
        } else if (score < 4) {
          parsedText.words[index] = `<span class='four'>${word}</span>`;
        } else if (score < 5) {
          parsedText.words[index] = `<span class='five'>${word}</span>`;
        } else if (score < 6) {
          parsedText.words[index] = `<span class='six'>${word}</span>`;
        } else if (score < 7) {
          parsedText.words[index] = `<span class='seven'>${word}</span>`;
        } else if (score < 8) {
          parsedText.words[index] = `<span class='eight'>${word}</span>`;
        } else if (score < 9) {
          parsedText.words[index] = `<span class='nine'>${word}</span>`;
        } else {
          parsedText.words[index] = word;
        }
      }
    });

    parsedText.text = parsedText.words.join(" ");
    parsedText.removeDoubleSpacing();

    this.formatted = parsedText.text;
    return this;
  }
}
