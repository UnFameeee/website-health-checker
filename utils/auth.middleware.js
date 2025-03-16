const { verifyToken } = require('./jwt');
const db = require('../database/models');

/**
 * Get token from request
 * @param {Object} req - Request object
 * @returns {String|null} Token or null
 */
const getTokenFromRequest = (req) => {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  
  // Check X-Auth-Token header
  if (req.headers['x-auth-token']) {
    return req.headers['x-auth-token'];
  }
  
  // Check token in request body
  if (req.body && req.body.token) {
    return req.body.token;
  }
  
  // Check token in cookies
  if (req.cookies && req.cookies.authToken) {
    return req.cookies.authToken;
  }
  
  return null;
};

/**
 * Middleware to authenticate user using JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify token
    const decoded = verifyToken(token);
    
    // Find user
    const user = await db.User.findOne({ 
      where: { 
        id: decoded.id,
        is_active: true,
        deleted: false
      } 
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/**
 * Middleware to check if user is admin
 */
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Admin access required' });
  }
};

/**
 * Middleware for web routes that redirects to login if not authenticated
 * This uses a custom header X-Auth-Token that will be set by frontend JavaScript
 * from localStorage
 */
const webAuthenticate = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    
    if (!token) {
      // For API requests, return 401
      if (req.xhr || req.path.startsWith('/api')) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      // For web requests, redirect to login
      return res.redirect('/auth/login');
    }

    // Verify token
    const decoded = verifyToken(token);
    
    // Find user
    const user = await db.User.findOne({ 
      where: { 
        id: decoded.id,
        is_active: true,
        deleted: false
      } 
    });

    if (!user) {
      if (req.xhr || req.path.startsWith('/api')) {
        return res.status(401).json({ message: 'User not found or inactive' });
      }
      return res.redirect('/auth/login');
    }

    // Attach user to request object
    req.user = user;
    // Also attach user data for views
    res.locals.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      fullName: user.full_name
    };
    
    next();
  } catch (error) {
    if (req.xhr || req.path.startsWith('/api')) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    return res.redirect('/auth/login');
  }
};

module.exports = {
  authenticate,
  isAdmin,
  webAuthenticate
}; 