const express = require('express');
const path    = require('path');
const app     = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Serves everything in /public as static files (/css/style.css, /js/app.js)
app.use(express.static(path.join(__dirname, 'public')));

// API routes (controllers calling your models)
app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/goals',      require('./routes/goalRoutes'));
app.use('/api/groups',     require('./routes/groupRoutes'));

//Serve the frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.listen(3000, () => console.log('Running at http://localhost:3000'));