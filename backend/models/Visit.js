const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema({
  shortUrlId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShortUrl',
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  browser: {
    type: String,
    default: 'Unknown'
  },
  device: {
    type: String,
    default: 'Unknown'
  },
  os: {
    type: String,
    default: 'Unknown'
  },
  country: {
    type: String,
    default: 'Unknown'
  },
  city: {
    type: String,
    default: 'Unknown'
  },
  referrer: {
    type: String,
    default: 'Direct'
  }
});

module.exports = mongoose.model('Visit', VisitSchema);
