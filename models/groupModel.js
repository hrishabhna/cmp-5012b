const fs   = require('fs');
const path = require('path');
const DB   = path.join(__dirname, '../data/groups.json');

const readAll  = ()     => JSON.parse(fs.readFileSync(DB, 'utf-8'));
const writeAll = (data) => fs.writeFileSync(DB, JSON.stringify(data, null, 2));

exports.getByUser   = (username) => readAll().filter(g => g.members.includes(username));
exports.findByCode  = (code)     => readAll().find(g => g.code === code);
exports.createGroup = (group)    => {
    const all = readAll();
    group.code = Math.random().toString(36).substring(2, 8).toUpperCase();
    group.id   = Date.now();
    group.members = [group.createdBy];
    all.push(group); writeAll(all); return group;
};
exports.addMember = (code, username) => {
    const all = readAll(); const i = all.findIndex(g => g.code === code);
    if (i === -1) throw new Error('Invalid join code');
    if (all[i].members.includes(username)) throw new Error('Already a member');
    all[i].members.push(username); writeAll(all); return all[i];
};
exports.removeMember = (groupId, username) => {
    const all = readAll(); const i = all.findIndex(g => g.id === Number(groupId));
    if (i === -1) throw new Error('Group not found');
    all[i].members = all[i].members.filter(m => m !== username); writeAll(all);
};
