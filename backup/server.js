// api/certificates.js
const express = require("express");
const connectDB = require("./lib/db");
const Certificate = require("./models/Certificate");
const Project = require("./models/Project");
const Badge = require("./models/Badge");
const contactRoutes = require("./contactformroute")
const rateLimit = require("express-rate-limit")

require("dotenv").config();

const app = express();
app.set("trust proxy", 1)
app.use(express.json());

// Connect DB once
connectDB().then(() => console.log("✅ MongoDB Connected"));


// Limit each IP to 5 requests per 15 minutes
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: "Too many requests, please try again later." },
})

// Route
app.get("/api/certificates", async (req, res) => {
  try {
    const certs = await Certificate.find();
    res.json(certs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});



// Get all badges
app.get("/api/badges", async (req, res) => {
  try {
    const badges = await Badge.find();
    res.json(badges);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch badges" });
  }
});


// Route to get all projects
app.get("/api/projects", async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

app.use("/api/contact", contactLimiter, contactRoutes)

// Start server only when running locally
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
}

module.exports = app;
