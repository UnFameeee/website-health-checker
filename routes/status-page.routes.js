const express = require('express');
const router = express.Router();
const websiteService = require('../services/website.service');
const moment = require('moment');

// Public status page (no authentication required)
router.get('/', async (req, res) => {
  try {
    // Get all active websites
    const websites = await websiteService.getWebsites(null, true);
    
    // Filter only active websites
    const activeWebsites = websites.filter(website => website.is_active);

    // Get stats for each website
    const websiteStats = await Promise.all(
      activeWebsites.map(async (website) => {
        const stats = await websiteService.getUptimeStats(website.id, null, '24h');
        return {
          id: website.id,
          name: website.name,
          url: website.url,
          status: website.last_status,
          lastCheckTime: website.last_check_time ? moment(website.last_check_time).fromNow() : 'Never',
          uptime: stats.uptime.toFixed(2),
          avgResponseTime: stats.avgResponseTime ? Math.round(stats.avgResponseTime) : 'N/A'
        };
      })
    );

    // Calculate overall stats
    const totalWebsites = websiteStats.length;
    const websitesUp = websiteStats.filter(w => w.status === 'up').length;
    const websitesDown = websiteStats.filter(w => w.status === 'down').length;
    
    const overallUptime = websiteStats.length > 0
      ? websiteStats.reduce((sum, site) => sum + parseFloat(site.uptime), 0) / websiteStats.length
      : 100;

    const overallStats = {
      totalWebsites,
      websitesUp,
      websitesDown,
      overallUptime: overallUptime.toFixed(2)
    };

    res.render('status/index', {
      title: 'System Status',
      websiteStats,
      overallStats,
      incidents: [],
      moment,
      user: req.user || null
    });
  } catch (error) {
    console.error('Render status page error:', error);
    res.render('error', {
      title: 'Error',
      message: 'Failed to load status page',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// Get website status details
router.get('/website/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const website = await websiteService.getWebsiteById(id, null);
    
    if (!website.is_active) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'Website not found or not active',
        error: {}
      });
    }
    
    // Get website checks with pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    const timeRange = req.query.timeRange || '24h';
    
    const checksResult = await websiteService.getWebsiteChecks(id, null, {
      limit,
      offset,
      timeRange
    });
    
    // Get uptime stats
    const uptimeStats = await websiteService.getUptimeStats(id, null, timeRange);

    res.render('status/website', {
      title: `${website.name} Status`,
      website,
      checks: checksResult.checks,
      pagination: checksResult.pagination,
      uptime: checksResult.uptime,
      uptimeStats,
      timeRange,
      moment,
      user: req.user || null
    });
  } catch (error) {
    console.error('Render website status error:', error);
    res.render('error', {
      title: 'Error',
      message: 'Failed to load website status',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

module.exports = router; 