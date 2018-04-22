import fs from "fs";
import path from "path";
import garmin from "./garmin";

const data = fs.readFileSync(
  path.resolve(__dirname, "activity_2637228994.tcx"),
  "utf8"
);

const result = JSON.stringify(
  JSON.parse(JSON.stringify(garmin(data))),
  null,
  2
);

fs.writeFile("./output.json", result, "utf8", function(err) {
  if (err) {
    return console.log(err);
  }

  console.log("The file was saved!");
});
