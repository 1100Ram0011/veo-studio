require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/veo-studio';

mongoose.connect(MONGO_URI).then(async () => {
    console.log('Connected to MongoDB');

    const email = 'demo@gmail.com';
    const password = 'password123';

    // Drop index to be safe
    try { await User.collection.dropIndex('username_1'); } catch(e) {}

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Delete existing demo user if exists
    await User.deleteOne({ email });

    const user = new User({
      id: `u_${Date.now()}_demo`,
      name: 'Demo Tester',
      email: email,
      password: hashedPassword,
      credits: 100,
      plan: 'Pro',
      isUnlimited: false
    });

    await user.save();
    console.log('Successfully created demo user!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Credits: 100');
    
    mongoose.disconnect();
}).catch(console.error);
