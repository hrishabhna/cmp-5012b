const fs   = require('fs');
const path = require('path');
const DB   = path.join(__dirname, '../data/activities.json');

const readAll  = ()     => JSON.parse(fs.readFileSync(DB, 'utf-8'));
const writeAll = (data) => fs.writeFileSync(DB, JSON.stringify(data, null, 2));

exports.getByUser      = (username) => readAll().filter(a => a.userId === username);
exports.addActivity    = (activity) => { const all = readAll(); activity.id = Date.now(); all.push(activity); writeAll(all); return activity; };
exports.updateActivity = (id, updates) => {
    const all = readAll();
    const i   = all.findIndex(a => a.id === Number(id));
    if (i === -1) throw new Error('Activity not found');
    all[i] = { ...all[i], ...updates }; writeAll(all); return all[i];
};
exports.deleteActivity = (id) => { writeAll(readAll().filter(a => a.id !== Number(id))); };
