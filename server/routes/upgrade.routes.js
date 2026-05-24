import express from 'express';
import axios from 'axios';
import dotenv from "dotenv";
import { User } from "../models/user.model.js";
import { verifyToken } from '../middleware/verifyToken.js';

dotenv.config();

const router = express.Router();

// Payment checkout route
router.post('/flutterwave-checkout', async (req, res) => {
  const { email, name } = req.body;

  // Basic check to prevent unauthorized access
  if (!email || !name) {
    return res.status(400).json({ error: 'Unauthorized: Email and name required' });
  }

  try {
    const response = await axios.post(
      'https://api.flutterwave.com/v3/payments',
      {
        tx_ref: `pro-upgrade-${Date.now()}`,
        amount: 108,
        currency: 'USD',
        payment_options: 'card, banktransfer, ussd',
        redirect_url: `${process.env.FRONTEND_URL}/payment-status`,
        customer: {
          email,
          name,
        },
        customizations: {
          title: 'Pro Plan Upgrade',
          description: 'Upgrade to Pro Plan - Annual Billing',
          logo: 'https://proforma-gen.vercel.app/assets/P-removebg-preview-C6YmBhki.png',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        },
      }
    );

    return res.status(200).json({ paymentLink: response.data.data.link });
  } catch (err) {
    console.error('Flutterwave error:', err.response?.data || err.message);
    return res.status(500).json({ error: 'Payment initialization failed' });
  }
});



// Verify payment route
router.post('/verify-payment', verifyToken, async (req, res) => {
  const { transactionId } = req.body;

  if (!transactionId) {
    return res.status(400).json({ error: 'Transaction ID is required' });
  }

  try {
    const verifyResponse = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        },
      }
    );

    const paymentData = verifyResponse.data.data;

    if (
      paymentData.status === 'successful' &&
      paymentData.amount === 108 &&
      paymentData.currency === 'USD'
    ) {
      // Update the logged-in user's tier to "pro"
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { tier: 'pro' },
        { new: true }
      );

      return res.status(200).json({ status: 'success', user: updatedUser });
    } else {
      return res.status(400).json({ status: 'failed', error: 'Payment not successful' });
    }
  } catch (err) {
    console.error('Verification error:', err.response?.data || err.message);
    return res.status(500).json({ error: 'Verification failed' });
  }
});

export default router;
