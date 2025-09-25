<script type="module">
import { checkpoints, getCheckpointStatistics } from './common.js';

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

(async () => {
  const output = document.getElementById("output");
  try {
    const results = [];
    for (const key in checkpoints) {
      const cp = checkpoints[key];
      const stat = await getCheckpointStatistics(cp.id, window.fetch);
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
</script>
