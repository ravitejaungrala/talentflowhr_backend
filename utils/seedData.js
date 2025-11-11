const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Skill = require('../models/Skill');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillsync-pro');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Skill.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@skillsync.com',
      password: adminPassword,
      role: 'admin',
      department: 'Operations',
      position: 'System Administrator'
    });
    await adminUser.save();
    console.log('Admin user created');

    // Create sample skills
    const skills = [
      {
        name: 'JavaScript',
        category: 'Technical',
        description: 'Programming language for web development',
        difficulty: 'Intermediate',
        createdBy: adminUser._id
      },
      {
        name: 'React',
        category: 'Technical',
        description: 'JavaScript library for building user interfaces',
        difficulty: 'Intermediate',
        createdBy: adminUser._id
      },
      {
        name: 'Node.js',
        category: 'Technical',
        description: 'JavaScript runtime for server-side development',
        difficulty: 'Intermediate',
        createdBy: adminUser._id
      },
      {
        name: 'Communication',
        category: 'Soft Skills',
        description: 'Ability to convey information effectively',
        difficulty: 'Beginner',
        createdBy: adminUser._id
      },
      {
        name: 'Leadership',
        category: 'Leadership',
        description: 'Ability to guide and influence others',
        difficulty: 'Advanced',
        createdBy: adminUser._id
      }
    ];

    await Skill.insertMany(skills);
    console.log('Sample skills created');

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();