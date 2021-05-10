const TextHighlighter = require("./analysis.js").TextHighlighter;
const testString = "<span>Hello <b>World</b></span>";

// console.log(TextHighlighter);

textForAnalysis = new TextHighlighter(testString, ["a"]);
// console.log(textForAnalysis);

textForAnalysis.removeHTMLexceptFormatting();

textForAnalysis.removeAndStoreFormatting();
console.log(textForAnalysis);
