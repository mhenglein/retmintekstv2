/* eslint-disable no-console */
/**
 * Count all the paragraph blocks in EditorJS (Headers & Lists not included)
 * @param  {[Array]}   editorBlocks An array of blocks from an EditorJS object
 * @return {[Number]}               Number of paragraphs
 */
module.exports = function countParagraphs(editorBlocks) {
  return editorBlocks.filter((x) => x.type === "paragraph").length;
};

/**
 * Extracts all text from the request
 * @param  {[String]}         type  (Optional) Specify the type of the input
 * @param  {[Object/String]}  input Either an EditorJS Object or a string
 * @return {[String]}               One string containing all text
 */
module.exports = function extractFullText(type = "undefined", input) {
  // If no type specified, one will be defined
  let providedType = type;
  if (type === "undefined") providedType = typeof input;

  // Extract from EditorJS
  if (providedType === "object") {
    let output = "";
    try {
      for (let i = 0; i < input.length; i += 1) {
        const specificBlock = input[i];
        const typeOfBlock = specificBlock.type;

        if (typeOfBlock === "list") {
          const noOfItems = specificBlock.data.items.length;
          for (let item = 0; item < noOfItems; item += 1) {
            output += specificBlock.data.items[i];
          }
        } else {
          output += specificBlock.data.text;
        }

        // Add whitespace after block
        output += " ";
      }
    } catch (err) {
      console.error(err);
    }

    return output;
  }
  // Regular string, e.g. people using the API
  if (type === "string") {
    return String(input);
  }
  // Something else; try to convert to string; if impossible, return error
  try {
    const convertToString = input.toString();
    return convertToString;
  } catch (err) {
    console.error("Input must either be an EditorJS object or a value with a toString() method", err);
    return "Fejl";
  }
};

/**
 * Based on length of a sentence, this provides the HTML output
 * Returns the new sentence and its "length category"
 * @param  {[String]} s         The input sentence to be wrapped in tags
 * @param  {[Number]} length    The length of the sentence (in number of words)
 */
module.exports = function assignSentenceByLength(s, length) {
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
