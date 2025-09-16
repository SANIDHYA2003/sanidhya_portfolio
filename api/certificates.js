const connectDB = require("./lib/db");
const Certificate = require("./models/Certificate");

module.exports = async (req, res) => {
  await connectDB();

  if (req.method === "GET") {
    try {
      const certs = await Certificate.find().sort({ dateIssued: -1 });

      return res.status(200).json(certs);
    } catch (err) {
      return res.status(500).json({ error: "Server Error" });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
};
