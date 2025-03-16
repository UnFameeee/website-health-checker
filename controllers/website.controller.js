const websiteService = require('../services/website.service');
const moment = require('moment');
const { calculateUptime } = require('../utils/website-checker');

/**
 * Website controller
 */
class WebsiteController {
  /**
   * Render websites list page
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async renderWebsitesList(req, res) {
    try {
      const isAdmin = req.user.role === 'admin';
      const websites = await websiteService.getWebsites(req.user.id, isAdmin);

      res.render('websites/index', {
        title: 'Websites',
        websites,
        user: req.user,
        moment
      });
    } catch (error) {
      console.error('Render websites list error:', error);
      res.render('error', {
        title: 'Error',
        message: 'Failed to load websites',
        error: process.env.NODE_ENV === 'development' ? error : {}
      });
    }
  }

  /**
   * Render website details page
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async renderWebsiteDetails(req, res) {
    try {
      const { id } = req.params;
      const website = await websiteService.getWebsiteById(id, req.user.id);
      
      // Get website checks with pagination
      const page = parseInt(req.query.page, 10) || 1;
      const limit = 20;
      const offset = (page - 1) * limit;
      const timeRange = req.query.timeRange || '24h';
      
      const checksResult = await websiteService.getWebsiteChecks(id, req.user.id, {
        limit,
        offset,
        timeRange
      });
      
      // Get uptime stats
      const uptimeStats = await websiteService.getUptimeStats(id, req.user.id, timeRange);

      // Prepare chart data
      const chartData = {
        labels: [],
        uptime: []
      };

      // If we have checks data, prepare it for the chart
      if (checksResult.checks && checksResult.checks.length > 0) {
        // Group checks by day
        const checksByDay = {};
        checksResult.checks.forEach(check => {
          const day = moment(check.check_time).format('YYYY-MM-DD');
          if (!checksByDay[day]) {
            checksByDay[day] = [];
          }
          checksByDay[day].push(check);
        });

        // Calculate uptime for each day
        Object.keys(checksByDay).sort().forEach(day => {
          const dayChecks = checksByDay[day];
          const dayUptime = calculateUptime(dayChecks);
          chartData.labels.push(moment(day).format('MMM DD'));
          chartData.uptime.push(dayUptime);
        });
      }

      res.render('websites/details', {
        title: website.name,
        website,
        checks: checksResult.checks,
        pagination: checksResult.pagination,
        uptime: checksResult.uptime,
        uptimeStats,
        stats: uptimeStats,
        timeRange,
        user: req.user,
        moment,
        avgResponseTime: uptimeStats.avgResponseTime,
        chartData
      });
    } catch (error) {
      console.error('Render website details error:', error);
      res.render('error', {
        title: 'Error',
        message: 'Failed to load website details',
        error: process.env.NODE_ENV === 'development' ? error : {}
      });
    }
  }

  /**
   * Render add website page
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  renderAddWebsite(req, res) {
    res.render('websites/add', {
      title: 'Add Website',
      error: null,
      user: req.user,
      moment
    });
  }

  /**
   * Render edit website page
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async renderEditWebsite(req, res) {
    try {
      const { id } = req.params;
      const website = await websiteService.getWebsiteById(id, req.user.id);

      res.render('websites/edit', {
        title: `Edit ${website.name}`,
        website,
        error: null,
        user: req.user,
        moment
      });
    } catch (error) {
      console.error('Render edit website error:', error);
      res.render('error', {
        title: 'Error',
        message: 'Failed to load website for editing',
        error: process.env.NODE_ENV === 'development' ? error : {}
      });
    }
  }

  /**
   * Add website
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async addWebsite(req, res) {
    try {
      const {
        name,
        url,
        checkInterval,
        expectedStatusCode,
        timeout,
        alertThreshold,
        alertEmail,
        notes
      } = req.body;

      // Validate input
      if (!name || !url) {
        return res.render('websites/add', {
          title: 'Add Website',
          error: 'Name and URL are required',
          formData: req.body,
          user: req.user,
          moment
        });
      }

      const website = await websiteService.createWebsite(req.user.id, {
        name,
        url,
        checkInterval: parseInt(checkInterval, 10),
        expectedStatusCode: parseInt(expectedStatusCode, 10),
        timeout: parseInt(timeout, 10),
        alertThreshold: parseInt(alertThreshold, 10),
        alertEmail
      });

      // For API requests
      if (req.xhr || req.path.startsWith('/api')) {
        return res.json({
          success: true,
          website
        });
      }

      // Redirect to website details page
      res.redirect(`/websites/${website.id}`);
    } catch (error) {
      console.error('Add website error:', error);

      // For API requests
      if (req.xhr || req.path.startsWith('/api')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      // For web requests
      res.render('websites/add', {
        title: 'Add Website',
        error: error.message,
        formData: req.body,
        user: req.user,
        moment
      });
    }
  }

  /**
   * Update website
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async updateWebsite(req, res) {
    try {
      const { id } = req.params;
      const {
        name,
        url,
        checkInterval,
        expectedStatusCode,
        timeout,
        isActive,
        alertThreshold,
        alertEmail,
        notes
      } = req.body;

      // Validate input
      if (!name || !url) {
        const website = await websiteService.getWebsiteById(id, req.user.id);
        return res.render('websites/edit', {
          title: `Edit ${website.name}`,
          website,
          error: 'Name and URL are required',
          user: req.user,
          moment
        });
      }

      const website = await websiteService.updateWebsite(id, req.user.id, {
        name,
        url,
        checkInterval: parseInt(checkInterval, 10),
        expectedStatusCode: parseInt(expectedStatusCode, 10),
        timeout: parseInt(timeout, 10),
        isActive: isActive === 'true' || isActive === true,
        alertThreshold: parseInt(alertThreshold, 10),
        alertEmail
      });

      // For API requests
      if (req.xhr || req.path.startsWith('/api')) {
        return res.json({
          success: true,
          website
        });
      }

      // Redirect to website details page
      res.redirect(`/websites/${website.id}`);
    } catch (error) {
      console.error('Update website error:', error);
      try {
        const website = await websiteService.getWebsiteById(req.params.id, req.user.id);
        res.render('websites/edit', {
          title: `Edit ${website.name}`,
          website,
          error: error.message,
          user: req.user,
          moment
        });
      } catch (innerError) {
        res.render('error', {
          title: 'Error',
          message: 'Failed to update website',
          error: process.env.NODE_ENV === 'development' ? error : {}
        });
      }
    }
  }

  /**
   * Delete website
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async deleteWebsite(req, res) {
    try {
      const { id } = req.params;
      await websiteService.deleteWebsite(id, req.user.id);

      // For API requests
      if (req.xhr || req.path.startsWith('/api')) {
        return res.json({
          success: true,
          message: 'Website deleted successfully'
        });
      }

      // Redirect to websites list
      res.redirect('/websites');
    } catch (error) {
      console.error('Delete website error:', error);

      // For API requests
      if (req.xhr || req.path.startsWith('/api')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      // For web requests
      res.render('error', {
        title: 'Error',
        message: 'Failed to delete website',
        error: process.env.NODE_ENV === 'development' ? error : {}
      });
    }
  }

  /**
   * Check website status
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async checkWebsiteStatus(req, res) {
    try {
      const { id } = req.params;
      const checkResult = await websiteService.checkWebsiteStatus(id);

      res.json({
        success: true,
        checkResult
      });
    } catch (error) {
      console.error('Check website status error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get website checks
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getWebsiteChecks(req, res) {
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
      console.error('Get website checks error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get uptime stats
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getUptimeStats(req, res) {
    try {
      const { id } = req.params;
      const timeRange = req.query.timeRange || '24h';

      const stats = await websiteService.getUptimeStats(id, req.user.id, timeRange);

      res.json({
        success: true,
        stats
      });
    } catch (error) {
      console.error('Get uptime stats error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new WebsiteController(); 