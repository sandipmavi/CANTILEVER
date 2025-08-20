const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // For WebContainer environment, we'll use a mock connection
    // In production, this would connect to actual MongoDB
    console.log('📦 Database connection simulated for WebContainer environment');
    console.log('🔗 In production, this would connect to:', process.env.MONGODB_URI);
    
    // Simulate successful connection
    return Promise.resolve();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;