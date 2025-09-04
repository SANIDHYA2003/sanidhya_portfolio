"use client"

import { createContext, useState, useEffect } from "react"

export const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const [Theme, setTheme] = useState("light")

  const themeToggleButton = () => {
    const newTheme = Theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    // Apply theme to body class for global styling
    document.body.className = newTheme === "dark" ? "dark-theme" : ""
  }

  useEffect(() => {
    // Apply initial theme
    document.body.className = Theme === "dark" ? "dark-theme" : ""
  }, [Theme])

  return <ThemeContext.Provider value={{ Theme, themeToggleButton }}>{children}</ThemeContext.Provider>
}
