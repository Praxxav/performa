import bcryptjs from "bcryptjs";
import crypto from "crypto";
import {
	User
} from "../models/user.model.js";
import {
	generateTokenAndSetCookie
} from "../utils/generateTokenAndSetCookie.js";
import {
	OAuth2Client
} from "google-auth-library";
import {
	sendVerificationEmail,
	sendWelcomeEmail,
	sendPasswordResetEmail,
	sendResetSuccessEmail
} from "../mails/emails.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const signup = async (req, res) => {
	const {
		email,
		password,
		name
	} = req.body;

	try {
		if (!email || !password || !name) {
			throw new Error("All fields are required");
		}

		const userAlreadyExists = await User.findOne({
			email
		});
		console.log("userAlreadyExists", userAlreadyExists);

		if (userAlreadyExists) {
			return res.status(400).json({
				success: false,
				message: "User already exists"
			});
		}

		const hashedPassword = await bcryptjs.hash(password, 10);
		const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

		const user = new User({
			email,
			password: hashedPassword,
			name,
			verificationToken,
			verificationTokenExpiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
		});

		await user.save();

		// jwt
		generateTokenAndSetCookie(res, user._id);

		await sendVerificationEmail(user.email, user.name, verificationToken);

		res.status(201).json({
			success: true,
			message: "User created successfully",
			user: {
				...user._doc,
				password: undefined,
			},
		});
	} catch (error) {
		res.status(400).json({
			success: false,
			message: error.message
		});
	}
};

export const login = async (req, res) => {
	try {
		const {
			email,
			password
		} = req.body;
		const user = await User.findOne({
			email
		});

		if (!email || !password) {
			throw new Error("All fields are required");
		}

		if (!user) {
			return res.status(400).json({
				success: false,
				message: "User does not exist!"
			});
		}

		// Ensure user.password exists
		if (!user.password) {
			return res.status(400).json({
				message: 'Invalid credentials'
			});
		}

		const isPasswordValid = await bcryptjs.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(400).json({
				success: false,
				message: "Invalid credentials"
			});
		}

		let wasRecovered = false;
		const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

		if (user.isDeleted) {
			const deletedDuration = new Date() - user.deletedAt;
			if (deletedDuration > THIRTY_DAYS) {
				return res.status(403).json({
					success: false,
					message: "User does not exist!",
				});
			}
			// Within 30 days, allow reactivation
			user.isDeleted = false;
			user.deletedAt = null;
			wasRecovered = true;
			await user.save();
		}


		generateTokenAndSetCookie(res, user._id);

		user.lastLogin = new Date();
		await user.save();

		res.status(200).json({
			success: true,
			message: wasRecovered ?
				"Your account has been reactivated successfully." :
				"Logged in successfully.",
			user: {
				...user._doc,
				password: undefined, // Hide password
			},
		});
	} catch (error) {
		console.log("Error in login ", error);
		res.status(400).json({
			success: false,
			message: error.message
		});
	}
};

export const logout = async (req, res) => {

	const isProduction = process.env.NODE_ENV === "production";

	res.clearCookie('token', {
		httpOnly: true,
		secure: isProduction,
		sameSite: isProduction ? "none" : "lax",
	});
	res.status(200).json({
		success: true,
		message: "Logged out successfully"
	});
};

export const googleSignIn = async (req, res) => {
	try {
		const {
			token
		} = req.body;

		// Validate token
		if (!token) {
			return res.status(400).json({
				success: false,
				message: "Token is required"
			});
		}

		// Verify the Google token
		const ticket = await client.verifyIdToken({
			idToken: token,
			audience: process.env.GOOGLE_CLIENT_ID,
		});

		const payload = ticket.getPayload(); // Extract user details from token
		const {
			email,
			name
		} = payload;

		// Check if the user already exists
		let user = await User.findOne({
			email
		});

		if (!user) {
			// If user doesn't exist, create a new user with the provided role
			user = new User({
				email,
				name,
				isVerified: true, // Automatically verify Google users
				isGoogleUser: true, // Indicate that this user signed up via Google
			});
			await user.save();
		}

		// Update the user's last login time
		user.lastLogin = new Date();
		await user.save();

		// Generate a JWT and set it as an HTTP-only cookie
		generateTokenAndSetCookie(res, user._id);

		// Return success response with user data
		res.status(200).json({
			success: true,
			message: "Google sign-in successful",
			user: {
				...user._doc,
				password: undefined, // Exclude password from the response
			},
		});
	} catch (error) {
		console.error("Error in googleSignIn:", error);
		res.status(400).json({
			success: false,
			message: error.message
		});
	}
};

export const verifyEmail = async (req, res) => {
	const {
		code
	} = req.body;
	try {
		const user = await User.findOne({
			verificationToken: code,
			verificationTokenExpiresAt: {
				$gt: Date.now()
			},
		});

		if (!user) {
			return res.status(400).json({
				success: false,
				message: "Invalid or expired verification code"
			});
		}

		user.isVerified = true;
		user.verificationToken = undefined;
		user.verificationTokenExpiresAt = undefined;
		await user.save();

		await sendWelcomeEmail(user.email, user.name);

		res.status(200).json({
			success: true,
			message: "Email verified successfully",
			user: {
				...user._doc,
				password: undefined,
			},
		});
	} catch (error) {
		console.log("error in verifyEmail ", error);
		res.status(500).json({
			success: false,
			message: "Server error"
		});
	}
};

export const forgotPassword = async (req, res) => {
	const {
		email
	} = req.body;
	try {
		const user = await User.findOne({
			email
		});

		if (!user) {
			return res.status(400).json({
				success: false,
				message: "User not found"
			});
		}

		// Generate reset token
		const resetToken = crypto.randomBytes(20).toString("hex");
		const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

		user.resetPasswordToken = resetToken;
		user.resetPasswordExpiresAt = resetTokenExpiresAt;

		await user.save();

		// send email
		await sendPasswordResetEmail(user.email, user.name, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

		res.status(200).json({
			success: true,
			message: "Password reset link sent to your email"
		});
	} catch (error) {
		console.log("Error in forgotPassword ", error);
		res.status(400).json({
			success: false,
			message: error.message
		});
	}
};

export const resetPassword = async (req, res) => {
	try {
		const {
			token
		} = req.params;
		const {
			password
		} = req.body;

		const user = await User.findOne({
			resetPasswordToken: token,
			resetPasswordExpiresAt: {
				$gt: Date.now()
			},
		});

		if (!user) {
			return res.status(400).json({
				success: false,
				message: "Invalid or expired reset token"
			});
		}

		// update password
		const hashedPassword = await bcryptjs.hash(password, 10);

		user.password = hashedPassword;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpiresAt = undefined;
		await user.save();

		await sendResetSuccessEmail(user.email, user.name);

		res.status(200).json({
			success: true,
			message: "Password reset successful"
		});
	} catch (error) {
		console.log("Error in resetPassword ", error);
		res.status(400).json({
			success: false,
			message: error.message
		});
	}
};

export const checkAuth = async (req, res) => {
	try {
		const userId = req.user.id;
		const user = await User.findById(userId).select("-password");
		if (!user) {
			return res.status(400).json({
				success: false,
				message: "User not found"
			});
		}

		// Return the user's connection status (e.g., PayPal connection)
		res.status(200).json({
			success: true,
			user,
			connections: {
				paypal: user.paypal && user.paypal.accessToken ? true : false,
			}
		});
	} catch (error) {
		console.log("Error in checkAuth ", error);
		res.status(400).json({
			success: false,
			message: error.message
		});
	}
};