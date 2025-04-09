const jwt = require('jsonwebtoken');
const CasaAdmin = require('../models/CasaAdmin');

const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });


    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await CasaAdmin.findById(decoded.adminId);
   
    if (!admin) throw new Error('Admin not found');
    req.admin = admin;
    next();

  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};