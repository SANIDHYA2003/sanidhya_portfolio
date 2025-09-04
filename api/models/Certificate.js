// api/models/Certificate.js
const mongoose = require("mongoose");

const CertificateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  issuer: { type: String, required: true },
  dateIssued: { type: Date, required: true },
  imageUrl: { type: String },
  certificateUrl: { type: String },
  code: { type: String },
});

module.exports = mongoose.models.Certificate || mongoose.model("Certificate", CertificateSchema, "certificate");
