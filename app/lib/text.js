module.exports.TextParser = class TextParser {
    constructor(s) {
        if (typeof s === "undefined" || !s.toString) {
            throw new Error("TextParser only works with strings and values that can be coerced into a string");
        }
        this.text = s.toString();
        this.original = s.toString();
    }
    removeHTML() {
        this.text = this.text.replace(/<[^>]*(>|$)|&nbsp;|&zwnj;|&raquo;|&laquo;|&gt;/gi, " ");
        return this;
    }
    removeHTMLexceptFormatting() {
        this.text = this.text.replace(/<[^>bia]*(>|$)|&nbsp;|&zwnj;|&raquo;|&laquo;|&gt;/gi, " ");
        return this;
    }
    removeDoubleSpacing() {
        this.text = this.text.replace(/\s+/g, " ");
        return this;
    }
    removeNonLetters() {
        this.text = this.text
            .replace(/&amp;/g, "og")
            .replace(/[.,()"'!;\n\r]/g, " ")
            .replace(/&amp;|&nbsp;|&zwnj;|&raquo;|&laquo;|&gt;/gi, " ")
            .replace("\xc2\xa0", " ")
            .replace("  ", " ");
        return this;
    }
    static fnRemoveNonLetters(string) {
        return string
            .replace(/&amp;/g, "og")
            .replace(/[.,()"'!;\n\r]/g, " ")
            .replace(/&amp;|&nbsp;|&zwnj;|&raquo;|&laquo;|&gt;/gi, " ")
            .replace("  ", " ");
    }
    removePunctuation() {
        this.text = TextParser.fnRemovePunctuation(this.text);
        return this;
    }
    static fnRemovePunctuation(string) {
        return string.replace(/[.,/#!?"$%^*;:{}«»=_`~()]/g, " ").replace("  ", " ");
    }
    convLowerCase() {
        this.text = this.text.toLowerCase();
        if (this.words !== undefined)
            this.words.forEach((word) => word.toLowerCase());
        return this;
    }
    convUpperCase() {
        this.text = this.text.toUpperCase();
        if (this.words !== undefined)
            this.words.forEach((word) => word.toUpperCase());
        return this;
    }
    trimText() {
        this.text = this.text.trim();
        if (this.words !== undefined)
            this.words.forEach((word) => word.trim());
        return this;
    }
    removeWords(arrayOfWords) {
        arrayOfWords.forEach((word) => {
            const regexString = new RegExp(`\\s${word}\\s`, "ig");
            this.text = this.text.replaceAll(regexString, " ");
        });
        this.removeDoubleSpacing();
        return this;
    }
    titleCaseAllWords() {
        this.words.map((word) => word[0].toUpperCase() + word.slice(1));
        return this;
    }
    static fnTitleCaseWord(word) {
        return word[0].toUpperCase() + word.slice(1);
    }
    getSentences() {
        this.sentences = this.text
            .replace(/[.?!:;](\s|$)/g, "$1|x")
            .split("|x")
            .filter((x) => x.length > 0);
        console.log(this.text);
        this.sentenceCount = this.sentences.length;
        return this;
    }
    getWords(threshold = 6) {
        this.words = TextParser.fnRemoveNonLetters(this.text)
            .split(/\s+/)
            .filter((n) => n !== "");
        this.wordCount = this.words.length;
        this.longWords = this.words.filter((s) => s.length > threshold);
        this.longWordCount = this.longWords.length;
        return this;
    }
    countCharacters() {
        this.charsNoSpaces = this.text.length;
        this.charsWithSpaces = this.text.split(" ").join("").length;
        return this;
    }
    removeDuplicates(inputArray = this.words) {
        if (inputArray.length <= 1)
            return 0;
        if (inputArray[0].length > 1) {
            const set = new Set(inputArray.map((x) => JSON.stringify(x)));
            const arr = Array.from(set).map((x) => JSON.parse(x));
            return arr;
        }
        return inputArray.sort().filter((v, i, o) => v !== o[i - 1]);
    }
    static generateFrequencyMap(inputArray) {
        const frequency = {};
        inputArray.forEach((item) => {
            frequency[item] = (frequency[item] || 0) + 1;
        });
        return frequency;
    }
    static compareSecondColumn(a, b) {
        if (a[1] === b[1])
            return 0;
        return a[1] > b[1] ? -1 : 1;
    }
    static lemmafyWord(word, lemmaDict) {
        const found = lemmaDict[word];
        if (found === undefined)
            return word;
        return found;
    }
    lemmafyText(lemmaDict) {
        if (lemmaDict.length === 0) {
            console.log("ERR: No lemma lookup file provided");
            return this;
        }
        if (this.words.length === 0)
            this.getWords();
        this.words = this.words.map((word) => TextParser.lemmafyWord(word, lemmaDict));
        return this;
    }
    static convertValToEmoji(score) {
        try {
            switch (true) {
                case score < 2:
                    return "🤬";
                case score < 3:
                    return "😡";
                case score < 4:
                    return "😠";
                case score < 5:
                    return "😐";
                case score < 6:
                    return "🙂";
                case score < 7:
                    return "😄";
                case score < 8:
                    return "😁";
                case score < 9:
                    return "🤩";
                default:
                    return "🤷‍♂️";
            }
        }
        catch (err) {
            console.log(err);
            return "🤷‍♂️";
        }
    }
};
