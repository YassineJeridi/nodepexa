const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Add this
const Association = require('../models/Association'); // Add this
const CasaAdmin = require('../models/CasaAdmin'); // Add this

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Access denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach different entities based on role
    switch(decoded.role) {
      case 'admin':
        req.admin = await CasaAdmin.findById(decoded.adminId);
        break;
      case 'association':
        req.association = await Association.findById(decoded.associationId);
        break;
      case 'user':
        req.user = await User.findById(decoded.userId);
        break;
      default:
        return res.status(403).json({ error: "Invalid role" });
    }

    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid token" });
  }
};