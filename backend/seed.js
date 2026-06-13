const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const ShortUrl = require('./models/ShortUrl');
const Visit = require('./models/Visit');

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/linkpulse';

const mockBrowsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'];
const mockDevices = ['Desktop', 'Mobile', 'Tablet'];
const mockOS = ['Windows', 'macOS', 'iOS', 'Android', 'Linux'];
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
const mockReferrers = ['Direct', 'github.com', 'twitter.com', 'linkedin.com', 'google.com', 'youtube.com', 'reddit.com'];

const seed = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(mongoUri);
    console.log('Database connected successfully.');

    // Clear existing collections
    console.log('Cleaning existing data...');
    await User.deleteMany({});
    await ShortUrl.deleteMany({});
    await Visit.deleteMany({});

    // 1. Create demo user
    console.log('Seeding user...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    const user = await User.create({
      name: 'Demo User',
      email: 'demouser@linknova.com',
      password: hashedPassword
    });

    console.log(`Demo User created: email: demouser@linknova.com, password: password123`);

    // 2. Create sample Short URLs
    console.log('Seeding short URLs...');
    const now = new Date();

    const url1 = await ShortUrl.create({
      userId: user._id,
      originalUrl: 'https://github.com/trending',
      shortCode: 'ghtrend',
      customAlias: 'ghtrend',
      clickCount: 152,
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
    });

    const url2 = await ShortUrl.create({
      userId: user._id,
      originalUrl: 'https://react.dev/reference/react',
      shortCode: 'reactdoc',
      customAlias: 'reactdoc',
      clickCount: 84,
      createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000) // 8 days ago
    });

    const url3 = await ShortUrl.create({
      userId: user._id,
      originalUrl: 'https://tailwindcss.com/docs',
      shortCode: 'twdocs',
      customAlias: 'twdocs',
      clickCount: 38,
      createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
    });

    const url4 = await ShortUrl.create({
      userId: user._id,
      originalUrl: 'https://news.ycombinator.com',
      shortCode: 'hn-expired',
      customAlias: 'hn-expired',
      clickCount: 12,
      expiryDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // Expired 1 day ago
      createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000) // 6 days ago
    });

    const urls = [url1, url2, url3, url4];
    console.log('URLs seeded successfully.');

    // 3. Seed Visits analytics data
    console.log('Seeding visits...');
    
    // Generate visits for each URL spread over time
    for (const url of urls) {
      const clicksCount = url.clickCount;
      const createdTime = url.createdAt.getTime();
      const timeSpan = now.getTime() - createdTime;

      const visitsArray = [];

      for (let i = 0; i < clicksCount; i++) {
        // Random timestamp between creation and now
        const visitTimestamp = new Date(createdTime + Math.random() * timeSpan);
        
        // Random details
        const browser = mockBrowsers[Math.floor(Math.random() * mockBrowsers.length)];
        const device = mockDevices[Math.floor(Math.random() * mockDevices.length)];
        const os = mockOS[Math.floor(Math.random() * mockOS.length)];
        const loc = mockLocations[Math.floor(Math.random() * mockLocations.length)];
        const referrer = mockReferrers[Math.floor(Math.random() * mockReferrers.length)];

        visitsArray.push({
          shortUrlId: url._id,
          timestamp: visitTimestamp,
          browser,
          device,
          os,
          country: loc.country,
          city: loc.city,
          referrer
        });
      }

      await Visit.insertMany(visitsArray);
      console.log(`Seeded ${clicksCount} visits for /${url.shortCode}`);
    }

    console.log('Seeding complete! Database is ready.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seed();
