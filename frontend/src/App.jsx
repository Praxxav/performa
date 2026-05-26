import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dashboard from "./pages/Dashboard";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Dashboard Route */}
        <Route path="/" element={<Navigate to="/dashboard/invoices" replace />} />
        <Route
          path="/dashboard/*"
          element={<Dashboard />}
        />
        {/* Fallback to Dashboard */}
        <Route path="*" element={<Navigate to="/dashboard/invoices" replace />} />
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
