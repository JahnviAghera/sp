require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Room = require('./src/models/Room');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Seeding database...');

    // Clear existing
    await User.deleteMany({});
    await Room.deleteMany({});

    // Create users
    const users = await User.insertMany([
      { name: 'Admin', email: 'admin@speakspace.com', role: 'admin' },
      { name: 'Alice', email: 'alice@example.com', role: 'user', skills: ['UI Design'] },
      { name: 'Bob', email: 'bob@example.com', role: 'user', skills: ['Node.js'] }
    ]);

    // Create a public room
    await Room.create({
      title: 'General Practice',
      code: 'GENPRAC',
      moderator: users[0]._id,
      isPrivate: false
    });

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed', err);
    process.exit(1);
  }
};

seedData();
