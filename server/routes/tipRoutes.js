const express = require('express');
const BookingTip = require('../models/BookingTip');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

function readTip(body) {
  const { title, description, category = 'General', active = true } = body || {};
  if (
    typeof title !== 'string' ||
    !title.trim() ||
    title.trim().length > 120 ||
    typeof description !== 'string' ||
    !description.trim() ||
    description.trim().length > 1000 ||
    typeof category !== 'string' ||
    !category.trim() ||
    category.trim().length > 60 ||
    typeof active !== 'boolean'
  ) {
    return null;
  }
  return {
    title: title.trim(),
    description: description.trim(),
    category: category.trim(),
    active,
  };
}

router.get('/', async (req, res, next) => {
  try {
    const tips = await BookingTip.find({ active: true })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    return res.json({ tips });
  } catch (error) {
    return next(error);
  }
});

router.get('/admin', adminAuth, async (req, res, next) => {
  try {
    const tips = await BookingTip.find().sort({ createdAt: -1 }).limit(200).lean();
    return res.json({ tips });
  } catch (error) {
    return next(error);
  }
});

router.post('/', adminAuth, async (req, res, next) => {
  try {
    const tip = readTip(req.body);
    if (!tip) return res.status(400).json({ message: 'Enter a valid tip title, category, and description.' });
    const created = await BookingTip.create(tip);
    return res.status(201).json({ message: 'Booking tip created.', tip: created });
  } catch (error) {
    return next(error);
  }
});

router.patch('/:id', adminAuth, async (req, res, next) => {
  try {
    const tip = readTip(req.body);
    if (!tip) return res.status(400).json({ message: 'Enter a valid tip title, category, and description.' });
    const updated = await BookingTip.findByIdAndUpdate(req.params.id, tip, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: 'Booking tip not found.' });
    return res.json({ message: 'Booking tip updated.', tip: updated });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', adminAuth, async (req, res, next) => {
  try {
    const deleted = await BookingTip.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Booking tip not found.' });
    return res.json({ message: 'Booking tip deleted.' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
