const checkPronouns = require("../controllers/checkPronouns");
const correctText = require("../controllers/correctText");
const evaluateVocabulary = require("../controllers/evaluateVocabulary");
const rateSentiment = require("../controllers/rateSentiment");
const sentenceDifficulty = require("../controllers/sentenceDifficulty");
const showLongwords = require("../controllers/showLongwords");
const sentenceRhythm = require("../controllers/sentenceRhythm");
const textMetrics = require("../controllers/textMetrics");
const clean = require("../controllers/api");

module.exports = function (app) {
  /* GET routes */
  app.get("/", (req, res) => {
    res.render("index");
  });

  app.get("/api", (req, res) => {
    res.render("api");
  });

  app.post("/api/gpt", async (req, res) => {
    const { prompt, options } = req.body;
    const { Configuration, OpenAIApi } = require("openai");

    const max_tokens = options.max_tokens || 64;
    const temperature = options.temperature || 0.7;

    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    const response = await openai.listFineTunes();
    console.log(response.data);

    // const completion = await openai.createCompletion("curie:ft-personal-2022-01-31-07-12-21", {
    //   prompt,
    //   max_tokens,
    //   temperature,
    // });

    // return res.json({ completion: completion.data.choices[0].text }).end();
  });

  /* API routes */
  app.post("/api/clean", clean);
  app.post("/api/text-metrics", textMetrics); // Generelt
  app.post("/api/correct-text", correctText); // Tekstforslag (Rettelser)
  app.post("/api/evaluate-vocab", evaluateVocabulary); // Ordforråd
  app.post("/api/longwords", showLongwords); // LIX & Lange ord
  app.post("/api/sentence-rhythm", sentenceRhythm); // Tekstrytme
  app.post("/api/rate-sentiment", rateSentiment); // Sentiment
  app.post("/api/sentence-difficulty", sentenceDifficulty); // Sætningsanalyse
  // app.post("/api/checkpronouns", apiController.checkPronouns);
};
