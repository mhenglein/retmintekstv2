const { TextParser } = require("../utilities/text.js");
const { TextHighlighter } = require("../utilities/analysis.js");

const misspellings = require("../data/misspellings.json");
const dict = require("../data/db.json");

module.exports = function correctText(input, options) {
  const parsedText = new TextParser(input).removeHTML();

  // 1A: findAndReplaceLight w/ mispellings file
  const findSpellingErrors = new TextHighlighter(parsedText.text, {});
  findSpellingErrors.findAndReplaceLight(misspellings, "Stavefejl", "Formodentlig: Stavefejl", "red"); // Has ID codes in it
  const newText = findSpellingErrors.text;
  const misspelledReplacements = findSpellingErrors.replacements;

  // 1B: findAndReplace w/ regular file
  const highlightedText = new TextHighlighter(newText, dict);
  highlightedText.findAndReplace().reconvertText();

  const errors = highlightedText.errors;

  // Reconvert the errors
  const finalText = new TextHighlighter(highlightedText.text);
  finalText.reconvertTextLight(misspelledReplacements);

  const returnJSON = {
    returnText: finalText.text,
    // errors,
  };
  return returnJSON;
};
