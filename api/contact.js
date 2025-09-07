

const nodemailer = require("nodemailer");
const validator = require("validator");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  let { name, email, message, honeypot } = req.body;

  // 🛡️ Honeypot check
  if (honeypot && honeypot.trim() !== "") {
    return res.status(400).json({ error: "Spam detected" });
  }

  // 🛡️ Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  // 🧹 Sanitize inputs
  name = validator.escape(name);
  message = validator.escape(message);

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS, // Gmail App Password
      },
    });

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: process.env.MY_EMAIL,
      subject: `📩 New Contact Form Message from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
      replyTo: email,
    });

    return res.status(200).json({ success: true, message: "Message sent!" });
  } catch (error) {
    console.error("Email error:", error);
    return res.status(500).json({ error: "Failed to send email" });
  }
};
