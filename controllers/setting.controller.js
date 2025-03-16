const settingService = require('../services/setting.service');

/**
 * Setting controller
 */
class SettingController {
  /**
   * Render settings page
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async renderSettings(req, res) {
    try {
      // Only admin can access settings
      if (req.user.role !== 'admin') {
        return res.render('error', {
          title: 'Access Denied',
          message: 'You do not have permission to access this page',
          error: {}
        });
      }

      const settings = await settingService.getAllSettings();

      // Group settings by category (based on key prefix)
      const groupedSettings = settings.reduce((groups, setting) => {
        const keyParts = setting.key.split('_');
        const category = keyParts.length > 1 ? keyParts[0] : 'general';
        
        if (!groups[category]) {
          groups[category] = [];
        }
        
        groups[category].push(setting);
        return groups;
      }, {});

      res.render('settings/index', {
        title: 'Settings',
        groupedSettings,
        user: req.user,
        success: req.query.success === 'true',
        error: req.query.error
      });
    } catch (error) {
      console.error('Render settings error:', error);
      res.render('error', {
        title: 'Error',
        message: 'Failed to load settings',
        error: process.env.NODE_ENV === 'development' ? error : {}
      });
    }
  }

  /**
   * Update setting
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async updateSetting(req, res) {
    try {
      // Only admin can update settings
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to update settings'
        });
      }

      const { key } = req.params;
      const { value, description } = req.body;

      if (!value) {
        return res.status(400).json({
          success: false,
          message: 'Value is required'
        });
      }

      const setting = await settingService.updateSetting(key, {
        value,
        description
      });

      res.json({
        success: true,
        setting
      });
    } catch (error) {
      console.error('Update setting error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Create setting
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async createSetting(req, res) {
    try {
      // Only admin can create settings
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to create settings'
        });
      }

      const { key, value, description } = req.body;

      if (!key || !value) {
        return res.status(400).json({
          success: false,
          message: 'Key and value are required'
        });
      }

      const setting = await settingService.createSetting({
        key,
        value,
        description
      });

      res.json({
        success: true,
        setting
      });
    } catch (error) {
      console.error('Create setting error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Delete setting
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async deleteSetting(req, res) {
    try {
      // Only admin can delete settings
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to delete settings'
        });
      }

      const { key } = req.params;
      await settingService.deleteSetting(key);

      res.json({
        success: true,
        message: 'Setting deleted successfully'
      });
    } catch (error) {
      console.error('Delete setting error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get setting by key
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getSettingByKey(req, res) {
    try {
      const { key } = req.params;
      const setting = await settingService.getSettingByKey(key);

      res.json({
        success: true,
        setting
      });
    } catch (error) {
      console.error('Get setting error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get all settings
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getAllSettings(req, res) {
    try {
      const settings = await settingService.getAllSettings();

      res.json({
        success: true,
        settings
      });
    } catch (error) {
      console.error('Get all settings error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new SettingController(); 