import React from 'react';
import './App.css';

import { ThemeProvider } from './context/themecontext';
import Home from './pages/home';
import About from './pages/about';
import ProjectList from './components/projectlist';
import CertificateList from './components/certificationlist';
import ContactMe from './components/contactform';
import GooeyNav from './components/header'
import Badges from "./components/Badges";
import { useState, useEffect } from "react"
function App() {
  const [activeSection, setActiveSection] = useState("home")
  const [isPlaying, setIsPlaying] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  const navItems = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Projects", href: "#projects" },
    { label: "Certificates", href: "#certificates" },
    { label: "Contact", href: "#contact" },
  ]

  useEffect(() => {
    // Track active section on scroll
    const handleScroll = () => {
      const sections = ["home", "about", "projects", "certificates", "contact"]
      const scrollPosition = window.scrollY + 100

      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY
      const progress = (scrollTop / (documentHeight - windowHeight)) * 100
      setScrollProgress(Math.min(100, Math.max(0, progress)))

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const offsetTop = element.offsetTop
          const offsetHeight = element.offsetHeight

          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Initial call

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }

  return (
    <ThemeProvider>
      <div className="app">
        <div className="scroll-progress-container">
          <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }}></div>
        </div>

        <div className="gooey-nav-wrapper">
          <GooeyNav
            items={navItems}
            particleCount={15}
            particleDistances={[90, 10]}
            particleR={100}
            initialActiveIndex={0}
            animationTime={600}
            timeVariance={300}
            colors={[1, 2, 3, 1, 2, 3, 1, 4]}
          />
        </div>

        <nav className="floating-nav">
          {["home", "about", "projects", "certificates", "contact"].map((section) => (
            <button
              key={section}
              onClick={() => scrollToSection(section)}
              className={`nav-dot ${activeSection === section ? "active" : ""}`}
              title={section.charAt(0).toUpperCase() + section.slice(1)}
            />
          ))}
        </nav>

        <button
          className="music-toggle"
          onClick={() => setIsPlaying(!isPlaying)}
          title={isPlaying ? "Pause Music" : "Play Music"}
        >
          {isPlaying ? "⏸️" : "▶️"}
        </button>

        <div id="home" className="section-wrapper">
          <Home />
        </div>
        <div id="about" className="section-wrapper">
          <About />
        </div>
        <div>
          <Badges/>
        </div>
        <div id="projects" className="section-wrapper">
          <ProjectList />
        </div>
        <div id="certificates" className="section-wrapper">
          <CertificateList />
        </div>
        <div id="contact" className="section-wrapper">
          <ContactMe />
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App