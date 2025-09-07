const connectDB = require("./lib/db");
const Badge = require("./models/Badge");

module.exports = async (req, res) => {
  await connectDB();

  if (req.method === "GET") {
    try {
      const badges = await Badge.find();
      return res.status(200).json(badges);
    } catch (err) {
      return res.status(500).json({ error: "Failed to fetch badges" });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
};
