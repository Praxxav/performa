import { signup, login, logout, googleSignIn, checkAuth, verifyEmail, forgotPassword, resetPassword } from "../controllers/auth.controller.js";
import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";


const router = express.Router();


router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/google-signin", googleSignIn);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/check-auth", verifyToken , checkAuth);

export default router