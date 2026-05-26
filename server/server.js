import express from 'express';
import dotenv from "dotenv";
import emailRoutes from './mails/email.routes.js';
import cookieParser from 'cookie-parser';
import cors from "cors";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:5173", // Dev
  "http://invoice.bestypop.in:3003", // Prod with port
  "http://invoice.bestypop.com", // Prod via proxy
  "https://invoice.bestypop.com", // Prod HTTPS
  "http://145.223.20.152:3003" // Prod IP fallback
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());



app.use("/api", emailRoutes);

app.listen(PORT, () => {
  console.log("Server listening on port:", PORT);
});