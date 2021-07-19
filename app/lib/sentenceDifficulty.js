const { TextParser } = require(__dirname + "/text.js");

module.exports = class SentenceDifficulty {
  constructor(s) {
    if (typeof s === "undefined" || !s.toString) {
      throw new Error("Function requires strings and values that can be coerced into a string with toString()");
    }

    this.text = s.toString();
    this.parsed = new TextParser(this.text);
    this.original = s.toString();
    this.sentences = this.parsed.getSentences().sentences;
    this.noAllSentences = this.sentences.length;
    this.noEasySentences = 0;
    this.noHardSentences = 0;
    this.noVeryHardSentences = 0;

    this.sentences.forEach((sentence) => {
      const parsedSentence = new TextParser(sentence)
        .removeHTML()
        .removeNonLetters()
        .removePunctuation()
        .trimText()
        .getWords()
        .countCharacters();

      const sentenceLevel = SentenceDifficulty.calculateLevel(parsedSentence.chars, parsedSentence.wordCount, 1);
      const sentenceDifficulty = SentenceDifficulty.determineDifficulty(parsedSentence.wordCount, sentenceLevel);

      switch (sentenceDifficulty) {
        case "hard":
          this.noHardSentences += 1;
          this.formattedText += `<span class='hard'>${sentence}</span>`;
          break;
        case "veryhard":
          this.noVeryHardSentences += 1;
          this.formattedText += `<span class='veryhard'>${sentence}</span>`;
          break;
        default:
          this.noEasySentences += 1;
          this.formattedText += sentence;
      }
    });
  }

  static calculateLevel(letters, words, sentences) {
    // If no words or sentences, bail
    if (words === 0 || sentences === 0) {
      return 0;
    }
    const level = Math.round(4.71 * (letters / words) + (0.5 * words) / sentences - 21.43);
    return level <= 0 ? 0 : level;
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
};
