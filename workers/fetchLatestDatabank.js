/** fetchLatestDatabank.js :: Fetch the latest Databank/Word database from Google Sheets
 * Returns an object, stored in /app/data
 */

const fs = require("fs");
const chalk = require("chalk");
const _ = require("lodash");

class GoogleBot {
  constructor() {
    this.config = require("../config/google.json");
  }

  async initGoogle() {
    const { GoogleSpreadsheet } = require("google-spreadsheet");
    this.doc = new GoogleSpreadsheet("197hP8A0pQS6HfnoXYOjxK4iwU703Ogx9f4T6SzeLl1U");
    await this.doc.useServiceAccountAuth(this.config);
    await this.doc.loadInfo(); // loads document properties and worksheets
  }

  async getDB() {
    const arr = [];

    this.sheet = this.doc.sheetsByTitle["🤓 DB"];
    const rows = await this.sheet.getRows();

    rows.forEach((row) => {
      if (row.Tekst) {
        const newObj = {
          tekst: row.Tekst,
          regex: row.Regex,
          type: row.Type,
          tooltip: row.Tooltip,
          case: row.Case,
          b_left: row.b_left,
          b_right: row.b_right,
        };
        arr.push(newObj);
      }
    });

    // Final sanity check
    const arrDB = _.compact(_.uniqBy(arr, "tekst"));

    fs.writeFileSync("./app/data/db.json", JSON.stringify(arrDB));
  }
}

(async () => {
  const startTime = new Date();
  console.log(`⬇️ ${chalk.green("[DB]")} Fetching latest databank...`);
  console.log(`⏲ Started at ${startTime}`);

  const bot = new GoogleBot();
  await bot.initGoogle();
  console.log("✔️ Google API connected");

  await bot.getDB();
  console.log("✔️ Databank fetched");

  const endTime = new Date();
  const elapsedTime = endTime.getTime() - startTime.getTime();
  console.log(`🏁 Finished at ${endTime}`);
  console.log(`🕓 Elapsed time: ${elapsedTime / 1000} seconds`);
})();
