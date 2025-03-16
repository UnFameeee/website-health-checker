const db = require('../database/models');
const { v4: uuidv4 } = require('uuid');

/**
 * Setting service
 */
class SettingService {
  /**
   * Get all settings
   * @returns {Array} Array of setting objects
   */
  async getAllSettings() {
    try {
      const settings = await db.Setting.findAll({
        where: {
          deleted: false
        },
        order: [['key', 'ASC']]
      });

      return settings;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get setting by key
   * @param {String} key - Setting key
   * @returns {Object} Setting object
   */
  async getSettingByKey(key) {
    try {
      const setting = await db.Setting.findOne({
        where: {
          key,
          deleted: false
        }
      });

      if (!setting) {
        throw new Error(`Setting with key '${key}' not found`);
      }

      return setting;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create setting
   * @param {Object} settingData - Setting data
   * @returns {Object} Created setting
   */
  async createSetting(settingData) {
    try {
      // Check if key already exists
      const existingSetting = await db.Setting.findOne({
        where: {
          key: settingData.key,
          deleted: false
        }
      });

      if (existingSetting) {
        throw new Error(`Setting with key '${settingData.key}' already exists`);
      }

      // Create setting
      const setting = await db.Setting.create({
        id: uuidv4(),
        key: settingData.key,
        value: settingData.value,
        description: settingData.description
      });

      return setting;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update setting
   * @param {String} key - Setting key
   * @param {Object} settingData - Setting data to update
   * @returns {Object} Updated setting
   */
  async updateSetting(key, settingData) {
    try {
      const setting = await db.Setting.findOne({
        where: {
          key,
          deleted: false
        }
      });

      if (!setting) {
        throw new Error(`Setting with key '${key}' not found`);
      }

      // Update setting
      await setting.update({
        value: settingData.value,
        description: settingData.description || setting.description
      });

      return setting;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete setting
   * @param {String} key - Setting key
   * @returns {Boolean} Success status
   */
  async deleteSetting(key) {
    try {
      const setting = await db.Setting.findOne({
        where: {
          key,
          deleted: false
        }
      });

      if (!setting) {
        throw new Error(`Setting with key '${key}' not found`);
      }

      // Soft delete setting
      await setting.update({
        deleted: true,
        deleted_at: new Date()
      });

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get setting value by key
   * @param {String} key - Setting key
   * @param {*} defaultValue - Default value if setting not found
   * @returns {*} Setting value
   */
  async getValue(key, defaultValue = null) {
    try {
      const setting = await db.Setting.findOne({
        where: {
          key,
          deleted: false
        }
      });

      if (!setting) {
        return defaultValue;
      }

      return setting.value;
    } catch (error) {
      console.error(`Error getting setting value for key '${key}':`, error);
      return defaultValue;
    }
  }

  /**
   * Set setting value
   * @param {String} key - Setting key
   * @param {*} value - Setting value
   * @param {String} description - Setting description (optional)
   * @returns {Object} Setting object
   */
  async setValue(key, value, description = null) {
    try {
      let setting = await db.Setting.findOne({
        where: {
          key,
          deleted: false
        }
      });

      if (setting) {
        // Update existing setting
        await setting.update({
          value: value.toString(),
          ...(description ? { description } : {})
        });
      } else {
        // Create new setting
        setting = await db.Setting.create({
          id: uuidv4(),
          key,
          value: value.toString(),
          description: description || `Setting for ${key}`
        });
      }

      return setting;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new SettingService(); 