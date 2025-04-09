const CasaAdmin = require('../models/CasaAdmin');

module.exports = async (req, res, next) => {
  try {
    // Use req.admin from authMiddleware instead of req.user.adminId
    if (!req.admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};