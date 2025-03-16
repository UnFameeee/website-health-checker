const express = require('express');
const router = express.Router();
const websiteService = require('../services/website.service');
const { webAuthenticate } = require('../utils/auth.middleware');
const moment = require('moment');

// Apply authentication middleware to all report routes
router.use(webAuthenticate);

// Render reports page
router.get('/', async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const websites = await websiteService.getWebsites(req.user.id, isAdmin);

    res.render('reports/index', {
      title: 'Reports',
      websites,
      user: req.user
    });
  } catch (error) {
    console.error('Render reports page error:', error);
    res.render('error', {
      title: 'Error',
      message: 'Failed to load reports page',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// Generate uptime report
router.get('/uptime/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const timeRange = req.query.timeRange || '30d';
    const website = await websiteService.getWebsiteById(id, req.user.id);
    
    // Get uptime stats
    const uptimeStats = await websiteService.getUptimeStats(id, req.user.id, timeRange);
    
    // Get all checks for the time range
    const checksResult = await websiteService.getWebsiteChecks(id, req.user.id, {
      timeRange,
      limit: 1000 // Get more checks for the report
    });
    
    // Group checks by day
    const checksByDay = {};
    checksResult.checks.forEach(check => {
      const day = moment(check.check_time).format('YYYY-MM-DD');
      if (!checksByDay[day]) {
        checksByDay[day] = [];
      }
      checksByDay[day].push(check);
    });
    
    // Calculate daily uptime
    const dailyUptime = Object.keys(checksByDay).map(day => {
      const checks = checksByDay[day];
      const upChecks = checks.filter(check => check.status === 'up').length;
      const uptime = (upChecks / checks.length) * 100;
      
      return {
        date: day,
        uptime: uptime.toFixed(2),
        totalChecks: checks.length,
        upChecks,
        downChecks: checks.length - upChecks
      };
    });
    
    // Sort by date
    dailyUptime.sort((a, b) => a.date.localeCompare(b.date));
    
    res.render('reports/uptime', {
      title: `Uptime Report - ${website.name}`,
      website,
      uptimeStats,
      dailyUptime,
      timeRange,
      user: req.user,
      moment
    });
  } catch (error) {
    console.error('Generate uptime report error:', error);
    res.render('error', {
      title: 'Error',
      message: 'Failed to generate uptime report',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// Generate response time report
router.get('/response-time/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const timeRange = req.query.timeRange || '30d';
    const website = await websiteService.getWebsiteById(id, req.user.id);
    
    // Get all checks for the time range
    const checksResult = await websiteService.getWebsiteChecks(id, req.user.id, {
      timeRange,
      limit: 1000 // Get more checks for the report
    });
    
    // Filter only successful checks with response time
    const successfulChecks = checksResult.checks.filter(
      check => check.status === 'up' && check.response_time
    );
    
    // Group checks by day
    const checksByDay = {};
    successfulChecks.forEach(check => {
      const day = moment(check.check_time).format('YYYY-MM-DD');
      if (!checksByDay[day]) {
        checksByDay[day] = [];
      }
      checksByDay[day].push(check);
    });
    
    // Calculate daily average response time
    const dailyResponseTime = Object.keys(checksByDay).map(day => {
      const checks = checksByDay[day];
      const totalResponseTime = checks.reduce((sum, check) => sum + check.response_time, 0);
      const avgResponseTime = totalResponseTime / checks.length;
      
      return {
        date: day,
        avgResponseTime: Math.round(avgResponseTime),
        minResponseTime: Math.min(...checks.map(check => check.response_time)),
        maxResponseTime: Math.max(...checks.map(check => check.response_time)),
        totalChecks: checks.length
      };
    });
    
    // Sort by date
    dailyResponseTime.sort((a, b) => a.date.localeCompare(b.date));
    
    res.render('reports/response-time', {
      title: `Response Time Report - ${website.name}`,
      website,
      dailyResponseTime,
      timeRange,
      user: req.user,
      moment
    });
  } catch (error) {
    console.error('Generate response time report error:', error);
    res.render('error', {
      title: 'Error',
      message: 'Failed to generate response time report',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// Export report as CSV
router.get('/export/:type/:id', async (req, res) => {
  try {
    const { id, type } = req.params;
    const timeRange = req.query.timeRange || '30d';
    const website = await websiteService.getWebsiteById(id, req.user.id);
    
    // Get all checks for the time range
    const checksResult = await websiteService.getWebsiteChecks(id, req.user.id, {
      timeRange,
      limit: 10000 // Get more checks for the export
    });
    
    let csvContent = '';
    const filename = `${website.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${type}_report_${moment().format('YYYY-MM-DD')}.csv`;
    
    if (type === 'uptime') {
      // CSV header
      csvContent = 'Date,Time,Status,Response Time (ms),Status Code,Error Message\n';
      
      // CSV rows
      checksResult.checks.forEach(check => {
        const date = moment(check.check_time).format('YYYY-MM-DD');
        const time = moment(check.check_time).format('HH:mm:ss');
        const status = check.status;
        const responseTime = check.response_time || '';
        const statusCode = check.status_code || '';
        const errorMessage = check.error_message ? `"${check.error_message.replace(/"/g, '""')}"` : '';
        
        csvContent += `${date},${time},${status},${responseTime},${statusCode},${errorMessage}\n`;
      });
    } else if (type === 'response-time') {
      // Filter only successful checks with response time
      const successfulChecks = checksResult.checks.filter(
        check => check.status === 'up' && check.response_time
      );
      
      // CSV header
      csvContent = 'Date,Time,Response Time (ms),Status Code\n';
      
      // CSV rows
      successfulChecks.forEach(check => {
        const date = moment(check.check_time).format('YYYY-MM-DD');
        const time = moment(check.check_time).format('HH:mm:ss');
        const responseTime = check.response_time;
        const statusCode = check.status_code || '';
        
        csvContent += `${date},${time},${responseTime},${statusCode}\n`;
      });
    }
    
    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    
    res.send(csvContent);
  } catch (error) {
    console.error('Export report error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router; 