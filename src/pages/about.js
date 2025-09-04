import ProfileCard from "../components/profilecard"


function About() {
  return (
    <div className="section about-section" id="about">
      <h2 className="section-title">About Me</h2>
      <div className="about-container">
        <ProfileCard
          name="Sanidhya Sharma"
          title="Software Engineer"
          handle="javicodes"
          status="Online"
          
           // Updated to use the correct image path
          contactText="Contact Me"
          showUserInfo={false}
          enableTilt={true}
          enableMobileTilt={false}
          onContactClick={() => {
            document.getElementById("contact").scrollIntoView({ behavior: "smooth" })
          }}
        />

        <div className="about-text">
          <h3>Passionate Developer</h3>
          <p>
            I am a passionate full-stack developer with experience in building modern, responsive web applications. I
            love working with React, Node.js, and cloud technologies to create innovative solutions that make a
            difference.
          </p>
          <div className="skills-grid">
            <div className="skill-item">React</div>
            <div className="skill-item">Node.js</div>
            <div className="skill-item">JavaScript</div>
            <div className="skill-item">Python</div>
            <div className="skill-item">AWS</div>
            <div className="skill-item">MongoDB</div>
          </div>
        </div>
      </div>
     
    </div>
    
  )
}

export default About
