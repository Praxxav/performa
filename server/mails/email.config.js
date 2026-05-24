// email.config.js
import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID, // Your Client ID
  process.env.CLIENT_SECRET, // Your Client Secret
  'https://developers.google.com/oauthplayground' // Redirect URL
);

// Set OAuth2 credentials
oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

// Generate access token
const accessToken = async () => {
  try {
    const { token } = await oauth2Client.getAccessToken();
    return token;
  } catch (error) {
    console.error('Error generating access token:', error);
    throw error;
  }
};

// Nodemailer transporter
const createTransporter = async () => {
  const token = await accessToken();
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL, // Your Gmail address
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: token, // Get access token dynamically
    },
  });
};

export default createTransporter;
