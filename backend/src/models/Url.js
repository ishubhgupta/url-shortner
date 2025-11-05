const mongoose = require('mongoose');

const ClickDetailSchema = new mongoose.Schema({
  clickedAt: { type: Date, default: Date.now },
  ipAddress: String,
  userAgent: String,
  referrer: String,
});

const UrlSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  shortCode: { type: String, required: true, unique: true },
  customAlias: { type: String },
  clicks: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  clickDetails: [ClickDetailSchema],
});

module.exports = mongoose.model('Url', UrlSchema);
