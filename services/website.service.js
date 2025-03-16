const db = require('../database/models');
const { v4: uuidv4 } = require('uuid');
const { checkWebsite, calculateUptime } = require('../utils/website-checker');
const { Op } = require('sequelize');
const moment = require('moment');

/**
 * Website service
 */
class WebsiteService {
  /**
   * Create a new website
   * @param {String} userId - User ID
   * @param {Object} websiteData - Website data
   * @returns {Object} Created website
   */
  async createWebsite(userId, websiteData) {
    try {
      // Check if user has reached the maximum number of websites
      if (userId) {
        const user = await db.User.findByPk(userId);
        if (user.role !== 'admin') {
          const settingResult = await db.Setting.findOne({
            where: { key: 'max_websites_per_user' }
          });
          
          const maxWebsites = settingResult ? parseInt(settingResult.value, 10) : 10;
          
          const websiteCount = await db.Website.count({
            where: {
              user_id: userId,
              deleted: false
            }
          });
          
          if (websiteCount >= maxWebsites) {
            throw new Error(`You have reached the maximum number of websites (${maxWebsites})`);
          }
        }
      }

      // Create website
      const website = await db.Website.create({
        id: uuidv4(),
        user_id: userId,
        name: websiteData.name,
        url: websiteData.url,
        check_interval: websiteData.checkInterval || 5,
        expected_status_code: websiteData.expectedStatusCode || 200,
        timeout: websiteData.timeout || 30,
        is_active: websiteData.isActive !== undefined ? websiteData.isActive : true,
        alert_threshold: websiteData.alertThreshold || 1,
        alert_email: websiteData.alertEmail
      });

      // Perform initial check
      const checkResult = await checkWebsite(website);
      
      // Create check record
      await db.Check.create({
        id: uuidv4(),
        website_id: website.id,
        status: checkResult.status,
        response_time: checkResult.responseTime,
        status_code: checkResult.statusCode,
        error_message: checkResult.errorMessage,
        check_time: checkResult.checkTime,
        location: checkResult.location
      });

      // Update website with check result
      await website.update({
        last_check_time: checkResult.checkTime,
        last_status: checkResult.status
      });

      return website;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get website by ID
   * @param {String} id - Website ID
   * @param {String} userId - User ID (for access control)
   * @returns {Object} Website object
   */
  async getWebsiteById(id, userId) {
    try {
      const whereClause = {
        id,
        deleted: false
      };

      // If not admin, only show user's websites
      const user = await db.User.findByPk(userId);
      if (user.role !== 'admin') {
        whereClause.user_id = userId;
      }

      const website = await db.Website.findOne({
        where: whereClause,
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'username', 'email', 'full_name']
          }
        ]
      });

      if (!website) {
        throw new Error('Website not found');
      }

      return website;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all websites for a user
   * @param {String} userId - User ID
   * @param {Boolean} isAdmin - Whether the user is an admin
   * @returns {Array} Array of website objects
   */
  async getWebsites(userId, isAdmin = false) {
    try {
      const whereClause = {
        deleted: false
      };

      // If not admin, only show user's websites
      if (!isAdmin) {
        whereClause.user_id = userId;
      }

      const websites = await db.Website.findAll({
        where: whereClause,
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'username', 'email', 'full_name']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      return websites;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update website
   * @param {String} id - Website ID
   * @param {String} userId - User ID (for access control)
   * @param {Object} websiteData - Website data to update
   * @returns {Object} Updated website object
   */
  async updateWebsite(id, userId, websiteData) {
    try {
      const whereClause = {
        id,
        deleted: false
      };

      // If not admin, only update user's websites
      const user = await db.User.findByPk(userId);
      if (user.role !== 'admin') {
        whereClause.user_id = userId;
      }

      const website = await db.Website.findOne({
        where: whereClause
      });

      if (!website) {
        throw new Error('Website not found');
      }

      // Update website data
      await website.update({
        name: websiteData.name || website.name,
        url: websiteData.url || website.url,
        check_interval: websiteData.checkInterval || website.check_interval,
        expected_status_code: websiteData.expectedStatusCode || website.expected_status_code,
        timeout: websiteData.timeout || website.timeout,
        is_active: websiteData.isActive !== undefined ? websiteData.isActive : website.is_active,
        alert_threshold: websiteData.alertThreshold || website.alert_threshold,
        alert_email: websiteData.alertEmail !== undefined ? websiteData.alertEmail : website.alert_email
      });

      return website;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete website
   * @param {String} id - Website ID
   * @param {String} userId - User ID (for access control)
   * @returns {Boolean} Success status
   */
  async deleteWebsite(id, userId) {
    try {
      const whereClause = {
        id,
        deleted: false
      };

      // If not admin, only delete user's websites
      const user = await db.User.findByPk(userId);
      if (user.role !== 'admin') {
        whereClause.user_id = userId;
      }

      const website = await db.Website.findOne({
        where: whereClause
      });

      if (!website) {
        throw new Error('Website not found');
      }

      // Soft delete website
      await website.update({
        deleted: true,
        deleted_at: new Date()
      });

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check website status
   * @param {String} id - Website ID
   * @returns {Object} Check result
   */
  async checkWebsiteStatus(id) {
    try {
      const website = await db.Website.findOne({
        where: {
          id,
          deleted: false
        }
      });

      if (!website) {
        throw new Error('Website not found');
      }

      // Perform check
      const checkResult = await checkWebsite(website);
      
      // Create check record
      await db.Check.create({
        id: uuidv4(),
        website_id: website.id,
        status: checkResult.status,
        response_time: checkResult.responseTime,
        status_code: checkResult.statusCode,
        error_message: checkResult.errorMessage,
        check_time: checkResult.checkTime,
        location: checkResult.location
      });

      // Update website with check result
      await website.update({
        last_check_time: checkResult.checkTime,
        last_status: checkResult.status
      });

      return checkResult;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get website checks
   * @param {String} id - Website ID
   * @param {String} userId - User ID (for access control)
   * @param {Object} options - Query options (limit, offset, timeRange)
   * @returns {Object} Checks and pagination info
   */
  async getWebsiteChecks(id, userId, options = {}) {
    try {
      const whereClause = {
        id,
        deleted: false
      };

      // If not admin, only show user's websites
      const user = await db.User.findByPk(userId);
      if (user.role !== 'admin') {
        whereClause.user_id = userId;
      }

      const website = await db.Website.findOne({
        where: whereClause
      });

      if (!website) {
        throw new Error('Website not found');
      }

      // Build check query
      const checkWhereClause = {
        website_id: id,
        deleted: false
      };

      // Add time range if provided
      if (options.timeRange) {
        let startDate;
        switch (options.timeRange) {
          case '24h':
            startDate = moment().subtract(24, 'hours').toDate();
            break;
          case '7d':
            startDate = moment().subtract(7, 'days').toDate();
            break;
          case '30d':
            startDate = moment().subtract(30, 'days').toDate();
            break;
          default:
            startDate = moment().subtract(24, 'hours').toDate();
        }

        checkWhereClause.check_time = {
          [Op.gte]: startDate
        };
      }

      // Get total count
      const totalChecks = await db.Check.count({
        where: checkWhereClause
      });

      // Get checks with pagination
      const limit = options.limit || 20;
      const offset = options.offset || 0;

      const checks = await db.Check.findAll({
        where: checkWhereClause,
        order: [['check_time', 'DESC']],
        limit,
        offset
      });

      // Calculate uptime
      const uptime = calculateUptime(checks);

      return {
        checks,
        pagination: {
          total: totalChecks,
          limit,
          offset,
          hasMore: offset + checks.length < totalChecks
        },
        uptime
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get uptime statistics for a website
   * @param {String} id - Website ID
   * @param {String} userId - User ID (for access control)
   * @param {String} timeRange - Time range (24h, 7d, 30d)
   * @returns {Object} Uptime statistics
   */
  async getUptimeStats(id, userId, timeRange = '24h') {
    try {
      const whereClause = {
        id,
        deleted: false
      };

      // If not admin, only show user's websites
      const user = await db.User.findByPk(userId);
      if (user.role !== 'admin') {
        whereClause.user_id = userId;
      }

      const website = await db.Website.findOne({
        where: whereClause
      });

      if (!website) {
        throw new Error('Website not found');
      }

      // Determine start date based on time range
      let startDate;
      switch (timeRange) {
        case '24h':
          startDate = moment().subtract(24, 'hours').toDate();
          break;
        case '7d':
          startDate = moment().subtract(7, 'days').toDate();
          break;
        case '30d':
          startDate = moment().subtract(30, 'days').toDate();
          break;
        default:
          startDate = moment().subtract(24, 'hours').toDate();
      }

      // Get checks for the time range
      const checks = await db.Check.findAll({
        where: {
          website_id: id,
          check_time: {
            [Op.gte]: startDate
          },
          deleted: false
        },
        order: [['check_time', 'ASC']]
      });

      // Calculate uptime
      const uptime = calculateUptime(checks);

      // Calculate average response time
      const responseTimes = checks
        .filter(check => check.status === 'up' && check.response_time)
        .map(check => check.response_time);
      
      const avgResponseTime = responseTimes.length > 0
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
        : 0;

      // Count outages
      const outages = checks.filter(check => check.status === 'down').length;

      return {
        uptime,
        avgResponseTime,
        outages,
        totalChecks: checks.length,
        timeRange
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new WebsiteService(); 