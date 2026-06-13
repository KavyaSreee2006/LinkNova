const mongoose = require('mongoose');

const ShortUrlSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  originalUrl: {
    type: String,
    required: [true, 'Please add the original destination URL'],
    trim: true
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  customAlias: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple nulls for URLs without a custom alias
    index: true,
    trim: true
  },
  qrCode: {
    type: String, // Can store data URL of QR Code
    default: ''
  },
  clickCount: {
    type: Number,
    default: 0
  },
  expiryDate: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ShortUrl', ShortUrlSchema);
