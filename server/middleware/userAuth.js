const jwt = require('jsonwebtoken');

function readUserToken(req, res, next, required) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) {
    if (!required) return next();
    return res.status(401).json({ message: 'Please sign in to continue.' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'user' || !payload.userId)
      throw new Error('Invalid role');
    req.user = { id: payload.userId, email: payload.email };
    return next();
  } catch {
    return res.status(401).json({ message: 'Session expired. Please sign in again.' });
  }
}

module.exports = {
  optional: (req, res, next) => readUserToken(req, res, next, false),
  required: (req, res, next) => readUserToken(req, res, next, true),
};
