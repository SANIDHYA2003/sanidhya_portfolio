"use client"

import { useState } from "react"

function ContactMe() {
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !email || !message) {
      alert("Please fill in all fields.")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      })

      const data = await res.json()

      if (res.ok) {
        alert(`✅ Thank you ${name}! Your message has been sent.`)
        setName("")
        setEmail("")
        setMessage("")
      } else {
        alert(`❌ Error: ${data.error}`)
      }
    } catch (err) {
      console.error(err)
      alert("❌ Failed to send. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="section" id="contact">
      <h2 className="section-title">Contact Me</h2>
<form onSubmit={handleSubmit} className="contact-form">
  <input
    type="text"
    value={name}
    onChange={(e) => setName(e.target.value)}
    placeholder="Your Name"
    className="form-input"
    required
  />

  <input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="Your Email"
    className="form-input"
    required
  />

  <textarea
    value={message}
    onChange={(e) => setMessage(e.target.value)}
    placeholder="Your Message"
    className="form-textarea"
    required
  />

  {/* 🛡️ Honeypot (hidden field) */}
  <input
    type="text"
    name="honeypot"
    style={{ display: "none" }}
    tabIndex="-1"
    autoComplete="off"
  />

  <button type="submit" className="submit-btn" disabled={loading}>
    {loading ? "Sending..." : "Send Message"}
  </button>
</form>
    </div>
  )
}

export default ContactMe
