const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Property = require('../models/Property');

// Load env vars
dotenv.config();

const clearProperties = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('Clearing all properties...');
    const result = await Property.deleteMany({});
    console.log(`Successfully cleared ${result.deletedCount} properties.`);

    // Close connection
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error clearing properties:', error.message);
    process.exit(1);
  }
};

clearProperties();
