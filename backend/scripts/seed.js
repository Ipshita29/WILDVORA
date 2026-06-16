const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Experience = require('../models/Experience');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Payout = require('../models/Payout');
const Notification = require('../models/Notification');

dotenv.config();

const seed = async () => {
  try {
    const mongoUri = process.env.mongo_uri || 'mongodb://localhost:27017/wildvora';
    console.log('Connecting to MongoDB at:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB. Purging existing collections...');

    await User.deleteMany({});
    await Experience.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});
    await Payout.deleteMany({});
    await Notification.deleteMany({});

    console.log('Creating users...');
    const customerUser = await User.create({
      name: 'Rahul Customer',
      email: 'customer@wildvora.com',
      password: 'password',
      phone: '9876543210',
      role: 'customer',
      isActive: true,
    });

    const guestUser = await User.create({
      name: 'Pooja Guest',
      email: 'guest@wildvora.com',
      password: 'password',
      phone: '9876543211',
      role: 'customer',
      isActive: true,
    });

    const operatorUser = await User.create({
      name: 'Amit Operator',
      email: 'operator@wildvora.com',
      password: 'password',
      phone: '9988776655',
      role: 'operator',
      kyc: 'approved',
      payoutStatus: 'verified',
      isActive: true,
      bankAccount: {
        holderName: 'Amit Kumar',
        accountNumber: '501004392810',
        bankName: 'HDFC Bank',
        ifscCode: 'HDFC0000124',
      },
    });

    const pendingOperatorUser = await User.create({
      name: 'Sumit Host',
      email: 'host2@wildvora.com',
      password: 'password',
      phone: '9988776644',
      role: 'operator',
      kyc: 'pending',
      payoutStatus: 'pending',
      isActive: true,
    });

    const adminUser = await User.create({
      name: 'Aditya Admin',
      email: 'admin@wildvora.com',
      password: 'password',
      phone: '9000000000',
      role: 'admin',
      isActive: true,
    });

    console.log('Creating experiences...');
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    const demos = [
      {
        title: 'Glacier Peak Expedition',
        description: 'Embark on a soul-stirring journey into the heart of the Cascades. This 7-day expedition is an immersion into the wild silence of high altitudes.',
        category: 'Trekking',
        location: { city: 'Cascades', country: 'USA' },
        images: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'],
        price: 240,
        duration: '7 days',
        difficulty: 'Hard',
        maxGroupSize: 12,
        includes: ['All meals', 'Gear', 'Guide'],
        host: operatorUser._id,
        hostName: operatorUser.name,
        hostVerified: true,
        rating: 4.9,
        reviewCount: 1,
        isFeatured: true,
        isTrending: true,
        status: 'live',
        availableDates: [todayStr, tomorrowStr, nextWeekStr],
      },
      {
        title: 'Sunrise Peak Trek & Camping',
        description: 'A beautiful 2-day trek through pine forests and alpine meadows with overnight camping at 3,200m.',
        category: 'Camping',
        location: { city: 'Cascades', country: 'USA' },
        images: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80'],
        price: 120,
        duration: '2 days',
        difficulty: 'Moderate',
        maxGroupSize: 8,
        includes: ['Camping gear', 'Breakfast', 'Guide'],
        host: operatorUser._id,
        hostName: operatorUser.name,
        hostVerified: true,
        rating: 4.0,
        reviewCount: 1,
        isFeatured: true,
        isTrending: false,
        status: 'live',
        availableDates: [todayStr, tomorrowStr],
      },
      {
        title: 'Iceland Blue Kayaking',
        description: 'Paddle through icy glacial waters and sea caves along Iceland\'s dramatic coastline.',
        category: 'Water Sports',
        location: { city: 'Reykjavik', country: 'Iceland' },
        images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'],
        price: 450,
        duration: '1 day',
        difficulty: 'Easy',
        maxGroupSize: 10,
        includes: ['Kayak', 'Wetsuit', 'Instructor', 'Lunch'],
        host: operatorUser._id,
        hostName: operatorUser.name,
        hostVerified: true,
        rating: 0,
        reviewCount: 0,
        isFeatured: false,
        isTrending: false,
        status: 'pending',
        availableDates: [todayStr],
      },
    ];

    const createdExperiences = await Experience.insertMany(demos);
    console.log('Seeded experiences.');

    console.log('Creating bookings...');
    const exp1 = createdExperiences[0];
    const exp2 = createdExperiences[1];

    const startOfPast = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
    const pastStr = startOfPast.toISOString().split('T')[0];

    const bookingCompleted = await Booking.create({
      user: customerUser._id,
      experience: exp1._id,
      startDate: pastStr,
      endDate: pastStr,
      adults: 1,
      children: 0,
      totalPrice: 240,
      status: 'completed',
      paymentMethod: 'card',
      paymentStatus: 'paid',
      settled: true,
    });

    const bookingConfirmed = await Booking.create({
      user: customerUser._id,
      experience: exp1._id,
      startDate: todayStr,
      endDate: todayStr,
      adults: 2,
      children: 0,
      totalPrice: 480,
      status: 'confirmed',
      paymentMethod: 'card',
      paymentStatus: 'paid',
      settled: false,
    });

    const bookingDisputed = await Booking.create({
      user: guestUser._id,
      experience: exp2._id,
      startDate: tomorrowStr,
      endDate: tomorrowStr,
      adults: 1,
      children: 0,
      totalPrice: 120,
      status: 'confirmed',
      paymentMethod: 'card',
      paymentStatus: 'paid',
      settled: false,
      disputed: true,
      disputeReason: 'Host refused to include safety helmets.',
    });

    console.log('Seeded bookings.');

    console.log('Creating reviews...');
    await Review.create({
      user: customerUser._id,
      experience: exp1._id,
      booking: bookingCompleted._id,
      rating: 5,
      comment: 'Superb glacier expedition! The host Amit was highly professional and knowledgable.',
      userName: customerUser.name,
      hostReply: 'Thank you Rahul! It was a pleasure hosting you.',
    });

    console.log('Creating payouts...');
    await Payout.create({
      operator: operatorUser._id,
      booking: bookingCompleted._id,
      amount: 240,
      status: 'processed',
      transactionId: 'TXN-DEMO58392019',
      releasedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    });

    console.log('Creating notifications...');
    await Notification.create({
      recipient: operatorUser._id,
      type: 'booking',
      title: `New booking! – "${exp1.title}"`,
      desc: `${customerUser.name} booked 2 spots.`,
      referenceId: bookingConfirmed._id,
      badges: [{ text: 'Booking', color: 'bg-emerald-50 text-emerald-600 border border-emerald-100' }],
    });

    await Notification.create({
      recipient: adminUser._id,
      type: 'listing',
      title: `Listing Approval Required – "${createdExperiences[2].title}"`,
      desc: `${operatorUser.name} submitted a new listing for review.`,
      referenceId: createdExperiences[2]._id,
      badges: [{ text: 'Review', color: 'bg-amber-50 text-amber-600 border border-amber-100' }],
    });

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
