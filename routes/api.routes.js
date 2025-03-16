const express = require('express');
const router = express.Router();
const websiteService = require('../services/website.service');
const userService = require('../services/user.service');
const settingService = require('../services/setting.service');
const { authenticate, isAdmin } = require('../utils/auth.middleware');

// Apply authentication middleware to all API routes
router.use(authenticate);

// Get all websites
router.get('/websites', async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const websites = await websiteService.getWebsites(req.user.id, isAdmin);
    
    res.json({
      success: true,
      websites
    });
  } catch (error) {
    console.error('API get websites error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get website by ID
router.get('/websites/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const website = await websiteService.getWebsiteById(id, req.user.id);
    
    res.json({
      success: true,
      website
    });
  } catch (error) {
    console.error('API get website error:', error);
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// Create website
router.post('/websites', async (req, res) => {
  try {
    const website = await websiteService.createWebsite(req.user.id, req.body);
    
    res.json({
      success: true,
      website
    });
  } catch (error) {
    console.error('API create website error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Update website
router.put('/websites/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const website = await websiteService.updateWebsite(id, req.user.id, req.body);
    
    res.json({
      success: true,
      website
    });
  } catch (error) {
    console.error('API update website error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Delete website
router.delete('/websites/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await websiteService.deleteWebsite(id, req.user.id);
    
    res.json({
      success: true,
      message: 'Website deleted successfully'
    });
  } catch (error) {
    console.error('API delete website error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Check website status
router.post('/websites/:id/check', async (req, res) => {
  try {
    const { id } = req.params;
    const checkResult = await websiteService.checkWebsiteStatus(id);
    
    res.json({
      success: true,
      checkResult
    });
  } catch (error) {
    console.error('API check website status error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get website checks
router.get('/websites/:id/checks', async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = parseInt(req.query.offset, 10) || 0;
    const timeRange = req.query.timeRange || '24h';
    
    const result = await websiteService.getWebsiteChecks(id, req.user.id, {
      limit,
      offset,
      timeRange
    });
    
    res.json({
      success: true,
      checks: result.checks,
      pagination: result.pagination,
      uptime: result.uptime
    });
  } catch (error) {
    console.error('API get website checks error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get uptime stats
router.get('/websites/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    const timeRange = req.query.timeRange || '24h';
    
    const stats = await websiteService.getUptimeStats(id, req.user.id, timeRange);
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('API get uptime stats error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Admin only routes
// Get all users (admin only)
router.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    
    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('API get users error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get user by ID (admin only)
router.get('/users/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('API get user error:', error);
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// Update user (admin only)
router.put('/users/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.updateUser(id, req.body);
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('API update user error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Delete user (admin only)
router.delete('/users/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await userService.deleteUser(id);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('API delete user error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get all settings (admin only)
router.get('/settings', isAdmin, async (req, res) => {
  try {
    const settings = await settingService.getAllSettings();
    
    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('API get settings error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get setting by key (admin only)
router.get('/settings/:key', isAdmin, async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await settingService.getSettingByKey(key);
    
    res.json({
      success: true,
      setting
    });
  } catch (error) {
    console.error('API get setting error:', error);
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// Create setting (admin only)
router.post('/settings', isAdmin, async (req, res) => {
  try {
    const setting = await settingService.createSetting(req.body);
    
    res.json({
      success: true,
      setting
    });
  } catch (error) {
    console.error('API create setting error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Update setting (admin only)
router.put('/settings/:key', isAdmin, async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await settingService.updateSetting(key, req.body);
    
    res.json({
      success: true,
      setting
    });
  } catch (error) {
    console.error('API update setting error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Delete setting (admin only)
router.delete('/settings/:key', isAdmin, async (req, res) => {
  try {
    const { key } = req.params;
    await settingService.deleteSetting(key);
    
    res.json({
      success: true,
      message: 'Setting deleted successfully'
    });
  } catch (error) {
    console.error('API delete setting error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router; 