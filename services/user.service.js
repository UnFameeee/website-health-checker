const db = require('../database/models');
const { generateToken } = require('../utils/jwt');
const { v4: uuidv4 } = require('uuid');

/**
 * User service
 */
class UserService {
  /**
   * Register a new user
   * @param {Object} userData - User data
   * @returns {Object} User object and token
   */
  async register(userData) {
    try {
      // Check if username or email already exists
      const existingUser = await db.User.findOne({
        where: {
          [db.Sequelize.Op.or]: [
            { username: userData.username },
            { email: userData.email }
          ],
          deleted: false
        }
      });

      if (existingUser) {
        throw new Error('Username or email already exists');
      }

      // Create new user
      const user = await db.User.create({
        id: uuidv4(),
        username: userData.username,
        email: userData.email,
        password: userData.password,
        full_name: userData.fullName,
        role: 'user', // Default role is user
        is_active: true,
        timezone: userData.timezone || 'UTC'
      });

      // Generate token
      const token = generateToken(user);

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.full_name,
          role: user.role
        },
        token
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new user (admin only)
   * @param {Object} userData - User data
   * @returns {Object} User object
   */
  async createUser(userData) {
    try {
      // Check if username or email already exists
      const existingUser = await db.User.findOne({
        where: {
          [db.Sequelize.Op.or]: [
            { username: userData.username },
            { email: userData.email }
          ],
          deleted: false
        }
      });

      if (existingUser) {
        throw new Error('Username or email already exists');
      }

      // Create new user
      const user = await db.User.create({
        id: uuidv4(),
        username: userData.username,
        email: userData.email,
        password: userData.password,
        full_name: userData.fullName,
        role: userData.role || 'user',
        is_active: true,
        timezone: userData.timezone || 'UTC'
      });

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        isActive: user.is_active,
        timezone: user.timezone
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login user
   * @param {String} username - Username or email
   * @param {String} password - Password
   * @returns {Object} User object and token
   */
  async login(username, password) {
    try {
      // Find user by username or email
      const user = await db.User.findOne({
        where: {
          [db.Sequelize.Op.or]: [
            { username },
            { email: username }
          ],
          is_active: true,
          deleted: false
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Check password
      const isPasswordValid = await user.validPassword(password);
      if (!isPasswordValid) {
        throw new Error('Invalid password');
      }

      // Update last login
      await user.update({ last_login: new Date() });

      // Generate token
      const token = generateToken(user);

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.full_name,
          role: user.role
        },
        token
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user by ID
   * @param {String} id - User ID
   * @returns {Object} User object
   */
  async getUserById(id) {
    try {
      const user = await db.User.findOne({
        where: {
          id,
          deleted: false
        },
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user
   * @param {String} id - User ID
   * @param {Object} userData - User data to update
   * @returns {Object} Updated user object
   */
  async updateUser(id, userData) {
    try {
      const user = await db.User.findOne({
        where: {
          id,
          deleted: false
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Update user data
      await user.update({
        full_name: userData.fullName || user.full_name,
        email: userData.email || user.email,
        timezone: userData.timezone || user.timezone,
        is_active: userData.isActive !== undefined ? userData.isActive : user.is_active,
        ...(userData.password ? { password: userData.password } : {})
      });

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        isActive: user.is_active,
        timezone: user.timezone
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete user
   * @param {String} id - User ID
   * @returns {Boolean} Success status
   */
  async deleteUser(id) {
    try {
      const user = await db.User.findOne({
        where: {
          id,
          deleted: false
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Soft delete user
      await user.update({
        deleted: true,
        deleted_at: new Date()
      });

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all users (admin only)
   * @returns {Array} Array of user objects
   */
  async getAllUsers() {
    try {
      const users = await db.User.findAll({
        where: {
          deleted: false
        },
        attributes: { exclude: ['password'] },
        order: [['created_at', 'DESC']]
      });

      return users;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserService(); 