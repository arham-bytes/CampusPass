const mongoose = require('mongoose');

const connectDB = async (retries = 3) => {
  for (let i = 1; i <= retries; i++) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`❌ MongoDB Connection Attempt ${i}/${retries} Failed: ${error.message}`);
      if (i === retries) {
        console.error('💀 All connection attempts failed. Exiting...');
        process.exit(1);
      }
      console.log(`⏳ Retrying in 5 seconds...`);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
};

module.exports = connectDB;
