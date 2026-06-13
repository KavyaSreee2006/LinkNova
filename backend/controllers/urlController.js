const { nanoid } = require('nanoid');
const ShortUrl = require('../models/ShortUrl');
const Visit = require('../models/Visit');

// Helper to calculate expiry date based on selection
const calculateExpiryDate = (expiryOption) => {
  if (!expiryOption) return null;

  const now = new Date();
  if (expiryOption === '1') {
    return new Date(now.setDate(now.getDate() + 1));
  } else if (expiryOption === '7') {
    return new Date(now.setDate(now.getDate() + 7));
  } else if (expiryOption === '30') {
    return new Date(now.setDate(now.getDate() + 30));
  } else {
    // Treat as custom date string
    const parsedDate = new Date(expiryOption);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  }
};

// @desc    Create a short URL
// @route   POST /api/url/create
// @access  Public (Optional Auth)
exports.createShortUrl = async (req, res, next) => {
  try {
    const { originalUrl, customAlias, expiryOption } = req.body;
    const userId = req.user ? req.user._id : null;

    let shortCode;

    if (customAlias) {
      const normalizedAlias = customAlias.trim().toLowerCase();
      // Check if alias already exists
      const existing = await ShortUrl.findOne({ 
        $or: [{ shortCode: normalizedAlias }, { customAlias: normalizedAlias }] 
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Custom alias or short code is already in use. Please select a different one.'
        });
      }
      shortCode = normalizedAlias;
    } else {
      // Generate unique shortCode loop
      let isUnique = false;
      while (!isUnique) {
        shortCode = nanoid(6);
        const codeExists = await ShortUrl.findOne({ shortCode });
        if (!codeExists) {
          isUnique = true;
        }
      }
    }

    const expiryDate = calculateExpiryDate(expiryOption);

    const shortUrl = await ShortUrl.create({
      userId,
      originalUrl,
      shortCode,
      customAlias: customAlias ? customAlias.trim().toLowerCase() : undefined,
      expiryDate,
      clickCount: 0
    });

    res.status(201).json({
      success: true,
      data: shortUrl
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all short URLs for authenticated user
// @route   GET /api/url/all
// @access  Private
exports.getAllUrls = async (req, res, next) => {
  try {
    const urls = await ShortUrl.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: urls.length,
      data: urls
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a short URL (destination, customAlias, or expiry)
// @route   PUT /api/url/:id
// @access  Private
exports.updateShortUrl = async (req, res, next) => {
  try {
    const { originalUrl, customAlias, expiryOption } = req.body;
    let url = await ShortUrl.findById(req.params.id);

    if (!url) {
      return res.status(404).json({
        success: false,
        message: 'URL not found'
      });
    }

    // Verify ownership
    if (url.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this URL'
      });
    }

    // Check custom alias conflicts if changing alias
    if (customAlias && customAlias.toLowerCase() !== url.customAlias) {
      const normalizedAlias = customAlias.trim().toLowerCase();
      const existing = await ShortUrl.findOne({
        _id: { $ne: req.params.id },
        $or: [{ shortCode: normalizedAlias }, { customAlias: normalizedAlias }]
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Custom alias is already in use.'
        });
      }
      url.customAlias = normalizedAlias;
      url.shortCode = normalizedAlias; // Update shortCode to align with alias redirects
    }

    if (originalUrl) {
      // Basic normalization
      let normalizedUrl = originalUrl.trim();
      if (!/^https?:\/\//i.test(normalizedUrl)) {
        normalizedUrl = 'http://' + normalizedUrl;
      }
      url.originalUrl = normalizedUrl;
    }

    if (expiryOption !== undefined) {
      url.expiryDate = calculateExpiryDate(expiryOption);
    }

    await url.save();

    res.status(200).json({
      success: true,
      data: url
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a short URL
// @route   DELETE /api/url/:id
// @access  Private
exports.deleteShortUrl = async (req, res, next) => {
  try {
    const url = await ShortUrl.findById(req.params.id);

    if (!url) {
      return res.status(404).json({
        success: false,
        message: 'URL not found'
      });
    }

    // Verify ownership
    if (url.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this URL'
      });
    }

    // Delete associated visits and URL
    await Visit.deleteMany({ shortUrlId: url._id });
    await ShortUrl.deleteOne({ _id: url._id });

    res.status(200).json({
      success: true,
      message: 'URL and associated analytics deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk create short URLs
// @route   POST /api/url/bulk
// @access  Private
exports.bulkCreateShortUrls = async (req, res, next) => {
  try {
    const { urls } = req.body; // Array of { originalUrl, customAlias, expiryOption }
    const userId = req.user._id;

    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of URL objects'
      });
    }

    const results = [];

    for (let index = 0; index < urls.length; index++) {
      const entry = urls[index];
      let { originalUrl, customAlias, expiryOption } = entry;

      if (!originalUrl) {
        results.push({
          success: false,
          originalUrl: '',
          error: 'Missing original destination URL'
        });
        continue;
      }

      // Basic normalize
      originalUrl = originalUrl.trim();
      if (!/^https?:\/\//i.test(originalUrl)) {
        originalUrl = 'http://' + originalUrl;
      }

      let shortCode;
      let hasAliasConflict = false;

      if (customAlias) {
        const normalizedAlias = customAlias.trim().toLowerCase();
        const existing = await ShortUrl.findOne({
          $or: [{ shortCode: normalizedAlias }, { customAlias: normalizedAlias }]
        });
        if (existing) {
          hasAliasConflict = true;
          // Fallback to random code but flag it in the response, or skip
          shortCode = nanoid(6);
        } else {
          shortCode = normalizedAlias;
        }
      } else {
        let isUnique = false;
        while (!isUnique) {
          shortCode = nanoid(6);
          const codeExists = await ShortUrl.findOne({ shortCode });
          if (!codeExists) {
            isUnique = true;
          }
        }
      }

      const expiryDate = calculateExpiryDate(expiryOption);

      try {
        const shortUrl = await ShortUrl.create({
          userId,
          originalUrl,
          shortCode,
          customAlias: (customAlias && !hasAliasConflict) ? customAlias.trim().toLowerCase() : undefined,
          expiryDate,
          clickCount: 0
        });

        results.push({
          success: true,
          originalUrl,
          shortUrl,
          warning: hasAliasConflict ? `Custom alias '${customAlias}' was taken; random code generated instead.` : undefined
        });
      } catch (err) {
        results.push({
          success: false,
          originalUrl,
          error: err.message
        });
      }
    }

    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    next(error);
  }
};
