// public/js/charts.js
 
async function get(url) {
  return fetch(url).then(r => r.json());
}
 
function label(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
 
function makeChart(id, type, labels, values, color) {
  new Chart(document.getElementById(id), {
    type,
    data: {
      labels,
      datasets: [{
        data: values,
        borderColor: color,
        backgroundColor: color.replace(')', ', 0.15)').replace('rgb', 'rgba'),
        borderWidth: 2,
        borderRadius: type === 'bar' ? 4 : 0,
        tension: 0.4,
        fill: type === 'line',
        pointRadius: type === 'line' ? 4 : 0,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { x: { ticks: { maxRotation: 45 } }, y: { beginAtZero: true } }
    }
  });
}
 
async function loadCharts() {
  const weight   = await get('/api/dashboard/weight');
  const calories = await get('/api/dashboard/calories');
  const exercise = await get('/api/dashboard/exercise');
 
  if (weight.length)
    makeChart('chart-weight',   'line', weight.map(d => label(d.date)),   weight.map(d => d.value),   'rgb(74, 222, 128)');
 
  if (calories.length)
    makeChart('chart-calories', 'bar',  calories.map(d => label(d.date)), calories.map(d => d.value), 'rgb(96, 165, 250)');
 
  if (exercise.length)
    makeChart('chart-exercise', 'bar',  exercise.map(d => label(d.date)), exercise.map(d => d.value), 'rgb(244, 114, 182)');
}
 
document.addEventListener('DOMContentLoaded', loadCharts);