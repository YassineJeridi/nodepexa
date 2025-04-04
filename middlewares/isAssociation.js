module.exports = (req, res, next) => {
    if (!req.association) return res.status(403).json({ error: "Association access required" });
    next();
  };