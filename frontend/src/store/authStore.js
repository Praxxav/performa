import {
  create
} from "zustand";
import axios from "axios";

// Set the API URL based on the environment
const API_URL =
  import.meta.env.MODE === "development" ?
  "http://localhost:3000/api/auth" :
  "https://proforma-sohi.vercel.app/api/auth";

axios.defaults.withCredentials = true;

// Zustand store with persist
export const useAuthStore = create((set) => ({
  user: null,
  connections: {
    paypal: false,
  },
  isAuthenticated: true,
  error: null,
  isLoading: false,
  isCheckingAuth: false,
  message: null,

  // Clear error state
  clearError: () => {
    set({
      error: null
    });
  },

   clearUser: () => set({ user: null }),

  // Signup function
  signup: async (email, password, name) => {
    set({
      isLoading: true,
      error: null
    });
    try {
      const response = await axios.post(`${API_URL}/signup`, {
        email,
        password,
        name,
      });
      const user = response.data.user;
      set({
        user,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error signing up",
        isLoading: false,
      });
      throw error;
    }
  },

  // Google Sign-In function
  googleSignIn: async (token) => {
    set({
      isLoading: true,
      error: null
    });
    try {
      const response = await axios.post(`${API_URL}/google-signin`, {
        token
      });
      const user = response.data.user;
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error signing in with Google",
        isLoading: false,
      });
      throw error;
    }
  },

  // Login function
  login: async (email, password) => {
    set({
      isLoading: true,
      error: null
    });
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });
      const user = response.data.user;
      set({
        isAuthenticated: true,
        user,
        isLoading: false,
      });
      return user
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error logging in",
        isLoading: false,
      });
      throw error;
    }
  },

  // Logout function
  logout: async () => {
    set({
      isLoading: true,
      error: null
    });
    try {
      await axios.post(`${API_URL}/logout`);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
    } catch (error) {
      set({
        error: "Error logging out",
        isLoading: false,
      });
      throw error;
    }
  },

  // Check authentication on app load
  checkAuth: async () => {
    set({
      isCheckingAuth: true,
      error: null
    });
    try {
      const response = await axios.get(`${API_URL}/check-auth`);
      const user = response.data.user;
      const connections = response.data.connections; // Extract connection status from the response
      set({
        user,
        connections,
        isAuthenticated: true,
        isCheckingAuth: false,
      });
    } catch {
      set({
        isCheckingAuth: false,
        isAuthenticated: false
      });
    }
  },

  // Verify email
  verifyEmail: async (code) => {
    set({
      isLoading: true,
      error: null
    });
    try {
      const response = await axios.post(`${API_URL}/verify-email`, {
        code
      });
      const user = response.data.user;

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      return user;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error verifying email",
        isLoading: false,
      });
      throw error;
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    set({
      isLoading: true,
      error: null
    });
    try {
      const response = await axios.post(`${API_URL}/forgot-password`, {
        email,
      });
      set({
        message: response.data.message,
        isLoading: false
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message ||
          "Error sending reset password email",
      });
      throw error;
    }
  },

  // Reset password
  resetPassword: async (token, password) => {
    set({
      isLoading: true,
      error: null
    });
    try {
      const response = await axios.post(
        `${API_URL}/reset-password/${token}`, {
          password
        }
      );
      set({
        message: response.data.message,
        isLoading: false
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Error resetting password",
      });
      throw error;
    }
  },
}));