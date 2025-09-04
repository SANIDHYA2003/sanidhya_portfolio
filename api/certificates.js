// api/certificates.js
const connectDB = require("./lib/db");
const Certificate = require("./models/Certificate");

module.exports = async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    try {
      const certs = await Certificate.find();
      return res.status(200).json(certs);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Server Error" });
    }
  }

  // Optional: handle POST if you want to add certificates
  if (req.method === "POST") {
    try {
      const cert = await Certificate.create(req.body);
      return res.status(201).json(cert);
    } catch (err) {
      console.error(err);
      return res.status(400).json({ error: "Invalid Data" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
};
