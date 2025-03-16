const userService = require('../services/user.service');

/**
 * Auth controller
 */
class AuthController {
  /**
   * Render login page
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  renderLogin(req, res) {
    res.render('auth/login', {
      title: 'Login',
      error: null
    });
  }

  /**
   * Render register page
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  renderRegister(req, res) {
    res.render('auth/register', {
      title: 'Register',
      error: null
    });
  }

  /**
   * Handle login
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.render('auth/login', {
          title: 'Login',
          error: 'Username and password are required',
          username
        });
      }

      const result = await userService.login(username, password);

      // For API requests
      if (req.xhr || req.path.startsWith('/api')) {
        return res.json({
          success: true,
          user: result.user,
          token: result.token
        });
      }

      // For web requests, render success page with token
      res.render('auth/login-success', {
        title: 'Login Successful',
        user: result.user,
        token: result.token
      });
    } catch (error) {
      console.error('Login error:', error);

      // For API requests
      if (req.xhr || req.path.startsWith('/api')) {
        return res.status(401).json({
          success: false,
          message: error.message
        });
      }

      // For web requests
      res.render('auth/login', {
        title: 'Login',
        error: error.message,
        username: req.body.username
      });
    }
  }

  /**
   * Handle register
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async register(req, res) {
    try {
      const { username, email, password, confirmPassword, fullName, timezone } = req.body;

      // Validate input
      if (!username || !email || !password || !confirmPassword) {
        return res.render('auth/register', {
          title: 'Register',
          error: 'All fields are required',
          username,
          email,
          fullName,
          timezone
        });
      }

      if (password !== confirmPassword) {
        return res.render('auth/register', {
          title: 'Register',
          error: 'Passwords do not match',
          username,
          email,
          fullName,
          timezone
        });
      }

      const result = await userService.register({
        username,
        email,
        password,
        fullName,
        timezone: timezone || 'UTC'
      });

      // For API requests
      if (req.xhr || req.path.startsWith('/api')) {
        return res.json({
          success: true,
          user: result.user,
          token: result.token
        });
      }

      // For web requests, render success page with token
      res.render('auth/register-success', {
        title: 'Registration Successful',
        user: result.user,
        token: result.token
      });
    } catch (error) {
      console.error('Registration error:', error);

      // For API requests
      if (req.xhr || req.path.startsWith('/api')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      // For web requests
      res.render('auth/register', {
        title: 'Register',
        error: error.message,
        username: req.body.username,
        email: req.body.email,
        fullName: req.body.fullName,
        timezone: req.body.timezone
      });
    }
  }

  /**
   * Handle logout
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  logout(req, res) {
    // For API requests
    if (req.xhr || req.path.startsWith('/api')) {
      return res.json({
        success: true,
        message: 'Logged out successfully'
      });
    }

    // For web requests
    res.render('auth/logout', {
      title: 'Logged Out'
    });
  }

  /**
   * Get current user
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getCurrentUser(req, res) {
    try {
      const user = {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        fullName: req.user.full_name,
        role: req.user.role,
        isActive: req.user.is_active,
        timezone: req.user.timezone
      };

      res.json({
        success: true,
        user
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new AuthController(); 