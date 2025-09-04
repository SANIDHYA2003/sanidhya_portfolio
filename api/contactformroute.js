const express = require("express")
const nodemailer = require("nodemailer")
const validator = require("validator")

const router = express.Router()

router.post("/", async (req, res) => {
  let { name, email, message, honeypot } = req.body

  // 🛡️ Honeypot check (bots usually fill this hidden field)
  if (honeypot && honeypot.trim() !== "") {
    return res.status(400).json({ error: "Spam detected" })
  }

  // 🛡️ Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" })
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "Invalid email address" })
  }

  // 🧹 Sanitize inputs
  name = validator.escape(name)
  message = validator.escape(message)

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS, // 16-char App Password
      },
    })

    await transporter.sendMail({
      from: process.env.MAIL_USER, // must match Gmail account
      to: process.env.MY_EMAIL,
      subject: `📩 New Contact Form Message from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
      replyTo: email, // lets you hit "Reply" directly to sender
    })

    res.json({ success: true, message: "Message sent!" })
  } catch (error) {
    console.error("Email error:", error)
    res.status(500).json({ error: "Failed to send email" })
  }
})

module.exports = router
