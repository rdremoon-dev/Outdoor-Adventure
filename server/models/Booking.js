const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customerName: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  phone: { type: String, required: true, trim: true, maxlength: 30 },
  adventure: { type: String, required: true, enum: [
    'Backpacking Trips', 'Family Hiking Trips', 'Water Sports & Kayaking', 'Winter Alpine Sports'
  ] },
  bookingDate: { type: Date, required: true },
  guests: { type: Number, required: true, min: 1, max: 10 },
  message: { type: String, trim: true, maxlength: 1000, default: '' },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  paymentStatus: { type: String, enum: ['not_configured', 'pending', 'paid', 'failed', 'cancelled', 'review'], default: 'not_configured' },
  paymentCurrency: { type: String, enum: ['BDT', 'USD'], default: 'USD' },
  paymentAmount: { type: Number, min: 0 },
  unitPriceUSD: { type: Number, min: 0 },
  usdToBdtRate: { type: Number, min: 0 },
  billingCountry: { type: String, enum: ['BD', 'INTL'], default: 'INTL' },
  customerCountry: { type: String, trim: true, maxlength: 80, default: 'United States' },
  paymentGateway: { type: String, default: 'sslcommerz' },
  transactionId: { type: String },
  validationId: { type: String, default: '' },
  bankTransactionId: { type: String, default: '' },
  paidAt: { type: Date },
  paymentUpdatedAt: { type: Date },
}, { timestamps: true });

bookingSchema.index({ bookingDate: 1, status: 1 });
bookingSchema.index({ transactionId: 1 }, { unique: true, sparse: true });
module.exports = mongoose.model('Booking', bookingSchema);
