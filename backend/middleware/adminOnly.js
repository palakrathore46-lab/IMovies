// middleware/adminOnly.js - Middleware to restrict access to admin users only
const adminOnly = (req, res, next) => {
  // Ensure user is authenticated and has admin role
  if (req.user && req.user.role === 'admin') {
    next(); // User is admin, proceed
  } else {
    return res.status(403).json({
      message: 'Access denied. You must be an administrator to perform this action.',
    });
  }
};

module.exports = { adminOnly };
