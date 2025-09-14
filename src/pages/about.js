import React, { useEffect, useState } from "react";
import ProfileCard from "../components/profilecard";

function About() {
  const [cvUrl, setCvUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetch("/api/cv")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch CV");
        return res.json();
      })
      .then((data) => {
        setCvUrl(data.cvUrl);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching CV:", err);
        setError("Could not load CV");
        setLoading(false);
      });
  }, []);

  const handlePreviewClick = () => {
    setShowPreview(true);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = cvUrl;
    link.download = "Sanidhya_Sharma_CV.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="section about-section" id="about">
      <h2 className="section-title">About Me</h2>
      <div className="about-container">
        <ProfileCard
          name="Sanidhya Sharma"
          title="Software Engineer"
          handle="javicodes"
          status="Online"
          contactText="Contact Me"
          showUserInfo={false}
          enableTilt={true}
          enableMobileTilt={false}
          onContactClick={() => {
            document
              .getElementById("contact")
              .scrollIntoView({ behavior: "smooth" });
          }}
        />

        <div className="about-text">
          <h3>Passionate Developer</h3>
          <p>
            I am a passionate full-stack developer with experience in building
            modern, responsive web applications. I love working with React,
            Node.js, and cloud technologies to create innovative solutions that
            make a difference.
          </p>

          <div className="skills-grid">
            <div className="skill-item">React</div>
            <div className="skill-item">Node.js</div>
            <div className="skill-item">JavaScript</div>
            <div className="skill-item">Python</div>
            <div className="skill-item">AWS</div>
            <div className="skill-item">MongoDB</div>
          </div>

          {loading && <p>Loading CV…</p>}
          {error && <p className="error-text">{error}</p>}

          {!loading && !error && !showPreview && (
            <button
              className="preview-cv-button"
              onClick={handlePreviewClick}
            >
              View My CV
            </button>
          )}

          {showPreview && (
            <div className="cv-preview-container">
              <iframe
                src={cvUrl}
                title="CV Preview"
                width="100%"
                height="600px"
                style={{
                  border: "1px solid #ccc",
                  marginTop: "20px",
                  borderRadius: "8px",
                }}
              ></iframe>
              <button
                className="download-cv-button"
                onClick={handleDownload}
                style={{
                  marginTop: "12px",
                  padding: "10px 18px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Download CV
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default About;