const express = require('express'); //this imports the Express framework, which is used to create the web server and handle routing.
const path    = require('path');
const app     = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/goals',      require('./routes/goalRoutes'));
app.use('/api/groups',     require('./routes/groupRoutes'));

// Dashboard API routes 
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));//this serves the index.html file for any route that is not handled by the API routes, allowing the frontend to handle routing for the dashboard and other pages.
});

app.listen(3000, () => console.log('Running at http://localhost:3000'));