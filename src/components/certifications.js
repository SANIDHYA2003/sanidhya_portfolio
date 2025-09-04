// certifications.js
import React from "react";

function Certificates({ title, description, link, image, code }) {
  return (
    <div className="certificate-card">
      {image && <img src={image} alt={title} className="certificate-image" />}
      <h3 className="certificate-title">{title}</h3>
      <p className="certificate-description">{description}</p>
      {code && <p className="certificate-code">Code: {code}</p>}

      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="certificate-link"
        >
          View Certificate
        </a>
      )}
    </div>
  )
}

export default Certificates;
