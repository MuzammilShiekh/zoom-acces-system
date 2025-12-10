import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import nodemailer from "nodemailer";
import { createClient } from "redis";

const app = express();
app.use(bodyParser.json());
app.use(cors());

// ------------------------
// CONFIG
// ------------------------

let currentZoomLink = "https://zoom.us/j/123456789"; // default, teacher can change

// Redis client
const redis = createClient({
  url: process.env.REDIS_URL
});
redis.connect();

// Gmail email sender
const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS
  }
});

// Cool OTP generator (letters + numbers)
function generateOTP() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ------------------------
// API
// ------------------------

// SEND OTP
app.post("/send-code", async (req, res) => {
  const email = req.body.email;
  if (!email) return res.json({ ok: false });

  const code = generateOTP();

  await redis.set(`code:${email}`, code, { EX: 600 });

  await mailer.sendMail({
    to: email,
    subject: "Your Class Verification Code",
    text: `Your one-time code: ${code}`
  });

  res.json({ ok: true });
});

// VERIFY OTP
app.post("/verify-code", async (req, res) => {
  const { email, code } = req.body;

  const saved = await redis.get(`code:${email}`);

  if (!saved) return res.json({ ok: false, error: "expired" });
  if (saved !== code) return res.json({ ok: false, error: "wrong" });

  await redis.del(`code:${email}`);

  res.json({ ok: true, zoom: currentZoomLink });
});

// SET ZOOM LINK (Admin)
app.post("/set-zoom", async (req, res) => {
  const { zoom } = req.body;
  if (!zoom) return res.json({ ok: false });
  currentZoomLink = zoom;
  res.json({ ok: true });
});

// ------------------------
app.listen(10000, () => console.log("Server running"));
