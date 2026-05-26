// email.config.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

// Nodemailer transporter using standard SMTP
const createTransporter = async () => {
  const port = parseInt(process.env.SMTP_PORT, 10);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: port,
    secure: port === 465, // MUST be false for port 587 (STARTTLS), true for 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

export default createTransporter;
