import express from "express";
import createTransporter from "./email.config.js";
import Invoice from "../models/invoice.model.js";
import axios from "axios";
import dotenv from 'dotenv';
import { verifyToken } from "../middleware/verifyToken.js";
import { User } from '../models/user.model.js';
import { decrypt, encrypt } from "../utils/encrypt.js";
import { enforceMonthlyLimit } from "../middleware/usageLimit.js";
import invoiceLog from "../models/invoice.log.js";
const router = express.Router();

dotenv.config();

const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw new Error('Could not fetch user');
  }
};

// Function to generate PayPal payment link
async function generatePayPalPaymentLink(invoiceDetails) {
  try {
    if (!invoiceDetails.userId) {
      throw new Error("Missing userId required for token retrieval");
    }

    // Get valid (and decrypted) access token from helper
    const accessToken = await getValidPayPalAccessToken(invoiceDetails.userId);

    if (!accessToken) {
      throw new Error("Failed to obtain valid PayPal access token");
    }

    // Validate invoice details
    if (!invoiceDetails.invoiceNumber || typeof invoiceDetails.invoiceNumber !== 'string' || !invoiceDetails.invoiceNumber.trim()) {
      throw new Error("Missing or invalid invoice number");
    }

    if (!invoiceDetails.amount || isNaN(parseFloat(invoiceDetails.amount))) {
      throw new Error("Missing or invalid invoice amount");
    }

    if (!invoiceDetails.description || typeof invoiceDetails.description !== 'string') {
      invoiceDetails.description = `Invoice ${invoiceDetails.invoiceNumber}`;
    }

    if (!invoiceDetails.companyName || typeof invoiceDetails.companyName !== 'string') {
      invoiceDetails.companyName = "Proforma";
    }

    const paypalApiUrl = `${process.env.PAYPAL_API_URL}/v2/checkout/orders`;

    const amount = parseFloat(String(invoiceDetails.amount).replace(/[^0-9.]/g, '')).toFixed(2);

    const orderPayload = {
      intent: "CAPTURE",
      purchase_units: [{
        amount: {
          currency_code: "USD",
          value: amount,
          breakdown: {
            item_total: {
              currency_code: "USD",
              value: amount
            }
          }
        },
        description: invoiceDetails.description.substring(0, 127),
        invoice_id: invoiceDetails._id.toString(),
        custom_id: invoiceDetails._id.toString()
      }],
      application_context: {
        brand_name: invoiceDetails.companyName.substring(0, 127),
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
        return_url: `${process.env.BACKEND_URL}/api/payments/success?invoiceId=${invoiceDetails._id}`,
        cancel_url: `${process.env.BACKEND_URL}/api/payments/cancel?invoiceId=${invoiceDetails._id}`
      }
    };

    const response = await fetch(paypalApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "PayPal-Request-Id": `${invoiceDetails.invoiceNumber}-${Date.now()}`
      },
      body: JSON.stringify(orderPayload)
    });

    if (!response.ok) {
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = JSON.stringify(errorData);
      } catch (e) {
        errorMessage = await response.text();
      }
      throw new Error(`PayPal API error (${response.status}): ${errorMessage}`);
    }

    const orderData = await response.json();
    const approvalLink = orderData.links.find(link => link.rel === "approve");

    if (!approvalLink?.href) {
      throw new Error("Payment system error: Missing approval link in PayPal response");
    }

    return approvalLink.href;
  } catch (error) {
    console.error("Payment link generation failed:", error);
    throw error;
  }
}


async function getValidPayPalAccessToken(userId) {
  const user = await getUserById(userId);
  const currentTime = Date.now();

  if (user.paypal?.tokenExpiry > currentTime) {
    return decrypt(user.paypal.accessToken);
  }

  // Check if refresh token exists
  if (!user.paypal?.refreshToken) {
    throw new Error("No PayPal refresh token available");
  }

  try {
    const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString('base64');
    
    // Decrypt the refresh token before use
    const refreshToken = decrypt(user.paypal.refreshToken); 

    const response = await axios.post(
      `${process.env.PAYPAL_API_URL}/v1/oauth2/token`,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken, // Use decrypted token
      }),
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const newAccessToken = response.data.access_token;
    const expiresIn = response.data.expires_in;

    //Ensure paypal object exists
    user.paypal = user.paypal || {}; 
    user.paypal.accessToken = encrypt(newAccessToken);
    user.paypal.tokenExpiry = currentTime + expiresIn * 1000;
    await user.save();

    return newAccessToken;
  } catch (error) {
    console.error('Failed to refresh PayPal token:', error.response?.data || error.message);
    throw new Error('Could not refresh PayPal access token');
  }
}


router.post("/send-email", verifyToken, enforceMonthlyLimit, async (req, res) => {
  const {
    invoiceUrl,
    invoiceFileName,
    clientAddress,
    clientName,
    companyAddress,
    companyName,
    description,
    dueDate,
    invoiceAmount,
    invoiceDate,
    invoiceNumber,
    userId
  } = req.body;

  if (!invoiceUrl) {
    return res.status(400).json({ error: "Missing invoice URL" });
  }

  try {
    // Convert string amount to numeric for database storage first
    const amountNumeric = parseFloat(invoiceAmount.replace(/[^0-9.]/g, ''));

    // 1. FIRST SAVE THE INVOICE TO GET _id
    const invoiceData = new Invoice({
      userId,
      invoiceNumber,
      clientName,
      clientAddress,
      companyName,
      companyAddress,
      description,
      amountNumeric,
      invoiceDate,
      dueDate,
      invoiceUrl,
      invoiceFileName: invoiceFileName || `Invoice-${invoiceNumber}.pdf`,
      sentDate: new Date()
    });

    // Save the initial invoice document
    const savedInvoice = await invoiceData.save();

    // Save to InvoiceLog to persist history
    await invoiceLog.create({ userId });

    // 2. NOW GENERATE PAYMENT LINK WITH THE _id
    let paymentLink;
    try {
      paymentLink = await generatePayPalPaymentLink({
        _id: savedInvoice._id, // Add the _id to the details
        amount: invoiceAmount.replace(/[^0-9.]/g, ''),
        description: description || `Invoice ${invoiceNumber}`,
        invoiceNumber: invoiceNumber,
        companyName: companyName,
        userId
      });
      
      // 3. UPDATE INVOICE WITH PAYMENT LINK
      savedInvoice.paymentLink = paymentLink;
      await savedInvoice.save();
      
    } catch (paypalError) {
      console.error("Failed to generate PayPal payment link:", paypalError);
      // Optionally mark invoice as failed
      await Invoice.findByIdAndUpdate(savedInvoice._id, { 
        status: 'payment_failed',
        error: paypalError.message 
      });
      throw new Error("Failed to generate PayPal payment link");
    }

    // 4. NOW SEND EMAIL WITH COMPLETE DATA
    const transporter = await createTransporter();
    const html =  `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Invoice from ${companyName}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333333;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
                <td align="center" style="padding: 0;">
                    <table role="presentation" style="width: 600px; border-collapse: collapse; border: 0; border-spacing: 0; background-color: #ffffff;">
                        
                        <!-- Main Content -->
                        <tr>
                            <td style="padding: 15px 10px;">
                                <table role="presentation" style="width: 100%; border-collapse: collapse; border: 0;">
                                    <!-- Greeting -->
                                    <tr>
                                        <td style="padding: 0 0 20px 0;">
                                            <p style="margin: 0; font-size: 16px; line-height: 24px;">Hello ${clientName},</p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Main Message -->
                                    <tr>
                                        <td style="padding: 0 0 20px 0;">
                                            <p style="margin: 0; font-size: 16px; line-height: 24px;">Thank you for your business. Your invoice ${invoiceNumber} for ${description} is attached to this email. The total amount due is ${invoiceAmount}.</p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Invoice Summary -->
                                    <tr>
                                        <td style="padding: 15px 0;">
                                            <table role="presentation" style="width: 100%; border-collapse: collapse; border: 1px solid #dddddd; margin-bottom: 20px;">
                                                <tr>
                                                    <th style="padding: 10px; text-align: left; background-color: #f8f9fa; border-bottom: 1px solid #dddddd; font-size: 14px;">Invoice Number:</th>
                                                    <td style="padding: 10px; text-align: right; border-bottom: 1px solid #dddddd; font-size: 14px;">${invoiceNumber}</td>
                                                </tr>
                                                <tr>
                                                    <th style="padding: 10px; text-align: left; background-color: #f8f9fa; border-bottom: 1px solid #dddddd; font-size: 14px;">Issue Date:</th>
                                                    <td style="padding: 10px; text-align: right; border-bottom: 1px solid #dddddd; font-size: 14px;">${invoiceDate}</td>
                                                </tr>
                                                <tr>
                                                    <th style="padding: 10px; text-align: left; background-color: #f8f9fa; border-bottom: 1px solid #dddddd; font-size: 14px;">Due Date:</th>
                                                    <td style="padding: 10px; text-align: right; border-bottom: 1px solid #dddddd; font-size: 14px;">${dueDate}</td>
                                                </tr>
                                                <tr>
                                                    <th style="padding: 10px; text-align: left; background-color: #f8f9fa; font-size: 16px; font-weight: bold;">Total Amount:</th>
                                                    <td style="padding: 10px; text-align: right; font-size: 16px; font-weight: bold;">${invoiceAmount}</td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    
    
                                    <tr>
                                        <td style="padding: 20px 0;">
                                            <table role="presentation" style="width: 100%; border-collapse: collapse; border: 0;">
                                                <tr>
                                                    <td style="text-align: center;">
                                                        <p style="margin: 0 0 15px 0; font-size: 16px; line-height: 24px;">To make payment, please click the button below:</p>
                                                        <a href="${paymentLink}" style="background-color: #1d604b; border: none; color: white; padding: 12px 28px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; font-weight: bold; border-radius: 4px;">Pay Invoice Now</a>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    
                                    <tr>
                                        <td style="padding: 20px 0 0 0;">
                                            <p style="margin: 0; font-size: 16px; line-height: 24px;">Please review the attached PDF for a detailed breakdown of your invoice.</p>
                                            <p style="margin: 15px 0 0 0; font-size: 16px; line-height: 24px;">If you have any questions about this invoice, please contact us at <a href="mailto:${companyAddress}" style="color: #1d604b; text-decoration: underline;">${companyAddress}</a>.</p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Thank You Message -->
                                    <tr>
                                        <td style="padding: 25px 0 0 0;">
                                            <p style="margin: 0; font-size: 16px; line-height: 24px;">Thank you for your business.</p>
                                            <p style="margin: 15px 0 0 0; font-size: 16px; line-height: 24px;">Best regards,<br>Proforma Team</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;

    const mailOptions = {
      from: {
        name: "Proforma",
        address: process.env.EMAIL
      },
      to: clientAddress,
      subject: `Invoice ${invoiceNumber} from ${companyName}`,
      html,
      attachments: [{
        filename: invoiceFileName || `Invoice-${invoiceNumber}.pdf`,
        path: invoiceUrl,
        contentType: "application/pdf"
      }],
      headers: {
        'X-Entity-Ref-ID': `invoice-${invoiceNumber}`,
        'List-Unsubscribe': `<mailto:${process.env.EMAIL}?subject=unsubscribe>`
      }
    };
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "Email sent successfully with invoice attachment",
      paymentLink,
      invoiceId: savedInvoice._id
    });

  } catch (error) {
    console.error("Error in send-email:", error);
    res.status(500).json({
      error: "Failed to send email",
      details: error.message
    });
  }
});

export default router;








