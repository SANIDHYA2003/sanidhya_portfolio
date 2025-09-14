// /api/cv.js
const connectDB = require("./lib/db");
const Cv = require("./models/Cv");

module.exports = async (req, res) => {
  await connectDB();

  if (req.method === "GET") {
    try {
      // Assuming you store only one CV document
      const cvDoc = await Cv.findOne();
      if (!cvDoc) {
        return res
          .status(404)
          .json({ error: "CV not found in the database" });
      }
      return res.status(200).json(cvDoc);
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ error: "Failed to fetch CV URL" });
    }
  }

  // Method Not Allowed
  res.setHeader("Allow", ["GET"]);
  return res
    .status(405)
    .json({ error: `Method ${req.method} Not Allowed` });
};