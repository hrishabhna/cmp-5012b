const express    = require('express');
const router     = express.Router();
const groupModel = require('../models/groupModel');

router.get('/user/:username', (req, res) => res.json(groupModel.getByUser(req.params.username)));
router.post('/',              (req, res) => res.json(groupModel.createGroup(req.body)));
router.post('/join',          (req, res) => {
    try { res.json(groupModel.addMember(req.body.code, req.body.username)); }
    catch (e) { res.status(400).json({ error: e.message }); }
});
router.delete('/:id/leave',   (req, res) => {
    try { groupModel.removeMember(req.params.id, req.body.username); res.json({ message: 'Left group' }); }
    catch (e) { res.status(404).json({ error: e.message }); }
});

module.exports = router;
