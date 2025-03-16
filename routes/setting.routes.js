const express = require('express');
const router = express.Router();
const settingController = require('../controllers/setting.controller');
const { webAuthenticate, isAdmin } = require('../utils/auth.middleware');

// Apply authentication middleware to all setting routes
router.use(webAuthenticate);

// Render settings page (admin only)
router.get('/', settingController.renderSettings);

// Create setting (admin only)
router.post('/', settingController.createSetting);

// Update setting (admin only)
router.post('/:key', settingController.updateSetting);

// Delete setting (admin only)
router.post('/delete/:key', settingController.deleteSetting);

// Get setting by key
router.get('/:key', settingController.getSettingByKey);

// Get all settings
router.get('/all', settingController.getAllSettings);

module.exports = router; 