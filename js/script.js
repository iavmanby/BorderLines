const checkpoints = {
  benyakoni: { id: "53d94097-2b34-11ec-8467-ac1f6bf889c0", name: "Benyakoni" },
  "kamennii-log": { id: "b60677d4-8a00-4f93-a781-e129e1692a03", name: "Kamennii Log" }
};

const baseUrl = "https://belarusborder.by/info";
const tokenTest = "test";
const token = "bts47d5f-6420-4f74-8f78-42e8e4370cc4";
/**
 * Возвращает статистику для указанного checkpointId
 * @param {string} checkpointId
 */
async function getCheckpointStatistics(checkpointId) {
  const url = `${baseUrl}/monitoring/statistics?token=${tokenTest}&checkpointId=${checkpointId}`;
  try{
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Ошибка HTTP ${response.status}`);
    return await response.json();
  }
  catch (err) {
    console.error(`Ошибка при получении статистики для ${checkpointId}:`, err.message);
    return { carLastHour: "error", carLastDay: "error" };
  }
}


async function getCurrentCheckpoints() {
  const url = `${baseUrl}/checkpoint?token=${token}`;
  try{
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Ошибка HTTP ${response.status}`);  
    const json = await response.json();
    return json.result ?? []; // массив объектов
  }  
  catch (err) {
    console.error("Ошибка при получении текущих пунктов:", err.message);
    return []; // возвращаем пустой массив, чтобы цикл не падал
  }
}

// === Функция рендеринга таблицы ===
function renderTable(data) {
  const rows = data.map(d => `
    <tr>
      <td>${d.name}</td>
      <td>${d.carLastHour}</td>
      <td>${d.carLastDay}</td>
      <td>${d.currentCar}</td>
    </tr>
  `).join("");

  return `
    <table border="1">
      <thead>
        <tr>
          <th>Переход</th>
          <th>За последний час</th>
          <th>За день</th>
          <th>Сейчас в очереди</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

// === Основной блок, выполняется сразу ===
(async () => {
  const output = document.getElementById("output");
  try {
    const currentData = await getCurrentCheckpoints();
    const results = [];
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
    output.innerHTML = renderTable(results);
  } catch (err) {
    output.innerHTML = `<p style="color:red">Ошибка: ${err.message}</p>`;
  }
})();
