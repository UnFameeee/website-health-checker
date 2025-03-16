const userService = require('../services/user.service');

/**
 * User controller
 */
class UserController {
  /**
   * Render users list page (admin only)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async renderUsersList(req, res) {
    try {
      const users = await userService.getAllUsers();

      res.render('users/index', {
        title: 'User Management',
        users,
        user: req.user
      });
    } catch (error) {
      console.error('Render users list error:', error);
      res.render('error', {
        title: 'Error',
        message: 'Failed to load users',
        error: process.env.NODE_ENV === 'development' ? error : {}
      });
    }
  }

  /**
   * Render add user page (admin only)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  renderAddUser(req, res) {
    res.render('users/add', {
      title: 'Add User',
      error: null,
      user: req.user
    });
  }

  /**
   * Render edit user page (admin only)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async renderEditUser(req, res) {
    try {
      const { id } = req.params;
      const userToEdit = await userService.getUserById(id);

      res.render('users/edit', {
        title: `Edit User: ${userToEdit.username}`,
        userToEdit,
        error: null,
        user: req.user
      });
    } catch (error) {
      console.error('Render edit user error:', error);
      res.render('error', {
        title: 'Error',
        message: 'Failed to load user for editing',
        error: process.env.NODE_ENV === 'development' ? error : {}
      });
    }
  }

  /**
   * Add user (admin only)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async addUser(req, res) {
    try {
      const {
        username,
        email,
        password,
        fullName,
        role,
        timezone
      } = req.body;

      // Validate input
      if (!username || !email || !password) {
        return res.render('users/add', {
          title: 'Add User',
          error: 'Username, email, and password are required',
          formData: req.body,
          user: req.user
        });
      }

      const userData = {
        username,
        email,
        password,
        fullName,
        role: role || 'user',
        timezone: timezone || 'UTC'
      };

      const newUser = await userService.createUser(userData);

      // Redirect to users list
      res.redirect('/users');
    } catch (error) {
      console.error('Add user error:', error);
      res.render('users/add', {
        title: 'Add User',
        error: error.message,
        formData: req.body,
        user: req.user
      });
    }
  }

  /**
   * Update user (admin only)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const {
        username,
        email,
        password,
        fullName,
        role,
        isActive,
        timezone
      } = req.body;

      // Validate input
      if (!username || !email) {
        const userToEdit = await userService.getUserById(id);
        return res.render('users/edit', {
          title: `Edit User: ${userToEdit.username}`,
          userToEdit,
          error: 'Username and email are required',
          user: req.user
        });
      }

      const userData = {
        username,
        email,
        fullName,
        role,
        isActive: isActive === 'true' || isActive === true,
        timezone: timezone || 'UTC'
      };

      // Only update password if provided
      if (password) {
        userData.password = password;
      }

      await userService.updateUser(id, userData);

      // Redirect to users list
      res.redirect('/users');
    } catch (error) {
      console.error('Update user error:', error);
      try {
        const userToEdit = await userService.getUserById(req.params.id);
        res.render('users/edit', {
          title: `Edit User: ${userToEdit.username}`,
          userToEdit,
          error: error.message,
          user: req.user
        });
      } catch (innerError) {
        res.render('error', {
          title: 'Error',
          message: 'Failed to update user',
          error: process.env.NODE_ENV === 'development' ? error : {}
        });
      }
    }
  }

  /**
   * Delete user (admin only)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      await userService.deleteUser(id);

      // Redirect to users list
      res.redirect('/users');
    } catch (error) {
      console.error('Delete user error:', error);
      res.render('error', {
        title: 'Error',
        message: 'Failed to delete user',
        error: process.env.NODE_ENV === 'development' ? error : {}
      });
    }
  }
}

module.exports = new UserController(); 