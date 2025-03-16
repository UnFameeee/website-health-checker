const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../utils/auth.middleware');

// Render login page
router.get('/login', authController.renderLogin);

// Render register page
router.get('/register', authController.renderRegister);

// Handle login
router.post('/login', authController.login);

// Handle register
router.post('/register', authController.register);

// Handle logout
router.get('/logout', authController.logout);

// Get current user (requires authentication)
router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router; 