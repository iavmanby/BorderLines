const RAW_URL = 'data/line-stats.jsonl';

const ctxLastDay = document.getElementById('chartLastDay').getContext('2d');
const ctxCurrent = document.getElementById('chartCurrent').getContext('2d');

let chartLastDay, chartCurrent;
let originalData;

document.addEventListener('DOMContentLoaded', loadAndDrawCharts);

function loadAndDrawCharts() {
  fetch(RAW_URL)
    .then(res => {
      if (!res.ok) throw new Error(`Ошибка HTTP ${res.status}`);
      return res.text();
    })
    .then(text => {
      const lines = text.split('\n').filter(l => l).map(JSON.parse);
      originalData = lines;
      // Строим два графика
      chartLastDay = drawChart(ctxLastDay, lines, 'carLastDay', 'Машины за последние сутки', chartLastDay);
      chartCurrent = drawChart(ctxCurrent, lines, 'currentCar', 'Текущие машины в очереди', chartCurrent);
    })
    .catch(err => {
      console.error('Ошибка при загрузке данных:', err);
      alert('Не удалось загрузить данные. Проверьте доступность файла.');
    });
}

/**
 * Универсальная функция для построения графика
 * @param {CanvasRenderingContext2D} ctx - canvas context
 * @param {Array} dataHistory - массив объектов статистики
 * @param {string} key - ключ данных в объекте (carLastDay, currentCar и т.д.)
 * @param {string} title - заголовок графика
 * @param {Chart|null} chartInstance - существующий chart для разрушения перед перерисовкой
 */
function drawChart(ctx, dataHistory, key, title, chartInstance) {
  if (!dataHistory.length) return;

  const labels = dataHistory.map(item => new Date(item.timestamp).toLocaleTimeString());
  const checkpointNames = dataHistory[0].data.map(d => d.name);

  const datasets = checkpointNames.map((name, idx) => ({
    label: name,
    data: dataHistory.map(item => item.data[idx][key] ?? 0),
    borderColor: `hsl(${idx * 60}, 70%, 50%)`,
    backgroundColor: `hsla(${idx * 60}, 70%, 50%, 0.2)`,
    fill: true,
    tension: 0.3
  }));

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: title },
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

  return chartInstance;
}

function filterCharts(period) {
  let filteredData = originalData;
  const now = Date.now();
  const periods = {
    '1day': 24 * 60 * 60 * 1000,
    'week': 7 * 24 * 60 * 60 * 1000,
    'month': 30 * 24 * 60 * 60 * 1000,
    '6months': 180 * 24 * 60 * 60 * 1000,
    'all': Infinity
  };
  if (period !== 'all') {
    filteredData = originalData.filter(item => now - item.timestamp < periods[period]);
  }
  // Перерисовываем графики с отфильтрованными данными
  chartLastDay = drawChart(ctxLastDay, filteredData, 'carLastDay', 'Машины за последние сутки', chartLastDay);
  chartCurrent = drawChart(ctxCurrent, filteredData, 'currentCar', 'Текущие машины в очереди', chartCurrent);
}
