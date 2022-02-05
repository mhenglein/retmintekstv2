// openai tools fine_tunes.prepare_data -f <LOCAL_FILE>

// After you’ve fine-tuned a model, remember that your prompt has to end with the indicator string `\n\n###\n\n` for the model to start generating completions, rather than continuing with the prompt. Make sure to include `stop=["###"]` so that the generated texts ends at the expected place.
// Once your model starts training, it'll approximately take 7.05 hours to train a `curie` model, and less for `ada` and `babbage`. Queue will approximately take half an hour per job ahead of you.

// openai api fine_tunes.create -t <TRAIN_FILE_ID_OR_PATH> -m <BASE_MODEL>

const fs = require("fs-extra");
const { encode, decode } = require("gpt-3-encoder");
const { TextParser } = require("../utilities/text.js");

// textparser

// Load terminale kvinders klub
const terminal = fs.readFileSync("data/text_raw/terminal.txt", "utf8");
const arvesynden = fs.readFileSync("data/text_raw/arvesynden.txt", "utf8");
const før = fs.readFileSync("data/text_raw/før.txt", "utf8");
const kønslig = fs.readFileSync("data/text_raw/kønslig.txt", "utf8");
const smukke = fs.readFileSync("data/text_raw/smukke.txt", "utf8");

const sources = [terminal, arvesynden, før, kønslig, smukke];
// const sources = [terminal];
const json = [];

// Get random number of words
function chunk(items, maxWords) {
  const chunks = [];

  let size;

  while (words.length) {
    size = Math.ceil(Math.random() * maxWords);
    chunks.push(items.slice(0, size));
    items = items.slice(size);
  }

  return chunks;
}

sources.forEach((source) => {
  const parser = new TextParser(source).removeDoubleSpacing().getSentences();
  const sentences = parser.getWords().sentences;

  // Group into pairs of sentences
  const pairs = [];
  for (let i = 0; i < sentences.length; i += 2) {
    pairs.push([sentences[i], sentences[i + 1]]);
  }

  pairs.forEach((pair) => {
    const [prompt_raw, completion_raw] = pair;

    const prompt = prompt_raw + "\n\n###\n\n";
    const completion = " " + completion_raw + "###";
    const entry = { prompt: prompt, completion: completion };
    json.push(entry);
  });
});

const jsonl = json.map((x) => JSON.stringify(x)).join("\n");
fs.writeFileSync("data/text_jsonl/terminal1.jsonl", jsonl);

// // Input: 250 tokens (1000 chars), Output: 100 tokens (400 chars), i.e. 400/1400 = 0.3
// // Split text into array of chunks of random length
// const chunks = chunk(text, 1000);
// const segregated = [];
// chunks.forEach((chunk) => {
//   // Get first 70% of string of chunk as traning data
//   const prompt = chunk.slice(0, Math.floor(chunk.length * 0.7)) + "\n\n###\n\n";

//   // Get last 30% of string of chunk as test data
//   const completion = " " + chunk.slice(Math.floor(chunk.length * 0.7)) + "###";

//   segregated.push([prompt, completion]);
// });

// segregated.forEach((segregated) => {
//   const [prompt, completion] = segregated;
//   const entry = { prompt: prompt, completion: completion };
//   json.push(entry);
// });

// const sentences = textParser.sentences;
// const sentencesWithWhitespaceInFront = sentences.map((x) => " " + x);

// sentencesWithWhitespaceInFront.forEach((sentence, index) => {
//   // Count tokens
//   const tokens = encode(sentence).length;

//   if (tokens > 2048) {
//     console.log(index);
//     return;
//   }

//   const entry = { prompt: "", completion: `${sentence}` };
//   json.push(entry);
// });
// });

// const jsonl = json.map((x) => JSON.stringify(x)).join("\n");

// // save jsonl to file in data/text_jsonl/terminal.jsonl
// fs.writeFileSync("data/text_jsonl/final.jsonl", jsonl);
