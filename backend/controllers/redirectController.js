const UAParser = require('ua-parser-js');
const ShortUrl = require('../models/ShortUrl');
const Visit = require('../models/Visit');

// Mock geolocation list for local/testing environments to make charts beautiful
const mockLocations = [
  { country: 'United States', city: 'New York' },
  { country: 'United Kingdom', city: 'London' },
  { country: 'India', city: 'Bengaluru' },
  { country: 'Germany', city: 'Berlin' },
  { country: 'Japan', city: 'Tokyo' },
  { country: 'France', city: 'Paris' },
  { country: 'Australia', city: 'Sydney' },
  { country: 'Canada', city: 'Toronto' }
];

const getIPLocation = (ip) => {
  // If IP is localhost or loopback, return a random location from our list
  if (
    !ip ||
    ip === '::1' ||
    ip === '127.0.0.1' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('::ffff:127.0.0.1')
  ) {
    const randomIndex = Math.floor(Math.random() * mockLocations.length);
    return mockLocations[randomIndex];
  }

  // Real IP geolocator fallback (simulate mapping for other IPs as a mock fallback)
  const hash = ip.split('.').reduce((acc, octet) => acc + parseInt(octet, 10), 0);
  if (!isNaN(hash)) {
    const index = hash % mockLocations.length;
    return mockLocations[index];
  }

  return { country: 'Unknown', city: 'Unknown' };
};

// @desc    Redirect short URL to original URL
// @route   GET /:shortCode
// @access  Public
exports.redirectToOriginal = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    // Find the URL
    const url = await ShortUrl.findOne({ shortCode });

    if (!url) {
      // Redirect to a 404 page in frontend or display HTML 404
      return res.status(404).send(`
        <html>
          <head>
            <title>Link Nova - Link Not Found</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f172a; color: #f1f5f9; }
              .card { text-align: center; padding: 2rem; border-radius: 1rem; background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); max-width: 400px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); }
              h1 { color: #f43f5e; margin-top: 0; font-size: 2rem; }
              p { color: #94a3b8; font-size: 1.1rem; line-height: 1.5; }
              a { display: inline-block; margin-top: 1.5rem; padding: 0.75rem 1.5rem; border-radius: 0.5rem; background: #6366f1; color: white; text-decoration: none; font-weight: 600; transition: background 0.2s; }
              a:hover { background: #4f46e5; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Link Not Found</h1>
              <p>The shortened URL you are trying to visit does not exist or has been deleted.</p>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}">Create Your Own Short Links</a>
            </div>
          </body>
        </html>
      `);
    }

    // Check link expiration
    if (url.expiryDate && new Date(url.expiryDate) < new Date()) {
      // Redirect to expired page on frontend
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/expired`);
    }

    // Parse User-Agent for device, os, browser
    const userAgent = req.headers['user-agent'] || '';
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    // Map properties
    const browser = result.browser.name || 'Unknown';
    const os = result.os.name || 'Unknown';
    
    // Parse device type
    let device = 'Desktop';
    if (result.device.type === 'mobile') {
      device = 'Mobile';
    } else if (result.device.type === 'tablet') {
      device = 'Tablet';
    } else if (result.device.type === 'console' || result.device.type === 'smarttv' || result.device.type === 'wearable') {
      device = 'Other';
    } else if (userAgent.toLowerCase().includes('mobile')) {
      device = 'Mobile';
    }

    // Resolve IP & Referrer
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const location = getIPLocation(ip);
    
    let referrer = req.get('Referrer') || 'Direct';
    if (referrer !== 'Direct') {
      try {
        const refUrl = new URL(referrer);
        referrer = refUrl.hostname || 'Direct';
      } catch (e) {
        referrer = 'Direct';
      }
    }

    // Log the visit async
    Visit.create({
      shortUrlId: url._id,
      browser,
      device,
      os,
      country: location.country,
      city: location.city,
      referrer
    }).catch(err => console.error('Error logging visit:', err));

    // Increment click count
    url.clickCount += 1;
    await url.save();

    // Perform redirect (302 found for dynamic metrics tracking)
    res.redirect(url.originalUrl);
  } catch (error) {
    next(error);
  }
};
