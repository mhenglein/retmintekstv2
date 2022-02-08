const { TextParser } = require("../utilities/text.js");
const { TextHighlighter } = require("../utilities/analysis.js");

const misspellings = require("../data/misspellings.json");
const dict = require("../data/db.json");
const chalk = require("chalk");

module.exports = (req, res) => {
  const { text, editor, options } = req;
  editor.blocks.forEach((block, index) => {
    const { text } = block.data;
    const correctedText = correctText(text, options);
    editor.blocks[index].data.text = correctedText.text;
  });

  const { errors } = correctText(text, options);

  return res.json({ editor, sidebar: errors }).end();
};

function correctText(input, options) {
  const parsedText = new TextParser(input).removeHTML();

  const { text } = parsedText;

  // // 1A: findAndReplaceLight w/ mispellings file
  // const findSpellingErrors = new TextHighlighter(parsedText.text, misspellings);
  // findSpellingErrors.findAndReplaceLight(misspellings, "Stavefejl", "Formodentlig: Stavefejl", "red"); // Has ID codes in it
  // const newText = findSpellingErrors.text;
  // const misspelledReplacements = findSpellingErrors.replacements;

  // 1B: findAndReplace w/ regular file
  const highlightedText = new TextHighlighter(text, dict);
  highlightedText.findAndReplace().reconvertText();
  // console.log(highlightedText.replacements);

  const errors = highlightedText.errors;

  // Reconvert the spelling errors ahhh
  // const finalText = new TextHighlighter(highlightedText.text);
  // finalText.reconvertTextLight();

  return { text: highlightedText.text, errors };
}
