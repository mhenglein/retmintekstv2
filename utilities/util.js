const { TextParser } = require("../utilities/text.js");

module.exports.cleanString = function cleanString(s, options) {
  if (!s) return null;

  s = s.toString();

  const parser = new TextParser(s);

  if (!options) {
    // Assume the full monty
    parser.removeHTML();
    parser.removeDoubleSpacing();
    parser.trimText();
  } else {
    if (options.removeHTML) parser.removeHTML();
    if (options.removeHTMLexceptFormatting) parser.removeHTMLexceptFormatting();
    if (options.removeNonLetters) parser.removeNonLetters();
    if (options.removeDoubleSpacing) parser.removeDoubleSpacing();
    if (options.trimText) parser.trimText();
  }

  const { text } = parser;
  return text;
};

// TODO fjerner tegnsætning??
module.exports.cleanEditor = function cleanEditor(editor, options) {
  if (!editor) return;
  if (typeof editor !== "object") return;
  if (!editor.blocks) return;

  editor.blocks.forEach((block, index) => {
    const { text } = block.data;
    const s = this.cleanString(text, options) || "";

    editor.blocks[index].data.text = s;
  });

  return editor;
};

module.exports.createEditorJS = function createEditorJS(text, options) {
  if (!text) return null;

  const arrText = text.split("\n");
  const now = +new Date();

  const editor = {
    time: now,
    blocks: [],
    version: "2.24.0",
  };

  arrText.forEach((s) => {
    const block = {
      type: "paragraph",
      data: {
        text: s,
      },
    };
    editor.blocks.push(block);
  });

  return editor;
};

module.exports.isEditorJS = function isEditorJS(editor) {
  if (!editor) return false;
  if (typeof editor !== "object") return false;
  if (!editor.blocks) return false;
  if (!editor.time) return false;
  if (!editor.version) return false;
  return true;
};

/**
 * Count all the paragraph blocks in EditorJS (Headers & Lists not included)
 * @param  {[Array]}   editorBlocks An array of blocks from an EditorJS object
 * @return {[Number]}               Number of paragraphs
 */
module.exports.countParagraphs = function countParagraphs(editorBlocks) {
  return editorBlocks.filter((x) => x.type === "paragraph").length;
};

/**
 * Extracts all text from the request
 * @param  {[String]}         type  (Optional) Specify the type of the input
 * @param  {[Object/String]}  input Either an EditorJS Object or a string
 * @return {[String]}               One string containing all text
 */
module.exports.extractText = function extractText(editor) {
  if (!editor) return null;
  let output = "";
  editor.blocks.forEach((block, index) => {
    const { text } = block.data;
    output += text;

    // Add whitespace after block
    output += " ";
  });
  return output;
};

/**
 * Based on length of a sentence, this provides the HTML output
 * Returns the new sentence and its "length category"
 * @param  {[String]} s         The input sentence to be wrapped in tags
 * @param  {[Number]} length    The length of the sentence (in number of words)
 */
module.exports.assignSentenceByLength = function assignSentenceByLength(s, length) {
  if (length <= 3) {
    return {
      newSentence: `<span class="s1to3">${s}</span>`,
      s1to3: 1,
      s4to6: 0,
      s7to10: 0,
      s11to18: 0,
      s19to26: 0,
      s26plus: 0,
    };
  }
  if (length <= 6) {
    return {
      newSentence: `<span class="s4to6">${s}</span>`,
      s1to3: 0,
      s4to6: 1,
      s7to10: 0,
      s11to18: 0,
      s19to26: 0,
      s26plus: 0,
    };
  }
  if (length <= 10) {
    return {
      newSentence: `<span class="s7to10">${s}</span>`,
      s1to3: 0,
      s4to6: 0,
      s7to10: 1,
      s11to18: 0,
      s19to26: 0,
      s26plus: 0,
    };
  }
  if (length <= 18) {
    return {
      newSentence: `<span class="s11to18">${s}</span>`,
      s1to3: 0,
      s4to6: 0,
      s7to10: 0,
      s11to18: 1,
      s19to26: 0,
      s26plus: 0,
    };
  }
  if (length <= 26) {
    return {
      newSentence: `<span class="s19to26">${s}</span>`,
      s1to3: 0,
      s4to6: 0,
      s7to10: 0,
      s11to18: 0,
      s19to26: 1,
      s26plus: 0,
    };
  }
  if (length > 26) {
    return {
      newSentence: `<span class="s26plus">${s}</span>`,
      s1to3: 0,
      s4to6: 0,
      s7to10: 0,
      s11to18: 0,
      s19to26: 0,
      s26plus: 1,
    };
  }
  return { newSentence: `${s}`, s1to3: 0, s4to6: 0, s7to10: 0, s11to18: 0, s19to26: 0, s26plus: 0 };
};
