import express from "express";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const OTP_FILE = "otps.json";

// Load OTPs from file
function loadOTPs() {
  if (!fs.existsSync(OTP_FILE)) return {};
  return JSON.parse(fs.readFileSync(OTP_FILE));
}

// Save OTPs to file
function saveOTPs(data) {
  fs.writeFileSync(OTP_FILE, JSON.stringify(data));
}

// Cool 6-character OTP (letters + numbers)
function generateOTP() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let otp = "";
  for (let i = 0; i < 6; i++) {
    otp += chars[Math.floor(Math.random() * chars.length)];
  }
  return otp;
}

// Email sender config
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

// API — Send OTP
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  const otps = loadOTPs();
  const otp = generateOTP();
  otps[email] = otp;
  saveOTPs(otps);

  try {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Your Zoom Access OTP",
      text: `Your OTP is: ${otp}`,
    });

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: "Email sending failed" });
  }
});

// API — Verify OTP
app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  const otps = loadOTPs();

  if (otps[email] === otp) {
    delete otps[email]; // one-time use OTP
    saveOTPs(otps);

    // Send back your Zoom link
    return res.json({
      success: true,
      link: "https://zoom.us/your-actual-meeting-link",
    });
  }

  return res.json({ success: false, message: "Invalid OTP" });
});

// Start server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
