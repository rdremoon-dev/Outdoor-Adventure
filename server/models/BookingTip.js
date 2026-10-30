const mongoose = require('mongoose');

const bookingTipSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    category: { type: String, trim: true, maxlength: 60, default: 'General' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model('BookingTip', bookingTipSchema);
