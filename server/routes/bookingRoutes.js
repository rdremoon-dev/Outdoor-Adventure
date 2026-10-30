const dns = require('node:dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const Booking = require('../models/Booking');
const adminAuth = require('../middleware/adminAuth');
const userAuth = require('../middleware/userAuth');

const router = express.Router();
const adventures = new Set([
  'Backpacking Trips',
  'Family Hiking Trips',
  'Water Sports & Kayaking',
  'Winter Alpine Sports',
]);

// Public endpoint: creates a booking request. It does not confirm availability.
router.post('/', userAuth.optional, async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      destination,
      date,
      guests,
      message = '',
      billingCountry = 'INTL',
      customerCountry = 'United States',
    } = req.body || {};
    if (
      ![name, email, phone, destination, date].every(
        v => typeof v === 'string' && v.trim(),
      )
    ) {
      return res
        .status(400)
        .json({ message: 'Please complete all required fields.' });
    }
    if (
      name.trim().length > 100 ||
      phone.trim().length > 30 ||
      message.length > 1000
    ) {
      return res
        .status(400)
        .json({ message: 'One or more fields are too long.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ message: 'Enter a valid email address.' });
    }
    if (!adventures.has(destination))
      return res
        .status(400)
        .json({ message: 'Please select a valid adventure.' });
    if (!['BD', 'INTL'].includes(billingCountry))
      return res
        .status(400)
        .json({ message: 'Choose Bangladesh or international billing.' });
    if (
      typeof customerCountry !== 'string' ||
      customerCountry.trim().length > 80
    )
      return res.status(400).json({ message: 'Enter a valid country.' });
    const guestCount = Number(guests);
    if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 10) {
      return res
        .status(400)
        .json({ message: 'Guest count must be between 1 and 10.' });
    }
    // Interpret YYYY-MM-DD as a calendar date and require a future day in UTC.
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
      return res.status(400).json({ message: 'Choose a valid booking date.' });
    const bookingDate = new Date(`${date}T00:00:00.000Z`);
    if (
      Number.isNaN(bookingDate.getTime()) ||
      bookingDate.toISOString().slice(0, 10) !== date ||
      date <= new Date().toISOString().slice(0, 10)
    ) {
      return res
        .status(400)
        .json({ message: 'Booking date must be a valid future date.' });
    }
    const booking = await Booking.create({
      userId: req.user?.id || null,
      customerName: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      adventure: destination,
      bookingDate,
      guests: guestCount,
      message: String(message).trim(),
      billingCountry,
      customerCountry:
        customerCountry.trim() ||
        (billingCountry === 'BD' ? 'Bangladesh' : 'United States'),
    });
    // Notify authenticated admin dashboards in real time; never expose this event to public clients.
    req.app
      .get('io')
      ?.to('admins')
      .emit('booking:new', {
        bookingId: String(booking._id),
        customerName: booking.customerName,
        adventure: booking.adventure,
        bookingDate: booking.bookingDate,
        guests: booking.guests,
        status: booking.status,
        createdAt: booking.createdAt,
      });
    res
      .status(201)
      .json({
        message:
          'Your booking request was received. We will contact you to confirm availability.',
        bookingId: booking._id,
        status: booking.status,
        paymentEnabled: Boolean(
          process.env.PAYMENT_CALLBACK_BASE_URL &&
          process.env.CLIENT_URL &&
          billingCountry === 'BD' &&
          process.env.SSLCOMMERZ_STORE_ID &&
          process.env.SSLCOMMERZ_STORE_PASSWORD,
        ),
      });
  } catch (err) {
    next(err);
  }
});

// Protected admin endpoints
router.get('/mine', userAuth.required, async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    return res.json({ bookings });
  } catch (err) {
    return next(err);
  }
});

router.get('/', adminAuth, async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();
    res.json({ bookings });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/status', adminAuth, async (req, res, next) => {
  try {
    const { status } = req.body || {};
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid booking status.' });
    }
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true },
    );
    if (!booking)
      return res.status(404).json({ message: 'Booking not found.' });
    req.app
      .get('io')
      ?.to('admins')
      .emit('booking:updated', {
        bookingId: String(booking._id),
        status: booking.status,
        updatedAt: booking.updatedAt,
      });
    res.json({ message: 'Booking status updated.', booking });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
