const mongoose = require('mongoose');

const adminProfileSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, trim: true, maxlength: 100, default: '' },
    phone: { type: String, trim: true, maxlength: 30, default: '' },
  },
  { timestamps: true },
);

module.exports = mongoose.model('AdminProfile', adminProfileSchema);
