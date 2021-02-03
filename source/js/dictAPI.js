// Convert to DB? SQlLITE? or cronjob every week or so

const fs = require("fs");
var Airtable = require("airtable");
Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: "keyKqpeaXBPGoZ89S",
});
var base = Airtable.base("appvCPftxeNp5OEBx");

let arr = [];
base("RMT")
  .select({
    // Selecting the first 3 records in Grid view:
    // maxRecords: 10,
    // view: "Grid view",
  })
  .eachPage(
    async function page(records, fetchNextPage) {
      // This function (`page`) will get called for each page of records.

      records.forEach(function (record) {
        arr.push([
          record.get("Tekst"),
          record.get("Regex"),
          record.get("Type"),
          record.get("Tooltip"),
          record.get("Case"),
          record.get("b_left"),
          record.get("b_right"),
        ]);
      });

      // To fetch the next page of records, call `fetchNextPage`.
      // If there are more records, `page` will get called again.
      // If there are no more records, `done` will get called.
      fetchNextPage();
    },
    function done(err) {
      if (err) {
        console.error(err);
        return;
      } else {
        fs.writeFile("js/array.js", "export const dict = " + JSON.stringify(arr, null, 1), (err) => {
          // In case of a error throw err.
          if (err) throw err;
        });
      }
    }
  );

exports.dict = arr;
