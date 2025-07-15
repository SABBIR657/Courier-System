const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401);

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    req.user = decoded;
    next();
  });
};

const checkRole = (role) => (req, res, next) => {
  if (req.user.role !== role) return res.status(403).json({ message: "Access denied" });
  next();
};

module.exports = { verifyToken, checkRole };
