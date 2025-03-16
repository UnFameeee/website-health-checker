const websiteService = require('../services/website.service');
const moment = require('moment');

/**
 * Dashboard controller
 */
class DashboardController {
  /**
   * Render dashboard page
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async renderDashboard(req, res) {
    try {
      const isAdmin = req.user.role === 'admin';
      const websites = await websiteService.getWebsites(req.user.id, isAdmin);

      // Get stats for each website
      const websiteStats = await Promise.all(
        websites.map(async (website) => {
          const stats = await websiteService.getUptimeStats(website.id, req.user.id, '24h');
          return {
            id: website.id,
            name: website.name,
            url: website.url,
            status: website.last_status,
            lastCheckTime: website.last_check_time ? moment(website.last_check_time).fromNow() : 'Never',
            uptime: stats.uptime.toFixed(2),
            avgResponseTime: stats.avgResponseTime ? Math.round(stats.avgResponseTime) : 'N/A',
            outages: stats.outages
          };
        })
      );

      // Calculate overall stats
      const totalWebsites = websites.length;
      const websitesUp = websites.filter(w => w.last_status === 'up').length;
      const websitesDown = websites.filter(w => w.last_status === 'down').length;
      const websitesUnknown = websites.filter(w => w.last_status === 'unknown').length;
      
      const overallUptime = websiteStats.length > 0
        ? websiteStats.reduce((sum, site) => sum + parseFloat(site.uptime), 0) / websiteStats.length
        : 100;

      const overallStats = {
        totalWebsites,
        websitesUp,
        websitesDown,
        websitesUnknown,
        overallUptime: overallUptime.toFixed(2)
      };

      // Get recent incidents (empty array for now, will be implemented later)
      const incidents = [];

      res.render('dashboard/index', {
        title: 'Dashboard',
        websiteStats,
        overallStats,
        incidents,
        user: req.user,
        moment
      });
    } catch (error) {
      console.error('Render dashboard error:', error);
      res.render('error', {
        title: 'Error',
        message: 'Failed to load dashboard',
        error: process.env.NODE_ENV === 'development' ? error : {}
      });
    }
  }

  /**
   * Get dashboard data (for AJAX requests)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getDashboardData(req, res) {
    try {
      const isAdmin = req.user.role === 'admin';
      const websites = await websiteService.getWebsites(req.user.id, isAdmin);

      // Get stats for each website
      const websiteStats = await Promise.all(
        websites.map(async (website) => {
          const stats = await websiteService.getUptimeStats(website.id, req.user.id, '24h');
          return {
            id: website.id,
            name: website.name,
            url: website.url,
            status: website.last_status,
            lastCheckTime: website.last_check_time,
            uptime: stats.uptime,
            avgResponseTime: stats.avgResponseTime,
            outages: stats.outages
          };
        })
      );

      // Calculate overall stats
      const totalWebsites = websites.length;
      const websitesUp = websites.filter(w => w.last_status === 'up').length;
      const websitesDown = websites.filter(w => w.last_status === 'down').length;
      const websitesUnknown = websites.filter(w => w.last_status === 'unknown').length;
      
      const overallUptime = websiteStats.length > 0
        ? websiteStats.reduce((sum, site) => sum + site.uptime, 0) / websiteStats.length
        : 100;

      const overallStats = {
        totalWebsites,
        websitesUp,
        websitesDown,
        websitesUnknown,
        overallUptime
      };

      res.json({
        success: true,
        websiteStats,
        overallStats
      });
    } catch (error) {
      console.error('Get dashboard data error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new DashboardController(); 