const userService = require('../services/user.service');

/**
 * Profile controller
 */
class ProfileController {
  /**
   * Render profile page
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async renderProfile(req, res) {
    try {
      // Get user from database to ensure we have the latest data
      const user = await userService.getUserById(req.user.id);

      res.render('profile/index', {
        title: 'My Profile',
        userProfile: user,
        success: req.query.success,
        error: req.query.error,
        user: req.user
      });
    } catch (error) {
      console.error('Render profile error:', error);
      res.render('error', {
        title: 'Error',
        message: 'Failed to load profile',
        error: process.env.NODE_ENV === 'development' ? error : {}
      });
    }
  }

  /**
   * Update profile
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async updateProfile(req, res) {
    try {
      const { fullName, email, timezone, currentPassword, newPassword } = req.body;

      // Validate current password if changing password
      if (newPassword) {
        const user = await userService.getUserById(req.user.id);
        const isPasswordValid = await user.validPassword(currentPassword);
        
        if (!isPasswordValid) {
          return res.redirect('/profile?error=Current+password+is+incorrect');
        }
      }

      // Update user data
      const userData = {
        fullName,
        email,
        timezone
      };

      // Only update password if provided
      if (newPassword) {
        userData.password = newPassword;
      }

      await userService.updateUser(req.user.id, userData);

      res.redirect('/profile?success=true');
    } catch (error) {
      console.error('Update profile error:', error);
      res.redirect(`/profile?error=${encodeURIComponent(error.message)}`);
    }
  }
}

module.exports = new ProfileController(); 