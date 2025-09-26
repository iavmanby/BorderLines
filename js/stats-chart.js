
const RAW_URL = 'data/line-stats.jsonl';
const ctx = document.getElementById('checkpointChart').getContext('2d');
let chart;


function loadAndDrawChart() {
  fetch(RAW_URL)
    .then(res => {
      if (!res.ok) throw new Error(`Ошибка HTTP ${res.status}`);
      return res.text();
    })
    .then(text => {
      const lines = text.split('\n').filter(l => l).map(JSON.parse);
      drawChart(lines);
    })
    .catch(err => {
      console.error('Ошибка при загрузке данных:', err);
      alert('Не удалось загрузить данные. Проверьте Raw URL и доступность файла.');
    });
}

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

  if (chart) chart.destroy();
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

// Запускаем отрисовку при загрузке страницы
document.addEventListener('DOMContentLoaded', loadAndDrawChart);