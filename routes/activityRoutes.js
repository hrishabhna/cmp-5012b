const express             = require('express');
const router                = express.Router();
const activityModel = require('../models/activityModel');

router.get('/:username', (req, res) => res.json(activityModel.getByUser(req.params.username)));
router.post('/',                 (req, res) => res.json(activityModel.addActivity(req.body)));
router.put('/:id',             (req, res) => {
    try { res.json(activityModel.updateActivity(req.params.id, req.body)); }
    catch (e) { res.status(404).json({ error: e.message }); }
});
router.delete('/:id',        (req, res) => {
    activityModel.deleteActivity(req.params.id);
    res.json({ message: 'Deleted' });
});

module.exports = router;
