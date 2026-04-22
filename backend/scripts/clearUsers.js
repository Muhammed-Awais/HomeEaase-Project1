const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');

// Load env vars
dotenv.config();

const clearUsers = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('Clearing all users...');
    const result = await User.deleteMany({});
    console.log(`Successfully cleared ${result.deletedCount} users.`);

    // Close connection
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error clearing users:', error.message);
    process.exit(1);
  }
};

clearUsers();
