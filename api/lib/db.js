// api/lib/db.js
const mongoose = require("mongoose");
require("dotenv").config();

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("❌ Missing MONGO_URI in .env");

    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
    }).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;
