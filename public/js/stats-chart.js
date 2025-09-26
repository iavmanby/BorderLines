const loadFileBtn = document.getElementById('loadFileBtn');
const ctx = document.getElementById('checkpointChart').getContext('2d');
let chart;

loadFileBtn.addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.jsonl';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function() {
      const lines = reader.result.split('\n').filter(l => l).map(JSON.parse);
      drawChart(lines);
    };
    reader.readAsText(file);
  };
  input.click();
});

function drawChart(dataHistory) {
  if (!dataHistory.length) return;

  const labels = dataHistory.map(item => new Date(item.timestamp).toLocaleTimeString());
  const checkpointNames = dataHistory[0].data.map(d => d.name);

  const datasets = checkpointNames.map((name, idx) => ({
    label: name,
    data: dataHistory.map(item => item.data[idx].carLastHour ?? 0),
    borderColor: `hsl(${idx * 60}, 70%, 50%)`,
    backgroundColor: `hsla(${idx * 60}, 70%, 50%, 0.2)`,
    fill: true,
    tension: 0.3
  }));

  if (chart) chart.destroy(); // удаляем предыдущий график
  chart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: 'Автомобили за последний час' },
        tooltip: { mode: 'index', intersect: false },
        zoom: {
          pan: { enabled: true, mode: 'x' },
          zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' }
        }
      },
      interaction: { mode: 'nearest', axis: 'x', intersect: false },
      scales: { y: { beginAtZero: true } }
    },
    plugins: [ChartZoom]
  });
}
