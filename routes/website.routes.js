const express = require('express');
const router = express.Router();
const websiteController = require('../controllers/website.controller');
const { webAuthenticate } = require('../utils/auth.middleware');

// Apply authentication middleware to all website routes
router.use(webAuthenticate);

// Render websites list page
router.get('/', websiteController.renderWebsitesList);

// Render add website page
router.get('/add', websiteController.renderAddWebsite);

// Render edit website page
router.get('/edit/:id', websiteController.renderEditWebsite);

// Render website details page
router.get('/:id', websiteController.renderWebsiteDetails);

// Add website
router.post('/', websiteController.addWebsite);

// Update website
router.post('/update/:id', websiteController.updateWebsite);

// Delete website
router.post('/delete/:id', websiteController.deleteWebsite);

// Check website status
router.get('/check/:id', websiteController.checkWebsiteStatus);

// Get website checks
router.get('/:id/checks', websiteController.getWebsiteChecks);

// Get uptime stats
router.get('/:id/stats', websiteController.getUptimeStats);

module.exports = router; 