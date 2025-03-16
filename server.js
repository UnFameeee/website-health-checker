require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = process.env.PORT || 3000;
const expressLayouts = require('express-ejs-layouts');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'assets')));
app.use(expressLayouts);
// View engine setup
app.set('view engine', 'ejs');
app.set('layout', 'layouts/main');
app.set('views', path.join(__dirname, 'views'));

// Database connection
const db = require('./database/models');

// Routes
const authRoutes = require('./routes/auth.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const websiteRoutes = require('./routes/website.routes');
const settingRoutes = require('./routes/setting.routes');
const statusPageRoutes = require('./routes/status-page.routes');
const reportRoutes = require('./routes/report.routes');
const apiRoutes = require('./routes/api.routes');
const userRoutes = require('./routes/user.routes');
const profileRoutes = require('./routes/profile.routes');

// Use routes
app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/websites', websiteRoutes);
app.use('/settings', settingRoutes);
app.use('/status', statusPageRoutes);
app.use('/reports', reportRoutes);
app.use('/api', apiRoutes);
app.use('/users', userRoutes);
app.use('/profile', profileRoutes);

// Root route
app.get('/', (req, res) => {
  res.redirect('/auth/login');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    title: 'Error',
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; 