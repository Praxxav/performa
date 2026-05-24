import express from 'express';
import dotenv from "dotenv";
import { connectDB } from './db/connectDB.js';
import authRoutes from './routes/auth.routes.js';
import emailRoutes from './mails/email.routes.js';
import paypalRoutes from './routes/paypal.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import upgradeRoutes from './routes/upgrade.routes.js';
import cookieParser from 'cookie-parser';
import cors from "cors";
import "./cronJobs/deleteOldUsers.js"

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:5173", // Dev
  "http://proforma.bestypop.com:3003", // Prod with port
  "http://proforma.bestypop.com", // Prod via proxy
  "https://proforma.bestypop.com", // Prod HTTPS
  "http://145.223.20.152:3003" // Prod IP fallback
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());



app.use("/api/auth", authRoutes);
app.use("/api", emailRoutes);
// app.use("/paypal", paypalRoutes);
app.use('/api/invoice', invoiceRoutes);
app.use("/settings", settingsRoutes);
// app.use('/api/payments', paymentRoutes);
app.use('/upgrade', upgradeRoutes)

// Connect to database first, then start server
const startServer = async () => {
  try {
    await connectDB();
    console.log("Database connected successfully");
    
    app.listen(PORT, () => {
      console.log("Server listening on port:", PORT);
    });
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }
};

startServer();