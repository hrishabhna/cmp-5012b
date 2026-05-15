const express = require('express');
const router  = express.Router();
const data    = require('../data/chartData');

router.get('/weight',   (req, res) => res.json(data.weight()));
router.get('/calories', (req, res) => res.json(data.calories()));
router.get('/exercise', (req, res) => res.json(data.exercise()));

module.exports = router;