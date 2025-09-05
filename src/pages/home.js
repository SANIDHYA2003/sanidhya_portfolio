import React, { useEffect, useContext } from "react";
import { ThemeContext } from "../context/themecontext";
import { Typewriter } from "react-simple-typewriter";
import Game from "../components/Game";

function Home() {
  const { Theme, themeToggleButton } = useContext(ThemeContext);

  useEffect(() => {
    console.log("current theme ", Theme);
  }, [Theme]);

  return (
    <div
      className={`section home-section ${Theme === "dark" ? "dark-theme" : ""}`}
      id="home"
    >
      <div className="floating" style={{ textAlign: "center" }}>
        <h1 className="home-title" style={{ marginBottom: "1rem" }}>
          Welcome to My Portfolio
        </h1>

        <h2 style={{ color: "white", fontSize: "1.5rem", marginBottom: "2rem" }}>
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

        <button className="theme-toggle" onClick={themeToggleButton}>
          {Theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {/* 🎮 Mini Game */}
      <Game />
    </div>
  );
}

export default Home;
