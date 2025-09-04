const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  // The title of the project. This is a required field.
  title: { 
    type: String, 
    required: true 
  },
  // A brief description of the project.
  description: { 
    type: String, 
  },
  // The current status of the project (e.g., "In Progress", "Completed").
  status: {
    type: String,
    enum: ["In Progress", "Completed", "On Hold", "Planned"],
    default: "In Progress",
  },
  // The start date of the project.
  startDate: { 
    type: Date 
  },
  // The end date of the project.
  endDate: { 
    type: Date 
  },
  // An array of strings to list the technologies or skills used.
  technologies: [
    { 
      type: String 
    }
  ],
  // A URL to a live demo or deployed version of the project.
  projectUrl: { 
    type: String 
  },
  // A URL to the project's source code repository (e.g., GitHub).
  githubUrl: { 
    type: String 
  },
});

module.exports = mongoose.models.Project || mongoose.model("Project", ProjectSchema, "Projects");
