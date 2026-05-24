import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { TbLoader3 } from "react-icons/tb";
import { useInvoiceStore } from "../store/invoiceStore";

const ProtectedRoute = ({ children }) => {
  const { isCheckingAuth, checkAuth, isAuthenticated, user } = useAuthStore();
  const { fetchInvoiceCount } =
      useInvoiceStore();
  const [minLoading, setMinLoading] = useState(true);

  // Animated ellipsis component
  const AnimatedEllipsis = () => {
    const [dots, setDots] = useState("");

    useEffect(() => {
      const interval = setInterval(() => {
        setDots((prevDots) => {
          if (prevDots === "") return ".";
          if (prevDots === ".") return "..";
          if (prevDots === "..") return "...";
          return "";
        });
      }, 600);

      return () => clearInterval(interval);
    }, []);

    return <span className="animated-ellipsis">{dots}</span>;
  };

  useEffect(() => {
    // Define an async function to run the auth check
    const initializeAuth = async () => {
      await checkAuth();
    };
    initializeAuth();
  }, [checkAuth]);

  // Ensure the spinner shows for at least 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch when dropdown opens (or on mount if you prefer)
  useEffect(() => {
    if (user?._id) {
      fetchInvoiceCount(user._id);
    }
  }, [user?._id, fetchInvoiceCount]);

  // While authentication is being checked or the 3 second minimum loading time hasn't elapsed, show spinner
  if (isCheckingAuth || minLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen space-y-3">
        <TbLoader3 size={30} className="animate-spin text-teal-500" />
        <p className="text-[4vw] font-satoshi md:text-sm lg:text-[1vw]">
          Please wait while we load the content
          <AnimatedEllipsis />
        </p>
      </div>
    );
  }

  // After the auth check is complete, if the user is not authenticated, redirect them to signup
  if (!isAuthenticated) {
    return <Navigate to="/signup" replace />;
  }

  if (!user.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  // Otherwise, render the protected children
  return children;
};

export default ProtectedRoute;
