"use strict";

/**
 * Takes a string of text as input and will Find & Replace against a dictionary
 * @param  {[String]} s      Input text
 * @param  {[Array]}  dict   Dictionary
 * @return {[Object]}        JSON
 */
class TextHighlighter {
    text:string;
    original: string;
    id:number;
    dict:Array<any>;
    formatting: Array<any>;
    replacements:Array<any>;

    constructor(s:string, dict:Array<any>) {
    if (typeof s === "undefined" || !s.toString) {
      throw new Error("TextHighlighter only works with strings and values that can be coerced into a string");
    }

    if (dict.length === 0) {
         throw new Error("TextHighlighter requires a dictionary to be applied");
    }
    this.text = s.toString();
    this.original = s.toString();
    this.dict = dict;
    this.id = 0;
    this.formatting = [];
    this.replacements = [];

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
    const regex = /<[^>]*(>|$)/

    // Find first instances
    let latestIndex:number = 0;
    let findIndex:number;
    let endIndex:number = 0;

    do {
        // Find the index of next tag
        findIndex = regexIndexOf(this.text, regex, latestIndex)
        console.log("findIndex", findIndex)

        // Capture string, length
        let currentChar = this.text.charAt(findIndex)
        console.log("currentChar", currentChar)
        endIndex = findIndex+1;
        while (currentChar !== ">") {
            endIndex++;
            currentChar = this.text.charAt(endIndex)
            console.log("currentChar", currentChar)
        }
        const foundTag = this.text.slice(findIndex, endIndex+1)

        // Add to array
        if (findIndex > -1) this.formatting.push([foundTag, findIndex, endIndex-findIndex+1])

        // Update index
        latestIndex = findIndex +1
    } while (latestIndex > 0)
        
    

    // Aux function that adds Regex to String.IndexOf
   function regexIndexOf(string:string, regex:RegExp, startpos:number) {
    let indexOf = string.substring(startpos || 0).search(regex);
    return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
}

  }

 findAndReplace() {
     // Mimicking the regex boundary (which doesn't include ÆÆÅ)
    const b1 = "(\\s|\\.|\\,|\\!|\\?|\\(|\\)|\\'|\\\"|^)";
    const b2 = "(\\s|\\.|\\,|\\!|\\?|\\(|\\)|\\'|\\\"|$)";

    // Loop through the dictionary & see if there are any matches in the text.
  for (let j = 0; j < this.dict.length; j++) {
    let [regex, type, popover, i, left, right] = [
      this.dict[j][1],
      this.dict[j][2],
      this.dict[j][3],
      this.dict[j][4],
      this.dict[j][5],
      this.dict[j][6],
    ];

    // Create search string based on the dictionary specifications (e.g. include 'borders')
    let searchString = regex;
    if (left === 1) searchString = b1 + searchString;
    if (popover === null) popover = "";
    if (right === 1) searchString = searchString + b2;
    searchString = `(${searchString})`;

    // Create RegExp string
    let regexString;
    i === 0 ? (regexString = new RegExp(searchString, "g")) : (regexString = new RegExp(searchString, "gi"));

    // Run the test
    let checkIfMatch = regexString.test(this.text);

    // Only proceed if there is a match
    if (checkIfMatch) {
      let textMatch = RegExp["$&"];
      textMatch = textMatch.trim();

      const textForPopoverTitle:string = textMatch.replace(/[.,\/#!?"'$%\^&\*;:{}=\_`~()]/g, "");
      const popoverTitle:string = `${type} <span class='badge bg-${type} ms-2'>${textForPopoverTitle}</span>`;
      const firstPartOfString:string = ` <span class="${type}" 
        data-bs-toggle="popover" 
        data-bs-original-title="${popoverTitle}"
        data-bs-html="true" 
        data-bs-content="${popover}">`

      const stringContent:string = textMatch;
      const endOfString:string = "</span>"

      const replacementString = firstPartOfString+stringContent+endOfString;
    
    // Create array with unique IDs and replacement HTML strings, with spaces surrounding it
      this.updateID();

      // TODO An array with StartPos that can be used with the formatting array
      this.replacements.push([this.id, replacementString, type, 0, firstPartOfString.length, stringContent.length, endOfString.length ]);

      // Replace the offending bit of text with an ID so as to avoid re-running this process on the popover text.
      this.text = this.text.replaceAll(regexString, String(this.id));

    }
  }
 }

 // TODO Move to client?
 reconvertText() {
     if (this.replacements.length === 0) this.findAndReplace();

     this.replacements.forEach(arr => {
        const replacement = new RegExp(arr[0], "g") // 0 is the ID
         // Test if the text contains the ID
        const regexTest = replacement.test(this.text);
        if (regexTest) this.text = this.text.replace(replacement, arr[1]) // 1 is the <span>text</span>
     })
     
 }

  
updateID() {
    if (this.id === 0) {this.generateInitialID}
    this.id++;
}

generateInitialID() {
   this.id = Math.floor(100000000 + Math.random() * 900000000);
}

}

module.exports.TextHighlighter = TextHighlighter;