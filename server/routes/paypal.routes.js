// paypalRoutes.js
import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { encrypt } from '../utils/encrypt.js';
import { User } from "../models/user.model.js";
dotenv.config();

const router = express.Router();


async function savePayPalCredentials(userId, tokenData) {
  try {
    const expiryDate = new Date(Date.now() + tokenData.expires_in * 1000);

    // Encrypt the access and refresh tokens
    const encryptedAccessToken = encrypt(tokenData.access_token);
    const encryptedRefreshToken = encrypt(tokenData.refresh_token);
    

    // Save encrypted tokens to the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        paypal: {
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          tokenExpiry: expiryDate,
        },
      },
      { new: true }
    );

    return updatedUser;
  } catch (error) {
    console.error("Error saving encrypted PayPal credentials:", error);
    throw error;
  }
}


router.get('/callback', async (req, res) => {
  const { state, code } = req.query;

  // Step 1: Validate state param
  if (!state) {
    return res.status(400).send('Missing state parameter');
  }

  // Step 2: Parse state (userId + redirect)
  let userId, redirectUrl;
  try {
    const parsedState = JSON.parse(decodeURIComponent(state));
    userId = parsedState.userId;
    redirectUrl = parsedState.redirect;

  } catch (err) {
    console.error('Raw state:', state);
    return res.status(400).send('Invalid state parameter');
  }

  // Step 3: Validate code param
  if (!code) {
    return res.status(400).send('Missing authorization code');
  }

  try {
    const PAYPAL_BASE_URL = process.env.PAYPAL_API_URL;
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_SECRET;

    if (!PAYPAL_BASE_URL || !clientId || !clientSecret) {
      return res.status(500).send('Server misconfiguration');
    }

    const tokenResponse = await axios.post(
      `${PAYPAL_BASE_URL}/v1/oauth2/token`,
      `grant_type=authorization_code&code=${code}`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const tokenData = tokenResponse.data;

    // Step 4: Store PayPal tokens securely
    await savePayPalCredentials(userId, tokenData);

    // Step 5: Redirect back to frontend
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error('PayPal callback error:', {
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      message: error.message
    });
    return res.status(500).send('Connection failed');
  }
});

router.post('/disconnect', async (req, res) => {
  const { userId } = req.body;
  try {
    // e.g. remove the paypal field from user
    await User.findByIdAndUpdate(userId, { $unset: { paypal: "" } });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error disconnecting PayPal:", error);
    res.status(500).json({ success: false, message: "Failed to disconnect PayPal" });
  }
});



export default router;
