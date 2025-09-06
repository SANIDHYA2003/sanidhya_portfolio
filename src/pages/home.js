import React, { useEffect, useContext } from "react";
import { ThemeContext } from "../context/themecontext";
import { Typewriter } from "react-simple-typewriter";
import Game from "../components/Game";

function Home() {
  const { Theme } = useContext(ThemeContext);

  useEffect(() => {
    console.log("current theme ", Theme);
  }, [Theme]);

  return (
    <div
      className={`section home-section ${Theme === "dark" ? "dark-theme" : ""}`}
      id="home"
    >
      <div className="floating" style={{ textAlign: "center" }}>
        {/* 🌟 Main Title */}
        <h1
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            fontWeight: "800",
            background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "1.2rem",
            letterSpacing: "1px",
          }}
        >
          Welcome to My Portfolio
        </h1>

        {/* ✨ Catchy Welcome Message */}
        <p
          style={{
            color: Theme === "dark" ? "#00e0ff" : "#1e3a8a",
            fontSize: "1.4rem",
            fontWeight: "600",
            marginBottom: "1.5rem",
            textShadow: Theme === "dark" ? "0 0 12px rgba(0,224,255,0.6)" : "none",
          }}
        >
          ⚡ Powering Ideas with Code & Creativity ⚡
        </p>

        {/* 🔄 Rotating Roles */}
        <h2
          style={{
            color: "white",
            fontSize: "1.6rem",
            fontWeight: "500",
            marginBottom: "2rem",
          }}
        >
          <Typewriter
            words={[
              "Full Stack Developer 💻",
              "AI & ML Enthusiast 🤖",
              "Creative Problem Solver 🧩",
              "Cybersecurity Explorer 🔐",
              "Your Next Teammate 🚀",
            ]}
            loop={0}
            cursor
            cursorStyle="|"
            typeSpeed={70}
            deleteSpeed={50}
            delaySpeed={1500}
          />
        </h2>

        {/* 🎮 Mini Game */}
        <Game />
      </div>
    </div>
  );
}

export default Home;
