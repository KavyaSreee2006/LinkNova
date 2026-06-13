const mongoose = require('mongoose');
const ShortUrl = require('../models/ShortUrl');
const Visit = require('../models/Visit');

// Helper to format date as YYYY-MM-DD
const formatDate = (date) => {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

// @desc    Get detailed analytics for a short URL
// @route   GET /api/analytics/:id
// @access  Private
exports.getUrlAnalytics = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid URL ID format'
      });
    }

    const url = await ShortUrl.findById(id);
    if (!url) {
      return res.status(404).json({
        success: false,
        message: 'URL not found'
      });
    }

    // Verify ownership
    if (url.userId && url.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view analytics for this URL'
      });
    }

    // Fetch all visits for this link
    const visits = await Visit.find({ shortUrlId: id }).sort({ timestamp: -1 });

    const totalClicks = visits.length;
    const lastVisited = totalClicks > 0 ? visits[0].timestamp : null;

    // Distribute by Browser, Device, OS, Country, Referrer
    const browserDist = {};
    const deviceDist = {};
    const osDist = {};
    const countryDist = {};
    const referrerDist = {};
    const trendData = {};

    // Initialize daily trends for the last 7 days so charts aren't empty
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const dateStr = formatDate(new Date(now.getTime() - i * 24 * 60 * 60 * 1000));
      trendData[dateStr] = 0;
    }

    visits.forEach((visit) => {
      // Browser
      browserDist[visit.browser] = (browserDist[visit.browser] || 0) + 1;
      // Device
      deviceDist[visit.device] = (deviceDist[visit.device] || 0) + 1;
      // OS
      osDist[visit.os] = (osDist[visit.os] || 0) + 1;
      // Country
      countryDist[visit.country] = (countryDist[visit.country] || 0) + 1;
      // Referrer
      referrerDist[visit.referrer] = (referrerDist[visit.referrer] || 0) + 1;

      // Trend data (grouped by date)
      const dateStr = formatDate(visit.timestamp);
      trendData[dateStr] = (trendData[dateStr] || 0) + 1;
    });

    // Format distributions for Recharts (Array of { name, value })
    const formatDist = (distObj) => {
      return Object.keys(distObj).map((key) => ({
        name: key,
        value: distObj[key]
      })).sort((a, b) => b.value - a.value);
    };

    // Format daily trend data (sorted chronologically)
    const trends = Object.keys(trendData).map((date) => ({
      date,
      clicks: trendData[date]
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    // Get recent 15 visits
    const recentVisits = visits.slice(0, 15).map(v => ({
      id: v._id,
      timestamp: v.timestamp,
      browser: v.browser,
      device: v.device,
      os: v.os,
      country: v.country,
      city: v.city,
      referrer: v.referrer
    }));

    res.status(200).json({
      success: true,
      data: {
        shortUrl: {
          id: url._id,
          originalUrl: url.originalUrl,
          shortCode: url.shortCode,
          customAlias: url.customAlias,
          clickCount: url.clickCount,
          expiryDate: url.expiryDate,
          createdAt: url.createdAt
        },
        analytics: {
          totalClicks,
          lastVisited,
          browsers: formatDist(browserDist),
          devices: formatDist(deviceDist),
          operatingSystems: formatDist(osDist),
          countries: formatDist(countryDist),
          referrers: formatDist(referrerDist),
          dailyTrends: trends,
          recentVisits
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public statistics for a short URL by shortCode
// @route   GET /api/analytics/public/:shortCode
// @access  Public
exports.getPublicStats = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    const url = await ShortUrl.findOne({ shortCode });
    if (!url) {
      return res.status(404).json({
        success: false,
        message: 'URL not found'
      });
    }

    // Check link expiration
    const isExpired = url.expiryDate && new Date(url.expiryDate) < new Date();

    res.status(200).json({
      success: true,
      data: {
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        clickCount: url.clickCount,
        createdAt: url.createdAt,
        expiryDate: url.expiryDate,
        isExpired
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard metrics for authenticated user
// @route   GET /api/analytics/dashboard/summary
// @access  Private
exports.getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Fetch all user URLs
    const urls = await ShortUrl.find({ userId });
    
    const totalUrls = urls.length;
    let totalClicks = 0;
    let mostClickedUrl = null;
    let maxClicks = -1;

    urls.forEach((url) => {
      totalClicks += url.clickCount;
      if (url.clickCount > maxClicks) {
        maxClicks = url.clickCount;
        mostClickedUrl = url;
      }
    });

    // Fetch the recent 10 visits across ALL of user's URLs
    const urlIds = urls.map(u => u._id);
    const recentVisitsRaw = await Visit.find({ shortUrlId: { $in: urlIds } })
      .sort({ timestamp: -1 })
      .limit(10)
      .populate('shortUrlId', 'shortCode originalUrl');

    const recentActivity = recentVisitsRaw.map((v) => ({
      id: v._id,
      timestamp: v.timestamp,
      browser: v.browser,
      device: v.device,
      country: v.country,
      city: v.city,
      shortCode: v.shortUrlId ? v.shortUrlId.shortCode : 'Deleted',
      originalUrl: v.shortUrlId ? v.shortUrlId.originalUrl : 'Deleted'
    }));

    res.status(200).json({
      success: true,
      data: {
        totalUrls,
        totalClicks,
        mostClickedUrl: mostClickedUrl ? {
          id: mostClickedUrl._id,
          shortCode: mostClickedUrl.shortCode,
          originalUrl: mostClickedUrl.originalUrl,
          clickCount: mostClickedUrl.clickCount
        } : null,
        recentActivity
      }
    });
  } catch (error) {
    next(error);
  }
};
