/* createDataFiles.js :: One-time script to turn the original CSV files into JSON files */

const fs = require("fs");
const papa = require("papaparse");
const path = require("path");
const Fuse = require("fuse.js");
const chalk = require("chalk");

// Stopord
const stopordFile = fs.readFileSync("./app/raw/stopord.csv", "utf8");
const stopord = papa.parse(stopordFile, { fastMode: true }).data;
fs.writeFileSync("./app/data/stopord.json", JSON.stringify(stopord));
console.log(`💾 ${chalk.green("[Stopord]")} Converted the CSV file to JSON`, stopord.length);

// Hedonometer
const hedonometerFile = fs.readFileSync("./app/raw/hedonometer.csv", "utf8");
const hedonometerCsv = papa.parse(hedonometerFile, { fastMode: true }).data;
const hedonometer = hedonometerCsv.map((x) => ({
  id: x[0],
  english: x[1],
  danish: x[3],
  mean: x[4],
  sigma: x[5],
}));
fs.writeFileSync("./app/data/hedonometer.json", JSON.stringify(hedonometer));
console.log(`💾 ${chalk.green("[Hedonometer]")} Converted the CSV file to JSON`, hedonometer.length);

// Hedonometer - Fuse (Fuzzy Search)
const hedonometerFuse = new Fuse(hedonometer, {
  includeScore: true,
  threshold: 0.6,
  keys: ["danish"],
});
fs.writeFileSync("./app/data/hedonometerFuse.json", JSON.stringify(hedonometerFuse));
console.log(`💾 ${chalk.green("[Hedonometer - Fuse]")} Saved object to JSON`);

// Lemmas
const lemmasFile = fs.readFileSync("./app/raw/lemmas.csv", "utf8");
const lemmasCsv = papa.parse(lemmasFile, { fastMode: true }).data;
const lemmasDict = {};
for (const key of lemmasCsv) {
  lemmasDict[key[0]] = key[1];
}
fs.writeFileSync("./app/data/lemmas.json", JSON.stringify(lemmasDict));
console.log(`💾 ${chalk.green("[Lemmas]")} Converted the CSV file to JSON`, Object.keys(lemmasDict).length);

// Frequency
const frequencyFile = fs.readFileSync("./app/raw/frequency-ex.csv", "utf8");
const frequency = papa.parse(frequencyFile).data;
fs.writeFileSync("./app/data/frequency.json", JSON.stringify(frequency));
console.log(`💾 ${chalk.green("[Frequency]")} Converted the CSV file to JSON`, frequency.length);

// Misspelling
const misspellingsFile = fs.readFileSync("./app/raw/misspellings.csv", "utf8");
const misspellings = papa.parse(misspellingsFile).data;
fs.writeFileSync("./app/data/misspellings.json", JSON.stringify(misspellings));
console.log(`💾 ${chalk.green("[Misspellings]")} Converted the CSV file to JSON`, misspellings.length);
