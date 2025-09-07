const connectDB = require("./lib/db");
const Project = require("./models/Project");

module.exports = async (req, res) => {
  await connectDB();

  if (req.method === "GET") {
    try {
      const projects = await Project.find();
      return res.status(200).json(projects);
    } catch (err) {
      return res.status(500).json({ error: "Server Error" });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
};
