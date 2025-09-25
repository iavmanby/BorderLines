// === Общая часть (раньше common.js) ===
export const checkpoints = {
  benyakoni: { id: "53d94097-2b34-11ec-8467-ac1f6bf889c0", name: "Benyakoni" },
  "kamennii-log": { id: "b60677d4-8a00-4f93-a781-e129e1692a03", name: "Kamennii Log" }
};

const baseUrl = "https://belarusborder.by/info";
const tokenTest = "test";

/**
 * Возвращает статистику для указанного checkpointId
 * @param {string} checkpointId
 */
export async function getCheckpointStatistics(checkpointId) {
  const url = `${baseUrl}/monitoring/statistics?token=${tokenTest}&checkpointId=${checkpointId}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Ошибка HTTP ${response.status}`);
  return await response.json();
}

// === Функция рендеринга таблицы ===
function renderTable(data) {
  const rows = data.map(d => `
    <tr>
      <td>${d.name}</td>
      <td>${d.carLastHour}</td>
      <td>${d.carLastDay}</td>
    </tr>
  `).join("");

  return `
    <table border="1">
      <thead>
        <tr>
          <th>Переход</th>
          <th>За последний час</th>
          <th>За день</th>
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
    const results = [];
    for (const key in checkpoints) {
      const cp = checkpoints[key];
      const stat = await getCheckpointStatistics(cp.id);
      results.push({
        name: cp.name,
        carLastHour: stat.carLastHour,
        carLastDay: stat.carLastDay
      });
    }
    output.innerHTML = renderTable(results);
  } catch (err) {
    output.innerHTML = `<p style="color:red">Ошибка: ${err.message}</p>`;
  }
})();
