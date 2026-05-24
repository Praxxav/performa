import express from 'express';
import axios from 'axios';
import Invoice from '../models/invoice.model.js';
import dotenv from 'dotenv';
const router = express.Router();

dotenv.config();


// Successful Payment Handler
router.get('/success', async (req, res) => {
  try {
    const { token, invoiceId } = req.query;
    
    // 1. Verify payment with PayPal
    const paymentDetails = await validatePayPalPayment(token);
    
    // 2. Update invoice
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      {
        status: 'paid',
        paymentId: token,
        payerId: paymentDetails.payer?.payer_id,
        paidAt: new Date(),
        paymentMethod: 'paypal'
      },
      { new: true }
    );

    // 3. Redirect to frontend
    res.redirect(`${process.env.FRONTEND_URL}/payment-success`);
    
  } catch (error) {
    console.error('Payment Error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/payment-error`);
  }
});

// Cancellation Handler
router.get('/cancel', async (req, res) => {
  const { invoiceId } = req.query;
  await Invoice.findByIdAndUpdate(invoiceId, { status: 'cancelled' });
  res.redirect(`${process.env.FRONTEND_URL}/payment-cancelled?invoice=${invoiceId}`);
});

async function validatePayPalPayment(token) {
    try {
      // 1. Get merchant access token
      const auth = Buffer.from(
        `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
      ).toString('base64');
  
      const tokenResponse = await axios.post(
        `${process.env.PAYPAL_API_URL}/v1/oauth2/token`,
        new URLSearchParams({ grant_type: 'client_credentials' }),
        { headers: { Authorization: `Basic ${auth}` } }
      );
  
      const accessToken = tokenResponse.data.access_token;
  
      // 2. FIRST GET ORDER DETAILS
      const orderDetails = await axios.get(
        `${process.env.PAYPAL_API_URL}/v2/checkout/orders/${token}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
  
      // 3. Check order status
      const status = orderDetails.data.status;
      
      if (status === 'COMPLETED') {
        return orderDetails.data; // Already captured
      }
  
      if (status !== 'APPROVED') {
        throw new Error(`Order status ${status} - cannot capture payment`);
      }
  
      // 4. ONLY CAPTURE IF APPROVED
      const captureResponse = await axios.post(
        `${process.env.PAYPAL_API_URL}/v2/checkout/orders/${token}/capture`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
  
      if (captureResponse.data.status !== 'COMPLETED') {
        throw new Error('Capture failed');
      }
  
      return captureResponse.data;
  
    } catch (error) {
      const paypalError = error.response?.data;
      console.error('PayPal Validation Error:', {
        debug_id: paypalError?.debug_id,
        details: paypalError?.details?.[0]?.description,
        message: paypalError?.message || error.message
      });
      
      throw new Error(paypalError?.details?.[0]?.description || 'Payment verification failed');
    }
  }
  


export default router;