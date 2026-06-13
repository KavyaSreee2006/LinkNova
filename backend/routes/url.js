const express = require('express');
const {
  createShortUrl,
  getAllUrls,
  updateShortUrl,
  deleteShortUrl,
  bulkCreateShortUrls
} = require('../controllers/urlController');
const { protect, optionalProtect } = require('../middleware/auth');
const { validateUrlCreation } = require('../middleware/validate');

const router = express.Router();

router.post('/create', optionalProtect, validateUrlCreation, createShortUrl);
router.post('/bulk', protect, bulkCreateShortUrls);
router.get('/all', protect, getAllUrls);
router.put('/:id', protect, updateShortUrl);
router.delete('/:id', protect, deleteShortUrl);

module.exports = router;
