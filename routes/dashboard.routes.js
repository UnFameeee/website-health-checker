const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { webAuthenticate } = require('../utils/auth.middleware');

// Apply authentication middleware to all dashboard routes
router.use(webAuthenticate);

// Render dashboard page
router.get('/', dashboardController.renderDashboard);

// Handle POST request to dashboard (for token submission)
router.post('/', dashboardController.renderDashboard);

// Get dashboard data (for AJAX requests)
router.get('/data', dashboardController.getDashboardData);

module.exports = router; 