const mongoose = require("mongoose");

const BadgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  imageUrl: { type: String, required: true },
});

module.exports = mongoose.models.Badge || mongoose.model("Badge", BadgeSchema, "badges");
