 
async function get(url) {
  return fetch(url).then(r => r.json());
}
 
function label(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); //this converts the date string into a simpler version
}
 
function makeChart(container, type, labels, values, color) {
  const canvas = document.createElement('canvas');
  document.getElementById(container).appendChild(canvas);
  new Chart(canvas, {
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
      scales: { x: { display: false }, y: { beginAtZero: true } }
    }
  });
}
 
async function loadCharts() {
  const weight   = await get('/api/dashboard/weight');
  const calories = await get('/api/dashboard/calories');
  const exercise = await get('/api/dashboard/exercise');
 
  // Weight — new card above weekly bars (needs <canvas id="chart-weight"> in index.html)
  if (weight.length)
    makeChart('chart-weight', 'line', weight.map(d => label(d.date)), weight.map(d => d.value), 'rgb(74, 222, 128)');
 
  // Calories — renders inside existing #cal-chart div
  if (calories.length)
    makeChart('cal-chart', 'bar', calories.map(d => label(d.date)), calories.map(d => d.value), 'rgb(96, 165, 250)');
 
  // Exercise — renders inside existing #ex-chart div
  if (exercise.length)
    makeChart('ex-chart', 'bar', exercise.map(d => label(d.date)), exercise.map(d => d.value), 'rgb(244, 114, 182)');
}
 
document.addEventListener('DOMContentLoaded', loadCharts);