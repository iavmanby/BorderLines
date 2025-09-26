import fs from "fs";
import path from "path";
import fetch from "node-fetch"; // npm install node-fetch@3
//import { checkpoints, getCheckpointStatistics } from "./public/js/script.js";

const checkpoints = {
  benyakoni: { id: "53d94097-2b34-11ec-8467-ac1f6bf889c0", name: "Benyakoni" },
  "kamennii-log": { id: "b60677d4-8a00-4f93-a781-e129e1692a03", name: "Kamennii Log" }
};

const baseUrl = "https://belarusborder.by/info";
const tokenTest = "test";
const dataFile = path.resolve("stats.json");

async function getCheckpointStatistics(checkpointId) {
  const url = `${baseUrl}/monitoring/statistics?token=${tokenTest}&checkpointId=${checkpointId}`;
  try{
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Ошибка HTTP ${response.status}`);
  return await response.json();
  }
  catch(err){
    console.error(`Ошибка при получении статистики для ${checkpointId}:`, err.message);
    return { carLastHour: "error", carLastDay: "error" };
  }
}

async function getCurrentCheckpoints() {
  const url = `${baseUrl}/checkpoint?token=${tokenTest}`;
  try{
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Ошибка HTTP ${response.status}`);
  const json = await response.json();
  return json.result ?? []; // массив объектов
  }
  catch(err){
    console.error("Ошибка при получении текущих пунктов:", err.message);
    return []; // пустой массив, чтобы цикл не падал
  }
}

async function run() {
  const timestamp = new Date().toISOString();
  const results = [];

   const currentData = await getCurrentCheckpoints();

  for (const key in checkpoints) {
    const cp = checkpoints[key];
    const stat = await getCheckpointStatistics(cp.id);
    const current = currentData.find(c => c.id === cp.id);
    results.push({
      name: cp.name,
      carLastHour: stat.carLastHour ?? "error",
      carLastDay: stat.carLastDay ?? "error",
      currentCar: current?.countCar ?? "error",
    });
  }

  let history = [];
  if (fs.existsSync(dataFile)) {
    const content = fs.readFileSync(dataFile, "utf-8").trim();
    if (content) {
      try {
        history = JSON.parse(content);
      } catch (e) {
        console.error("Ошибка парсинга stats.json, начинаем заново:", e);
        history = [];
      }
    }
  }
  history.push({ timestamp, data: results });

  fs.writeFileSync(dataFile, JSON.stringify(history, null, 2), "utf-8");
  console.log(`Обновлено ${results.length} пунктов на ${timestamp}`);
}

run().catch(err => console.error(err));
