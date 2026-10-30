const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      unique: true,
    },
    phone: { type: String, trim: true, maxlength: 30, default: '' },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model('User', userSchema);
