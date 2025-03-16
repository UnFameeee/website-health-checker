const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, isAdmin } = require('../utils/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticate);

// Apply admin middleware to all routes
router.use(isAdmin);

// Render users list page (admin only)
router.get('/', userController.renderUsersList);

// Render add user page (admin only)
router.get('/add', userController.renderAddUser);

// Render edit user page (admin only)
router.get('/edit/:id', userController.renderEditUser);

// Add user (admin only)
router.post('/', userController.addUser);

// Update user (admin only)
router.post('/update/:id', userController.updateUser);

// Delete user (admin only)
router.post('/delete/:id', userController.deleteUser);

module.exports = router; 