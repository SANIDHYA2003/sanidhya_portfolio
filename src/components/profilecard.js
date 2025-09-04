"use client"

import { useEffect, useRef } from "react"
import "./CSS/profilecard.css"
import MyPic from "./PIC.jpg";

const ProfileCard = ({
  name = "John Doe",
  title = "Developer",
  handle = "@johndoe",
  status = "Online",
  contactText = "Contact",
  avatarUrl = MyPic,
  showUserInfo = true,
  enableTilt = true,
  enableMobileTilt = false,
  onContactClick = () => {},
}) => {
  const cardRef = useRef(null)

  useEffect(() => {
    const card = cardRef.current
    if (!card || !enableTilt) return

    const handleMouseMove = (e) => {
      if (window.innerWidth <= 768 && !enableMobileTilt) return

      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const centerX = rect.width / 2
      const centerY = rect.height / 2

      const rotateX = (y - centerY) / 10
      const rotateY = (centerX - x) / 10

      const pointerX = (x / rect.width) * 100
      const pointerY = (y / rect.height) * 100

      const pointerFromCenter =
        Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)) /
        Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2))

      card.style.setProperty("--rotate-x", `${Math.max(-20, Math.min(20, rotateY))}deg`)
      card.style.setProperty("--rotate-y", `${Math.max(-20, Math.min(20, rotateX))}deg`)
      card.style.setProperty("--pointer-x", `${pointerX}%`)
      card.style.setProperty("--pointer-y", `${pointerY}%`)
      card.style.setProperty("--pointer-from-center", pointerFromCenter)
      card.style.setProperty("--pointer-from-top", y / rect.height)
      card.style.setProperty("--pointer-from-left", x / rect.width)
      card.style.setProperty("--background-x", `${pointerX}%`)
      card.style.setProperty("--background-y", `${pointerY}%`)
    }

    const handleMouseEnter = () => {
      card.classList.add("active")
    }

    const handleMouseLeave = () => {
      card.classList.remove("active")
      card.style.setProperty("--rotate-x", "0deg")
      card.style.setProperty("--rotate-y", "0deg")
    }

    card.addEventListener("mousemove", handleMouseMove)
    card.addEventListener("mouseenter", handleMouseEnter)
    card.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      card.removeEventListener("mousemove", handleMouseMove)
      card.removeEventListener("mouseenter", handleMouseEnter)
      card.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [enableTilt, enableMobileTilt])

  return (
    <div className="pc-card-wrapper" ref={cardRef}>
      <div className="pc-card">
        <div className="pc-inside"></div>
        <div className="pc-shine"></div>
        <div className="pc-glare"></div>

        <div className="pc-avatar-content">
          <img
            src={avatarUrl || "/placeholder.svg"}
            alt={name}
            className="avatar"
            onError={(e) => {
              e.target.src = "/placeholder.svg?height=400&width=300" // Updated fallback to use placeholder with better dimensions
            }}
          />
        </div>

        <div className="pc-content">
          <div className="pc-details">
            <h3>{name}</h3>
            <p>{title}</p>
          </div>
        </div>

        {showUserInfo && (
          <div className="pc-user-info">
            <div className="pc-user-details">
              <div className="pc-mini-avatar">
                <img
                  src={avatarUrl || "/placeholder.svg"}
                  alt={name}
                  onError={(e) => {
                    e.target.src = "/placeholder.svg?height=48&width=48" // Updated mini avatar fallback
                  }}
                />
              </div>
              <div className="pc-user-text">
                <div className="pc-handle">{handle}</div>
                <div className="pc-status">{status}</div>
              </div>
            </div>
            <button className="pc-contact-btn" onClick={onContactClick}>
              {contactText}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfileCard
