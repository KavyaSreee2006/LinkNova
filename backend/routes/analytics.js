const express = require('express');
const {
  getUrlAnalytics,
  getPublicStats,
  getDashboardSummary
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/summary', protect, getDashboardSummary);
router.get('/public/:shortCode', getPublicStats);
router.get('/:id', protect, getUrlAnalytics);

module.exports = router;
