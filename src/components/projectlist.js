import React, { useState, useEffect } from 'react';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/project');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProjects(data);
      } catch (e) {
        setError("Failed to fetch projects. Please check the API server.");
        console.error("Fetching projects failed:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg text-white">
        Loading projects...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-400 text-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="projects-container">
      <h2 className="section-title">Project Portfolio</h2>
      <div className="projects-grid">
        {projects.length > 0 ? (
          projects.map((project) => (
            <div key={project._id} className="project-card">
              {project.liveUrl && project.liveUrl !== "#" && project.liveUrl !== "" && (
                <div className="live-tag">
                  <span className="live-indicator"></span>
                  Live
                </div>
              )}
              {/* Using optional chaining to safely access nested properties */}
              
              <div className="project-content">
                <h3 className="project-title">{project.title}</h3>
                <p className="project-description">{project.description}</p>
                <div className="tech-tags">
                  {project.technologies.map((tech, index) => (
                    <span key={index} className="tech-tag">
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="project-links">
                  {project.liveUrl && project.liveUrl !== "#" && project.liveUrl !== "" && (
                    <a href={project.liveUrl} className="view-btn" target="_blank" rel="noopener noreferrer">
                      View Live
                    </a>
                  )}
                  <a href={project.githubUrl} className="view-btn secondary" target="_blank" rel="noopener noreferrer">
                    GitHub
                  </a>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400">No projects found.</p>
        )}
      </div>
    </div>
  );
};

export default ProjectList;
