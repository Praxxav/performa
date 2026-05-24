import axios from "axios";
import { useAuthStore } from "../store/authStore";

const API_URL =
  import.meta.env.MODE === "development"
    ? "https://d996-2c0f-2a80-e2-b810-617f-62b6-5d09-50e4.ngrok-free.app"
    : "https://proforma-sohi.vercel.app";

const API_URL2 =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000"
    : "https://proforma-sohi.vercel.app";

const PAYPAL_AUTH_URL = import.meta.env.VITE_PAYPAL_AUTH;

export const UsePaymentHandlers = () => {
  const { user, checkAuth } = useAuthStore();

  // PayPal Account Connection
  const handlePayPalConnect = () => {
    try {
      const clientId = import.meta.env.VITE_REACT_APP_PAYPAL_CLIENT_ID;
      const userId = user._id; // Getting the MongoDB ObjectId from your auth store's user
      const currentUrl = window.location.href; // Get the full current URL, which includes the route
      const stateObj = { userId, redirect: currentUrl };
      const state = encodeURIComponent(JSON.stringify(stateObj));
      const redirectUri = encodeURIComponent(`${API_URL}/paypal/callback`);
      const scope = encodeURIComponent("openid email profile");

      // Construct the OAuth URL
      const authUrl = `${PAYPAL_AUTH_URL}?client_id=${clientId}&response_type=code&scope=${scope}&redirect_uri=${redirectUri}&state=${state}`;

      // Redirect the current window to PayPal's OAuth flow
      window.location.href = authUrl;
    } catch (error) {
      console.error("PayPal account connection error:", error);
    }
  };

  // Paypal Account Disconnection
  const handleDisconnectPayPal = async () => {
    try {
      // 1. Remove PayPal credentials on the server
      await axios.post(
        `${API_URL2}/paypal/disconnect`,
        { userId: user._id },
        { withCredentials: true }
      );
      // 2. Check the user is authenticated and retrieve the connections array
      checkAuth();
    } catch (error) {
      console.error("Error disconnecting PayPal:", error);
    }
  };

  return {
    handlers: {
      handlePayPalConnect,
      handleDisconnectPayPal,
    },
  };
};
