const dns = require('node:dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !process.env.ADMIN_EMAIL ||
    !process.env.ADMIN_PASSWORD_HASH ||
    !process.env.JWT_SECRET
  ) {
    return res
      .status(503)
      .json({ message: 'Admin login is not configured on the server.' });
  }
  try {
    const emailMatches =
      email.trim().toLowerCase() ===
      process.env.ADMIN_EMAIL.trim().toLowerCase();
    const passwordMatches = await bcrypt.compare(
      password,
      process.env.ADMIN_PASSWORD_HASH,
    );
    if (!emailMatches || !passwordMatches)
      return res.status(401).json({ message: 'Invalid email or password.' });
    const token = jwt.sign(
      { role: 'admin', email: process.env.ADMIN_EMAIL },
      process.env.JWT_SECRET,
      { expiresIn: '8h' },
    );
    res.json({ token, expiresIn: 28800 });
  } catch {
    res
      .status(500)
      .json({
        message:
          'Unable to sign in. Check the admin password hash configuration.',
      });
  }
});
module.exports = router;
