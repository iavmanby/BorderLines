import fs from "fs";
import path from "path";
import fetch from "node-fetch"; // npm install node-fetch@3
import { checkpoints, getCheckpointStatistics } from "./js/common.js";

const dataFile = path.resolve("stats.json");

async function run() {
  const timestamp = new Date().toISOString();
  const results = [];

  for (const key in checkpoints) {
    const cp = checkpoints[key];
    const stat = await getCheckpointStatistics(cp.id, fetch);
    results.push({
      name: cp.name,
      carLastHour: stat.carLastHour,
      carLastDay: stat.carLastDay
    });
  }

  let history = [];
  if (fs.existsSync(dataFile)) {
    history = JSON.parse(fs.readFileSync(dataFile, "utf-8"));
  }
  history.push({ timestamp, data: results });

  fs.writeFileSync(dataFile, JSON.stringify(history, null, 2), "utf-8");
  console.log(`Обновлено ${results.length} пунктов на ${timestamp}`);
}

run().catch(err => console.error(err));
