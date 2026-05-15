 const fs = require('fs');
const path = require('path');
 
function load(file) {//reads the file and returns the data as a JSON object. If the file doesn't exist or is invalid, it returns an empty array.
  try { return JSON.parse(fs.readFileSync(path.join(__dirname, file), 'utf8')); }
  catch { return []; }
}
 
function dayStr(d) {//this converts the date into a string in the format of YYYY-MM-DD, which is used for grouping the data by day.
  return new Date(d).toISOString().split('T')[0];
}
 
function groupByDay(items, key) {//this function takes an array of items and a key, and it groups the items by day based on the date property. It sums the values of the specified key for each day and returns an array of objects with date and value properties, sorted by date.
  const totals = {};
  items.filter(i => i.date && i[key]).forEach(i => {
    totals[dayStr(i.date)] = (totals[dayStr(i.date)] || 0) + Number(i[key]);
  });
  return Object.entries(totals) //returns an array of key-value pairs from the totals object, where each key is a date and each value is the total for that date. It then maps each pair to an object with date and value properties, and sorts the resulting array by date.
    .map(([date, value]) => ({ date, value }))//maps each key-value pair to an object with date and value properties.
    .sort((a, b) => a.date.localeCompare(b.date));
}
 
module.exports = { //this exports an object with three methods: weight, calories, and exercise. Each method loads the relevant data from the corresponding JSON file, processes it, and returns an array of objects with date and value properties, sorted by date.
  weight:   () => load('users.json').filter(u => u.date && u.weight).map(u => ({ date: dayStr(u.date), value: u.weight })).sort((a, b) => a.date.localeCompare(b.date)),
  calories: () => groupByDay(load('activities.json'), 'calories'),//this loads the activities data from the activities.json file, groups it by day based on the date property, and sums the calories for each day. It returns an array of objects with date and value properties, sorted by date.
  exercise: () => groupByDay(load('activities.json'), 'duration'),//this loads the activities data from the activities.json file, groups it by day based on the date property, and sums the duration for each day. It returns an array of objects with date and value properties, sorted by date.
};