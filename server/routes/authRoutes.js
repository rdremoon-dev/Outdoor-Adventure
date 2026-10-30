const dns = require('node:dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AdminProfile = require('../models/AdminProfile');
const adminAuth = require('../middleware/adminAuth');
const userAuth = require('../middleware/userAuth');
const router = express.Router();

function validEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function userDetails(user) {
  return { id: user._id, name: user.name, email: user.email, phone: user.phone };
}

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

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, phone = '' } = req.body || {};
    if (
      typeof name !== 'string' ||
      !name.trim() ||
      name.trim().length > 100 ||
      !validEmail(email) ||
      typeof password !== 'string' ||
      password.length < 10 ||
      password.length > 128 ||
      typeof phone !== 'string' ||
      phone.trim().length > 30
    ) {
      return res.status(400).json({
        message: 'Enter a name and valid email, and use a password of at least 10 characters.',
      });
    }
    if (!process.env.JWT_SECRET)
      return res.status(503).json({ message: 'Account authentication is not configured.' });
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail }))
      return res.status(409).json({ message: 'An account with that email already exists.' });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      passwordHash,
    });
    const token = jwt.sign(
      { role: 'user', userId: String(user._id), email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
    );
    return res.status(201).json({ token, user: userDetails(user), expiresIn: 604800 });
  } catch (error) {
    if (error.code === 11000)
      return res.status(409).json({ message: 'An account with that email already exists.' });
    return next(error);
  }
});

router.post('/user/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!process.env.JWT_SECRET)
      return res.status(503).json({ message: 'Account authentication is not configured.' });
    if (!validEmail(email) || typeof password !== 'string')
      return res.status(400).json({ message: 'Enter a valid email and password.' });
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      return res.status(401).json({ message: 'Invalid email or password.' });
    const token = jwt.sign(
      { role: 'user', userId: String(user._id), email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
    );
    return res.json({ token, user: userDetails(user), expiresIn: 604800 });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', userAuth.required, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('name email phone');
    if (!user) return res.status(404).json({ message: 'Account not found.' });
    return res.json({ user: userDetails(user) });
  } catch (error) {
    return next(error);
  }
});

router.patch('/me', userAuth.required, async (req, res, next) => {
  try {
    const { name, phone } = req.body || {};
    if (
      typeof name !== 'string' ||
      !name.trim() ||
      name.trim().length > 100 ||
      typeof phone !== 'string' ||
      phone.trim().length > 30
    ) {
      return res.status(400).json({ message: 'Enter a valid name and phone number.' });
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name: name.trim(), phone: phone.trim() },
      { new: true, runValidators: true, select: 'name email phone' },
    );
    if (!user) return res.status(404).json({ message: 'Account not found.' });
    return res.json({ message: 'Profile updated.', user: userDetails(user) });
  } catch (error) {
    return next(error);
  }
});

router.get('/admin/profile', adminAuth, async (req, res, next) => {
  try {
    const email = String(req.admin.email || '').toLowerCase();
    const profile = await AdminProfile.findOne({ email }).lean();
    return res.json({
      profile: {
        email,
        name: profile?.name || '',
        phone: profile?.phone || '',
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.patch('/admin/profile', adminAuth, async (req, res, next) => {
  try {
    const { name, phone } = req.body || {};
    if (
      typeof name !== 'string' ||
      name.trim().length > 100 ||
      typeof phone !== 'string' ||
      phone.trim().length > 30
    ) {
      return res.status(400).json({ message: 'Enter a valid name and phone number.' });
    }
    const email = String(req.admin.email || '').toLowerCase();
    const profile = await AdminProfile.findOneAndUpdate(
      { email },
      { $set: { name: name.trim(), phone: phone.trim() } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    ).lean();
    return res.json({
      message: 'Admin profile updated.',
      profile: { email, name: profile.name, phone: profile.phone },
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
