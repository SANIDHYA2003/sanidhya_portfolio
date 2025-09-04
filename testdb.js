const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected!");
  } catch (err) {
    console.error("❌ DB connect error:", err);
  }
}

test();
