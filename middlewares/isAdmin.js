module.exports = (req, res, next) => {
    if (!req.admin) { // Assuming authMiddleware attaches admin to req
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  };