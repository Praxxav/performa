import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./hooks/ProtectedRoute";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import RedirectAuthenticatedUser from "./hooks/RedirectAuthenticatedUser";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Success from "./pages/Success";
import Cancel from "./pages/Cancel";
import DeletedAccountPage from "./pages/DeletedAccountPage";
import Upgrade from "./pages/Upgrade";
import PaymentStatus from "./pages/PaymentStatus";
import UpgradeSuccess from "./pages/UpgradeSuccess";
import UpgradeCancel from "./pages/UpgradeCancel";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/dashboard/invoices" replace />} />
        {/* <Route path="/signup" element={<Signup />} /> */}
        {/* Protected dashboard Route */}
        <Route
          path="/dashboard/*"
          element={<Dashboard />}
        />
        {/* Error Pages */}
        <Route path="*" element={<Navigate to="/dashboard/invoices" replace />} />
        {/*
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route
          path="/reset-password/:token"
          element={
            <RedirectAuthenticatedUser>
              <ResetPasswordPage />
            </RedirectAuthenticatedUser>
          }
        />
        <Route path="/payment-success" element={<Success />} />
        <Route path="/upgrade-success" element={<UpgradeSuccess/>} />

        <Route path="/payment-error" element={<Cancel />} />
        <Route path="/upgrade-error" element={<UpgradeCancel />} />
        <Route path="/account-deleted" element={<DeletedAccountPage />} />
        <Route path="/payment-status" element={<PaymentStatus />} />
        <Route
          path="/pricing"
          element={
            <ProtectedRoute>
              <Upgrade />
            </ProtectedRoute>
          }
        />
        */}
      </Routes>

      <ToastContainer
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        theme="light"
        style={{ zIndex: 99999 }}
      />
    </Router>
  );
};

export default App;
