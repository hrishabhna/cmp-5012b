const express   = require('express');
const router    = express.Router();
const goalModel = require('../models/goalModel');

router.get('/:username',    (req, res) => res.json(goalModel.getByUser(req.params.username)));
router.post('/',            (req, res) => res.json(goalModel.addGoal(req.body)));
router.put('/:id/complete', (req, res) => {
    try { res.json(goalModel.markComplete(req.params.id)); }
    catch (e) { res.status(404).json({ error: e.message }); }
});
router.put('/:id/progress', (req, res) =>
    res.json(goalModel.updateProgress(req.params.id, req.body.progress))
);

module.exports = router;
