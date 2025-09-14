// /api/models/Cv.js
const mongoose = require("mongoose");

const CvSchema = new mongoose.Schema({
  cvUrl: { type: String, required: true },
});

module.exports =
  mongoose.models.Cv || mongoose.model("Cv", CvSchema, "cv");