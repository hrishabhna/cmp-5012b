// data/chartData.js
 
const fs = require('fs');
const path = require('path');
 
function load(file) {
  try { return JSON.parse(fs.readFileSync(path.join(__dirname, file), 'utf8')); }
  catch { return []; }
}
 
function dayStr(d) {
  return new Date(d).toISOString().split('T')[0];
}
 
function groupByDay(items, key) {
  const totals = {};
  items.filter(i => i.date && i[key]).forEach(i => {
    totals[dayStr(i.date)] = (totals[dayStr(i.date)] || 0) + Number(i[key]);
  });
  return Object.entries(totals)
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
 
module.exports = {
  weight:   () => load('users.json').filter(u => u.date && u.weight).map(u => ({ date: dayStr(u.date), value: u.weight })).sort((a, b) => a.date.localeCompare(b.date)),
  calories: () => groupByDay(load('activities.json'), 'calories'),
  exercise: () => groupByDay(load('activities.json'), 'duration'),
};