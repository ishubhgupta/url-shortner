const { nanoid } = require('nanoid');
const Url = require('../models/Url');

// Helper to generate a unique short code (6-8 chars)
async function generateUniqueCode() {
  for (let attempt = 0; attempt < 5; attempt++) {
    const len = Math.floor(Math.random() * 3) + 6; // 6-8
    const code = nanoid(len);
    const exists = await Url.findOne({ shortCode: code });
    if (!exists) return code;
  }
  // fallback: append timestamp
  return nanoid(8) + Date.now().toString(36);
}

exports.createShortUrl = async (req, res) => {
  try {
    const { originalUrl, customAlias, expiresAt } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ message: 'originalUrl is required' });
    }

    let shortCode;

    if (customAlias) {
      // validate alphanumeric only
      const isValid = /^[a-zA-Z0-9_-]+$/.test(customAlias);
      if (!isValid) return res.status(400).json({ message: 'customAlias must be alphanumeric (plus - or _)' });

      const existing = await Url.findOne({ $or: [{ shortCode: customAlias }, { customAlias }] });
      if (existing) return res.status(409).json({ message: 'customAlias already in use' });

      shortCode = customAlias;
    } else {
      shortCode = await generateUniqueCode();
    }

    const url = new Url({
      originalUrl,
      shortCode,
      customAlias: customAlias || undefined,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    await url.save();

    return res.status(201).json({
      message: 'Short URL created',
      data: {
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        createdAt: url.createdAt,
        expiresAt: url.expiresAt,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.redirect = async (req, res) => {
  try {
    const key = req.params.shortCode;
    const url = await Url.findOne({ $or: [{ shortCode: key }, { customAlias: key }] });
    if (!url) return res.status(404).json({ message: 'Short URL not found' });

    if (url.expiresAt && new Date() > url.expiresAt) {
      return res.status(410).json({ message: 'Short URL has expired' });
    }

    // Track click
    const ip = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
    const ua = req.get('User-Agent');
    const ref = req.get('Referer') || '';

    url.clicks = (url.clicks || 0) + 1;
    url.clickDetails.push({ clickedAt: new Date(), ipAddress: ip, userAgent: ua, referrer: ref });
    await url.save();

    return res.redirect(url.originalUrl);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getUrls = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [total, urls] = await Promise.all([
      Url.countDocuments(),
      Url.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    ]);

    return res.json({ page, limit, total, totalPages: Math.ceil(total / limit), data: urls });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const key = req.params.shortCode;
    const url = await Url.findOne({ $or: [{ shortCode: key }, { customAlias: key }] });
    if (!url) return res.status(404).json({ message: 'Short URL not found' });

    // Simple analytics: total clicks and recent clickDetails
    const lastClicks = url.clickDetails.slice(-50).reverse();

    // Optional simple timeseries: group by date
    const timeseries = {};
    url.clickDetails.forEach((c) => {
      const d = c.clickedAt.toISOString().slice(0, 10);
      timeseries[d] = (timeseries[d] || 0) + 1;
    });

    return res.json({
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      clicks: url.clicks,
      createdAt: url.createdAt,
      expiresAt: url.expiresAt,
      timeseries,
      recent: lastClicks,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteUrl = async (req, res) => {
  try {
    const key = req.params.shortCode;
    const url = await Url.findOneAndDelete({ $or: [{ shortCode: key }, { customAlias: key }] });
    if (!url) return res.status(404).json({ message: 'Short URL not found' });

    return res.json({ message: 'Deleted', shortCode: key });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
