// projectcard.js
function Projectcard({ title, description, link, technologies = [], image }) {
  const isLive = Boolean(link);

  return (
    <div className="project-card">
      <div className="project-image-wrapper">
        {isLive && <span className="live-badge">LIVE</span>}
        {image && <img src={image} alt={title} className="project-image" />}
      </div>

      <h3 className="project-title">{title}</h3>
      <p className="project-description">{description}</p>

      {technologies.length > 0 && (
        <div className="tech-tags">
          {technologies.map((tech, index) => (
            <span key={index} className="tech-tag">{tech}</span>
          ))}
        </div>
      )}

      {isLive && (
        <a href={link} target="_blank" rel="noopener noreferrer" className="view-btn">
          View Project
        </a>
      )}
    </div>
  )
}

export default Projectcard;
