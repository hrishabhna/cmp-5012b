const fs     = require('fs');
const path = require('path');
const DB     = path.join(__dirname, '../data/users.json');

const readAll  = ()     => JSON.parse(fs.readFileSync(DB, 'utf-8'));
const writeAll = (data) => fs.writeFileSync(DB, JSON.stringify(data, null, 2));

exports.findByUsername = (username) => readAll().find(u => u.username === username);
exports.findByEmail      = (email)      => readAll().find(u => u.email === email);
exports.createUser       = (user)       => { const all = readAll(); all.push(user); writeAll(all); };
exports.updateUser       = (username, updates) => {
    const all = readAll();
    const i     = all.findIndex(u => u.username === username);
    if (i === -1) throw new Error('User not found');
    all[i] = { ...all[i], ...updates };
    writeAll(all);
    return all[i];
};
