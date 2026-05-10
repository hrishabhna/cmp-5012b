const express     = require('express');
const bcrypt        = require('bcrypt');
const router        = express.Router();
const userModel = require('../models/userModel');

const PEPPER = 'ht-team377-pepper';

router.post('/register', async (req, res) => {
    const { username, name, email, password, height, weight, age, gender, targetWeight } = req.body;
    if (!username || !name || !email || !password)
        return res.status(400).json({ error: 'All fields required' });
    if (userModel.findByUsername(username))
        return res.status(409).json({ error: 'Username already taken' });
    if (userModel.findByEmail(email))
        return res.status(409).json({ error: 'Email already registered' });
    const hashed = await bcrypt.hash(password + PEPPER, 10);
    const bmi = height && weight ? Math.round((weight / ((height/100)**2)) * 10) / 10 : null;
    userModel.createUser({ username, name, email, password: hashed, height, weight, age, gender, targetWeight, bmi, createdAt: new Date().toISOString() });
    res.status(201).json({ message: 'Registered successfully', username, bmi });
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = userModel.findByUsername(username);
    if (!user) return res.status(401).json({ error: 'Invalid username or password' });
    const match = await bcrypt.compare(password + PEPPER, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid username or password' });
    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser });
});

module.exports = router;
