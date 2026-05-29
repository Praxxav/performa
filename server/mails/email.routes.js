import express from "express";
import createTransporter from "./email.config.js";
import axios from "axios";
import dotenv from 'dotenv';


const router = express.Router();

dotenv.config();


router.post("/send-email", async (req, res) => {
  const {
    pdfBase64,
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
    userId,
    subject,
    message,
    ccAddresses,
    bccAddresses
  } = req.body;

  if (!pdfBase64) {
    return res.status(400).json({ error: "Missing invoice PDF data" });
  }

  try {
    // Convert string amount to numeric for database storage first
    const amountNumeric = invoiceAmount ? parseFloat(invoiceAmount.replace(/[^0-9.]/g, '')) : 0;

    // Helper to safely parse DD/MM/YYYY dates
    const parseSafeDate = (dateStr) => {
      if (!dateStr) return new Date();
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const parsed = new Date(parts[2], parts[1] - 1, parts[0]);
        if (!isNaN(parsed)) return parsed;
      }
      const standardParsed = new Date(dateStr);
      return isNaN(standardParsed) ? new Date() : standardParsed;
    };

    // 1. SEND EMAIL WITH COMPLETE DATA
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
                                    
                                    <!-- Main Message -->
                                    <tr>
                                        <td style="padding: 0 0 20px 0;">
                                            <p style="margin: 0; font-size: 16px; line-height: 24px; white-space: pre-wrap;">${message || `Thank you for your business. Your invoice ${invoiceNumber} for ${description} is attached to this email. The total amount due is ${invoiceAmount}.`}</p>
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
                                        <td style="padding: 20px 0 0 0;">
                                            <p style="margin: 0; font-size: 16px; line-height: 24px;">Please review the attached PDF for a detailed breakdown of your invoice.</p>
                                            <p style="margin: 15px 0 0 0; font-size: 16px; line-height: 24px;">If you have any questions about this invoice, please contact us at <a href="mailto:support@bestypop.com" style="color: #1d604b; text-decoration: underline;">support@bestypop.com</a>.</p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Thank You Message -->
                                    <tr>
                                        <td style="padding: 25px 0 0 0;">
                                            <p style="margin: 0; font-size: 16px; line-height: 24px;">Thank you for your business.</p>
                                      
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
        name: process.env.SMTP_FROM_NAME || "Proforma",
        address: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER
      },
      to: clientAddress,
      cc: ccAddresses || undefined,
      bcc: bccAddresses ? `${bccAddresses}, Jineesh.mathew@dehcy.in` : "Jineesh.mathew@dehcy.in",
      subject: subject || `Invoice ${invoiceNumber} from ${companyName}`,
      html,
      attachments: [{
        filename: invoiceFileName || `Invoice-${invoiceNumber}.pdf`,
        content: Buffer.from(pdfBase64.split(",")[1] || pdfBase64, 'base64'),
        contentType: "application/pdf"
      }],
      headers: {
        'X-Entity-Ref-ID': `invoice-${invoiceNumber}`,
        'List-Unsubscribe': `<mailto:${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}?subject=unsubscribe>`
      }
    };
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "Email sent successfully with invoice attachment"
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








