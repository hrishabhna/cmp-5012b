const fs   = require('fs');
const path = require('path');
const DB   = path.join(__dirname, '../data/goals.json');

const readAll  = ()     => JSON.parse(fs.readFileSync(DB, 'utf-8'));
const writeAll = (data) => fs.writeFileSync(DB, JSON.stringify(data, null, 2));

exports.getByUser      = (username) => readAll().filter(g => g.userId === username);
exports.addGoal        = (goal)     => { const all = readAll(); goal.id = Date.now(); all.push(goal); writeAll(all); return goal; };
exports.markComplete   = (id)       => {
    const all = readAll(); const i = all.findIndex(g => g.id === Number(id));
    if (i === -1) throw new Error('Goal not found');
    all[i].completed = true; writeAll(all); return all[i];
};
exports.updateProgress = (id, progress) => {
    const all = readAll(); const i = all.findIndex(g => g.id === Number(id));
    if (i === -1) return null;
    all[i].progress = progress;
    if (all[i].progress >= all[i].target) all[i].completed = true;
    writeAll(all); return all[i];
};
