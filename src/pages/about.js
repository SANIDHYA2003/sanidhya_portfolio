// src/pages/About.js
import React, { useEffect, useState } from "react";
import ProfileCard from "../components/profilecard";

function About() {
  const [cvUrl, setCvUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const handleDownload = () => {
    if (cvUrl) {
      window.open(cvUrl, "_blank");
    }
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
          {!loading && !error && (
            <button
              className="download-cv-button"
              onClick={handleDownload}
            >
              Download My CV
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default About;