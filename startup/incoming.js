const util = require("../utilities/util.js");
const Text = require("../models/Text.js");
const chalk = require("chalk");
// Standard process for all incoming requests
module.exports = function (app) {
  app.use("*", async (req, res, next) => {
    // [1] Request contains body
    if (!req.body) return next();

    // [2] Body has an input
    if (!req.body.input) req.body.input = "";

    // [3] Body has options object
    if (!req.body.options) req.body.options = {};

    // [4] Ascertain type of input
    const { input, options } = req.body;
    const type = typeof input;

    // [A] Input is a string
    if (type === "string") {
      // Clean text string
      const text = util.cleanString(input);

      // Add to req
      req.text = text || "";

      // Create EditorJS object from String
      const editorjs = util.createEditorJS(text, options);
      req.editor = editorjs || {};

      return next();
    }

    // [B] Input is an object
    if (type === "object") {
      // Does object look like an EditorJS object?
      const isEditorJS = util.isEditorJS(input);

      if (!isEditorJS) return res.redirect("/error");

      // Does editor has blocks with length > 0?
      const hasBlocks = input.blocks.length > 0;

      // Clean editor
      const editorjs = util.cleanEditor(input);

      // Set editor
      req.editor = editorjs;

      // Extract full text from editor
      const text = util.extractText(editorjs);

      // Add to req
      req.text = text || "";

      return next();
    }

    // [C] Input is not a string or object
    return res.redirect("/error");

    // At the end, we should be able to access req.text and req.editor from all routes.
  });

  // Data collection
  app.use("*", async (req, res, next) => {
    // Save req.text to database
    if (req.text) {
      const { text } = req;
      const textSample = new Text({
        text: text,
      });

      await textSample.save();
    }

    next();
  });
};
