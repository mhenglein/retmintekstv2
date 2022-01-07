/* eslint-disable no-console */
/**
 * Takes a string of text as input and will Find & Replace against a dictionary
 * @param  {[String]} s      Input text
 * @param  {[Array]}  dict   Dictionary
 * @return {[Object]}        JSON
 */
class TextHighlighter {
  text: string;

  original: string;

  id: number;

  dict: Array<any>;

  formatting: Array<any>;

  replacements: Array<any>;

  errors: Object;

  constructor(s: string, dict: Array<any> = []) {
    if (typeof s === "undefined" || !s.toString) {
      throw new Error("TextHighlighter only works with strings and values that can be coerced into a string");
    }

    this.text = s.toString();
    this.original = s.toString();
    this.dict = dict;
    this.id = Number(Math.floor(100000000 + Math.random() * 900000000));
    this.formatting = [];
    this.replacements = [];
    this.errors = {};
  }

  /**
   * Removes HTML tags except (<b>, <i>, and <a>) and entities (such as non-breaking space, &nbsp;)
   */
  removeHTMLexceptFormatting() {
    this.text = this.text.replace(/<\/?[^bia/][^>]*(>|$)/g, " ").trim();
    return this;
  }

  removeAndStoreFormatting() {
    // Requires that all HTML has been removed (Except formatting)
    const regex = /<[^>]*(>|$)/;

    // Find first instances
    let latestIndex: number = 0;
    let findIndex: number;
    let endIndex: number = 0;

    // Aux function that adds Regex to String.IndexOf
    function regexIndexOf(string: string, RegExp: RegExp, startpos: number) {
      const indexOf = string.substring(startpos || 0).search(RegExp);
      return indexOf >= 0 ? indexOf + (startpos || 0) : indexOf;
    }

    do {
      // Find the index of next tag
      findIndex = regexIndexOf(this.text, regex, latestIndex);
      console.log("findIndex", findIndex);

      // Capture string, length
      let currentChar = this.text.charAt(findIndex);
      console.log("currentChar", currentChar);
      endIndex = findIndex + 1;
      while (currentChar !== ">") {
        endIndex += 1;
        currentChar = this.text.charAt(endIndex);
        console.log("currentChar", currentChar);
      }
      const foundTag = this.text.slice(findIndex, endIndex + 1);

      // Add to array
      if (findIndex > -1) this.formatting.push([foundTag, findIndex, endIndex - findIndex + 1]);

      // Update index
      latestIndex = findIndex + 1;
    } while (latestIndex > 0);
  }

  findAndReplaceLight(replacementArray: Array<any>, replacementType: string, popoverText: string, css: string) {
    // Mimicking the regex boundary (which doesn't include ÆÆÅ)
    const b1 = "(\\s|\\.|\\,|\\!|\\?|\\(|\\)|\\'|\\\"|^)";
    const b2 = "(\\s|\\.|\\,|\\!|\\?|\\(|\\)|\\'|\\\"|$)";

    function escapeRegExp(str: string) {
      return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
    }

    replacementArray.forEach((item) => {
      if (item[0].length > 0) {
        // Create searchs tring
        const searchWord = Array.isArray(item) ? escapeRegExp(String(item[0])) : escapeRegExp(String(item));
        const searchString = b1 + searchWord + b2;
        const regex = new RegExp(searchString, "gi");

        const checkIfMatch = regex.test(this.text);
        // Only proceed if there is a match
        if (checkIfMatch) {
          const textMatch = RegExp["$&"].trim();
          const textForPopoverTitle: string = textMatch.replace(/[.,/#!?"'$%^&*;:{}=_`~()]/g, "");
          const popoverTitle: string = `${replacementType} <span class='badge bg-${css} ms-2'>${textForPopoverTitle}</span>`;
          const replacementString = ` <span class="${css}" data-bs-toggle="popover" data-bs-original-title="${popoverTitle}" data-bs-html="true" data-bs-content="${popoverText}">${textMatch}</span> `;
          this.updateID();
          this.replacements.push([this.id, replacementString, replacementType]);
        }
        this.text = this.text.replaceAll(regex, String(this.id));
      }
    });

    return this;
  }

  /**
   * per default will use the object's replacements arrays, but can also provide your own
   */
  reconvertTextLight(arrReplacements = this.replacements) {
    arrReplacements.forEach((arr) => {
      const replacement = new RegExp(arr[0], "g"); // 0 is the ID
      // Test if the text contains the ID
      const regexTest = replacement.test(this.text);
      if (regexTest) this.text = this.text.replace(replacement, arr[1]); // 1 is the <span>text</span>
    });
    return this;
  }

  findAndReplace() {
    // Mimicking the regex boundary (which doesn't include ÆÆÅ)
    const b1 = "(\\s|\\.|\\,|\\!|\\?|\\(|\\)|\\'|\\\"|^)";
    const b2 = "(\\s|\\.|\\,|\\!|\\?|\\(|\\)|\\'|\\\"|$)";

    const outputObject = {
      Generelt: 0, // korrekthed
      Stavefejl: 0, // korrekthed
      Fyldeord: 0, // klarhed
      Anglicisme: 0, // originalitet
      Kliche: 0, // originalitet
      Dobbeltkonfekt: 0, // klarhed
      Buzzword: 0, // udtryk
      Formelt: 0, // udtryk
      "Typisk anvendt forkert": 0, // klarhed
      Grammatik: 0, // korrekthed
    };

    // Loop through the dictionary & see if there are any matches in the text.
    for (let j = 0; j < this.dict.length; j += 1) {
      // eslint-disable-next-line prefer-const
      let [regex, type, popover, i, left, right] = [
        this.dict[j][1], // Regex
        this.dict[j][2], // Type
        this.dict[j][3], // Popover
        this.dict[j][4], // Case (i)
        this.dict[j][5], // Left border
        this.dict[j][6], // Right border
      ];

      // Create search string based on the dictionary specifications (e.g. include 'borders')
      let searchString = regex;
      if (left === 1) searchString = b1 + searchString;
      if (popover === null) popover = "";
      if (right === 1) searchString += b2;
      searchString = `(${searchString})`;

      // Create RegExp string
      const regexString = i === 0 ? new RegExp(searchString, "g") : new RegExp(searchString, "gi");

      // Run the test
      const checkIfMatch = regexString.test(this.text);

      // Only proceed if there is a match
      if (checkIfMatch) {
        let textMatch = RegExp["$&"];
        textMatch = textMatch.trim();

        // Update output object
        outputObject[type] += 1;

        const css = type.toLowerCase().replace(" ", "");
        const popoverTitle: string = `${type}`;
        const firstPartOfString: string = ` <span class="${css}" 
        data-bs-toggle="popover" 
        data-bs-original-title="${popoverTitle}"
        data-bs-html="true" 
        data-bs-content="${popover}"> `;

        const stringContent: string = textMatch;
        const endOfString: string = "</span>";

        const replacementString = firstPartOfString + stringContent + endOfString;

        // Create array with unique IDs and replacement HTML strings, with spaces surrounding it
        this.updateID();

        // TODO An array with StartPos that can be used with the formatting array
        this.replacements.push([
          this.id,
          replacementString,
          type,
          0,
          firstPartOfString.length,
          stringContent.length,
          endOfString.length,
        ]);

        // Replace the offending bit of text with an ID so as to avoid re-running this process on the popover text.
        this.text = this.text.replaceAll(regexString, String(this.id));
      }
    }

    // Return number of errors etc.
    this.errors = outputObject;
    return this;
  }

  // TODO Move to client?
  reconvertText() {
    if (this.replacements.length === 0) this.findAndReplace();

    this.replacements.forEach((arr) => {
      const replacement = new RegExp(arr[0], "g"); // 0 is the ID
      // Test if the text contains the ID
      const regexTest = replacement.test(this.text);
      if (regexTest) this.text = this.text.replace(replacement, arr[1]); // 1 is the <span>text</span>
    });
  }

  updateID() {
    this.id += 1;
  }
}

module.exports.TextHighlighter = TextHighlighter;
