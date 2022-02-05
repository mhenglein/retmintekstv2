const chalk = require("chalk");

// Utility modules
const util = require("../utilities/util.js");

module.exports = async (req, res) => {
  const { input, options } = req.body;
  console.log(chalk.blue("Cleaning text..."), input);
  if (!input) return null;

  const text = util.cleanString(input, options);
  if (text) return res.json({ text: text.text, response: "success" });
  return res.json({ response: "failure" }).end();
};
