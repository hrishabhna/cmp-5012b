const express = require('express');
const router  = express.Router();
const data    = require('../data/chartData'); // this imports the data from chartData.js
 
router.get('/weight',   (req, res) => res.json(data.weight()));// this returns the weight data 
router.get('/calories', (req, res) => res.json(data.calories())); // this returns the calories data
router.get('/exercise', (req, res) => res.json(data.exercise())); //this returns the excercise data 
 
module.exports = router;//exports the data into app.js 
