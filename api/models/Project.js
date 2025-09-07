const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  imageUrl: { type: String },
  description: { type: String },
  technologies: [{ type: String }],
  liveUrl: { type: String },   // ✅ match frontend
  githubUrl: { type: String },
});
