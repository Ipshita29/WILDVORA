const Experience = require('../models/Experience');

// @route GET /api/experiences
const getExperiences = async (req, res) => {
  try {
    const { category, difficulty, minPrice, maxPrice, duration, search, featured, trending, limit = 20, page = 1 } = req.query;

    const query = { isActive: true };

    if (category && category !== 'All') query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (duration) {
      if (duration === '1 day') query.duration = '1 day';
      else if (duration === '2-3 days') query.duration = { $in: ['2 days', '3 days', '2-3 days'] };
      else if (duration === '1 week+') query.duration = { $regex: /week|7|8|9|10|14/, $options: 'i' };
    }
    if (featured === 'true') query.isFeatured = true;
    if (trending === 'true') query.isTrending = true;
    if (search) query.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Experience.countDocuments(query);
    const experiences = await Experience.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });

    res.json({ success: true, total, count: experiences.length, experiences });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/experiences/:id
const getExperience = async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);
    if (!experience) return res.status(404).json({ success: false, message: 'Experience not found' });
    res.json({ success: true, experience });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/experiences  (admin/operator use — seed data)
const createExperience = async (req, res) => {
  try {
    const experience = await Experience.create(req.body);
    res.status(201).json({ success: true, experience });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/experiences/seed  — populates demo data
const seedExperiences = async (req, res) => {
  try {
    await Experience.deleteMany({});
    const demos = [
      {
        title: 'Glacier Peak Expedition',
        description: 'Embark on a soul-stirring journey into the heart of the Cascades. This 7-day expedition is an immersion into the wild silence of high altitudes. We begin our ascent through ancient evergreen forests, emerging onto sub-alpine meadows before reaching our private basecamp.',
        category: 'Trekking',
        location: { city: 'Cascades', country: 'USA' },
        images: [],
        price: 240,
        duration: '7 days',
        difficulty: 'Hard',
        maxGroupSize: 12,
        includes: ['All meals', 'Gear', 'Guide'],
        hostName: 'Alex Explorer',
        hostVerified: true,
        rating: 4.9,
        reviewCount: 124,
        isFeatured: true,
        isTrending: true,
      },
      {
        title: 'Sunrise Peak Trek & Camping',
        description: 'A beautiful 2-day trek through pine forests and alpine meadows with overnight camping at 3,200m. Witness a stunning sunrise above the clouds on day 2.',
        category: 'Camping',
        location: { city: 'Cascades', country: 'USA' },
        images: [],
        price: 120,
        duration: '2 days',
        difficulty: 'Moderate',
        maxGroupSize: 8,
        includes: ['Camping gear', 'Breakfast', 'Guide'],
        hostName: 'Sam Ridge',
        hostVerified: true,
        rating: 4.8,
        reviewCount: 88,
        isFeatured: true,
        isTrending: false,
      },
      {
        title: 'Amazon Rainforest Survival',
        description: 'Three days deep in the Amazon learning survival skills, indigenous culture, and jungle navigation with expert local guides.',
        category: 'Jungle',
        location: { city: 'Manaus', country: 'Brazil' },
        images: [],
        price: 380,
        duration: '3 days',
        difficulty: 'Hard',
        maxGroupSize: 6,
        includes: ['All meals', 'Accommodation', 'Guide', 'Equipment'],
        hostName: 'Maria Silva',
        hostVerified: true,
        rating: 4.7,
        reviewCount: 62,
        isFeatured: false,
        isTrending: true,
      },
      {
        title: 'Iceland Blue Kayaking',
        description: 'Paddle through icy glacial waters and sea caves along Iceland\'s dramatic coastline. Suitable for beginners with full instruction provided.',
        category: 'Water Sports',
        location: { city: 'Reykjavik', country: 'Iceland' },
        images: [],
        price: 450,
        duration: '1 day',
        difficulty: 'Easy',
        maxGroupSize: 10,
        includes: ['Kayak', 'Wetsuit', 'Instructor', 'Lunch'],
        hostName: 'Erik Bjorn',
        hostVerified: true,
        rating: 4.9,
        reviewCount: 201,
        isFeatured: true,
        isTrending: true,
      },
      {
        title: 'Alpine Ridge Mountain Bike',
        description: 'Shred 45km of singletrack through Zermatt\'s stunning alpine landscape. From ridgeline swoops to valley descents, this is mountain biking at its finest.',
        category: 'Cycling',
        location: { city: 'Zermatt', country: 'Switzerland' },
        images: [],
        price: 200,
        duration: '1 day',
        difficulty: 'Expert',
        maxGroupSize: 8,
        includes: ['Bike rental', 'Helmet', 'Guide', 'Lunch'],
        hostName: 'Klaus Weber',
        hostVerified: false,
        rating: 4.6,
        reviewCount: 45,
        isFeatured: false,
        isTrending: false,
      },
      {
        title: 'Banff Wildlife Safari',
        description: 'Spot bears, elk, wolves and eagles on a guided jeep safari through Banff National Park with an expert naturalist.',
        category: 'Safari',
        location: { city: 'Banff', country: 'Canada' },
        images: [],
        price: 180,
        duration: '1 day',
        difficulty: 'Easy',
        maxGroupSize: 10,
        includes: ['4x4 vehicle', 'Binoculars', 'Guide', 'Snacks'],
        hostName: 'Jen Park',
        hostVerified: true,
        rating: 4.8,
        reviewCount: 310,
        isFeatured: true,
        isTrending: false,
      },
    ];
    const created = await Experience.insertMany(demos);
    res.json({ success: true, message: `${created.length} experiences seeded`, count: created.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getExperiences, getExperience, createExperience, seedExperiences };