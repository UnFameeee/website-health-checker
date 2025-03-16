const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const { authenticate } = require('../utils/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticate);

// Render profile page
router.get('/', profileController.renderProfile);

// Update profile
router.post('/update', profileController.updateProfile);

module.exports = router; 