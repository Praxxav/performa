import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import lottie from "lottie-web";
import generatingAnimation from "../../../assets/animations/generating.json";
import { FaCheck } from "react-icons/fa";
import uploadingAnimation from "../../../assets/animations/uploading.json";
import sendingAnimation from "../../../assets/animations/sending.json";
import { useAuthStore } from "../../../store/authStore";
import { GoShieldLock } from "react-icons/go";
import { UsePaymentHandlers } from "../../../hooks/UsePaymentHandlers";
import Paypal from "../../../assets/Images/Account Icons/PayPal_Logo_Icon_2014.svg";
import flutter from "../../../assets/Images/Account Icons/full.svg";
import stripe from "../../../assets/Images/Account Icons/Logotype (1).svg";
import paystack from "../../../assets/Images/Account Icons/images (1).png";
import skrill from "../../../assets/Images/Account Icons/Skrill.svg";
import googlepay from "../../../assets/Images/Account Icons/GooglePay.svg";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useInvoiceStore } from "../../../store/invoiceStore";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000/api"
    : "https://proforma-sohi.vercel.app/api";

axios.defaults.withCredentials = true;

const SendingEmailModal = ({ onClose, toggleStaticMode }) => {
  const [isComplete, setIsComplete] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState("generating");
  const { user, connections } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const didSendRef = useRef(false);
  const { handlers } = UsePaymentHandlers();
  const { incrementInvoiceCount } = useInvoiceStore();

  // Disable scrolling when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);

  const paymentOptions = [
    {
      name: "PayPal",
      icon: Paypal,
      action: handlers.handlePayPalConnect,
      connected: connections?.paypal,
    },
    {
      name: "Flutterwave",
      icon: flutter,
      action: handlers.handleFlutterwaveConnect,
      connected: connections?.flutterwave,
    },
    {
      name: "Stripe",
      icon: stripe,
      action: handlers.handleStripeConnect,
      connected: connections?.stripe,
    },
    {
      name: "Paystack",
      icon: paystack,
      action: handlers.handlePaystackConnect,
      connected: connections?.paystack,
    },
    {
      name: "Skrill",
      icon: skrill,
      action: handlers.handleSkrillConnect,
      connected: connections?.skrill,
    },
    {
      name: "Google Pay",
      icon: googlepay,
      action: handlers.handleGooglePayConnect,
      connected: connections?.googlePay,
    },
  ];

  useEffect(() => {
    if (!didSendRef.current) {
      didSendRef.current = true;
      handleSendEmail();
    }
  }, []);

  const statusSteps = [
    {
      status: "generating",
      lottieData: generatingAnimation,
      title: "Generating Invoice",
      text: "Preparing your document",
    },
    {
      status: "uploading",
      lottieData: uploadingAnimation,
      title: "Uploading Invoice",
      text: "Saving to cloud storage",
    },
    {
      status: "sending",
      lottieData: sendingAnimation,
      title: "Sending Email",
      text: "Dispatching notification",
    },
  ];

  const getCurrentStep = () =>
    statusSteps.find((step) => step.status === sendStatus) || statusSteps[0];

  const LottieAnimation = ({ animationData, width = 200, height = 200 }) => {
    const animationContainer = useRef(null);

    useEffect(() => {
      if (!animationContainer.current) return;

      const anim = lottie.loadAnimation({
        container: animationContainer.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        animationData: animationData,
      });

      return () => anim.destroy(); // Clean up on unmount
    }, [animationData]);

    return <div ref={animationContainer} style={{ width, height }} />;
  };

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

  function getInvoiceFields() {
    const fields = {};
    document.querySelectorAll("[data-invoice-field]").forEach((el) => {
      const key = el.dataset.invoiceField;

      let value = "";
      // 1️ Anchor tags → take the href
      if (el.tagName === "A" && el.href) {
        value = el.href;
      }
      // 2️ Inputs or textareas → take the .value
      else if ("value" in el) {
        value = el.value.trim();
      }
      // 3️ Everything else → innerText
      else {
        value = el.innerText.trim();
      }

      fields[key] = value;
    });

    return fields;
  }

  // Generate the PDF blob from the invoice DOM
  const createPDF = async () => {
    try {
      toggleStaticMode(true);
      const invoiceElement = document.getElementById("invoice");
      if (!invoiceElement) throw new Error("Invoice element not found");

      // Store original styles
      const originalStyle = {
        width: invoiceElement.style.width,
        overflow: invoiceElement.style.overflow,
      };

      // Temporarily expand to full content width and remove overflow clipping
      invoiceElement.style.width = `${invoiceElement.scrollWidth}px`;
      invoiceElement.style.overflow = "visible";

      // Create PDF and capture full canvas
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        imageTimeout: 0,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.6);
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(
        imgData,
        "JPEG",
        0,
        0,
        imgWidth,
        imgHeight,
        undefined,
        "FAST"
      );

      const blob = pdf.output("blob");

      // Restore original styles
      invoiceElement.style.width = originalStyle.width;
      invoiceElement.style.overflow = originalStyle.overflow;

      return blob;
    } catch (error) {
      console.error("Error creating PDF:", error);
      toast.error("Failed to generate invoice PDF");
      toggleStaticMode(false);
      throw error;
    } finally {
      toggleStaticMode(false);
    }
  };

  // Upload the blob to Cloudinary
  const uploadPDFToCloudinary = async (pdfBlob) => {
    setSendStatus("uploading");

    // Ensure environment variables are defined
    const cloudinaryPreset = import.meta.env.VITE_CLOUDINARY_PRESET;
    const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

    if (!cloudinaryPreset || !cloudinaryCloudName) {
      throw new Error("Cloudinary environment variables are not set");
    }

    const timestamp = new Date().getTime();
    const uniqueFilename = `invoice_${timestamp}`;

    const form = new FormData();
    form.append("file", pdfBlob);
    form.append("upload_preset", cloudinaryPreset);
    form.append("public_id", uniqueFilename);
    form.append("filename_override", "invoice.pdf");

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/auto/upload`,
        {
          method: "POST",
          body: form,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Cloudinary error:", errorData);
        throw new Error("Cloudinary upload failed");
      }

      const json = await response.json();
      if (!json.secure_url) throw new Error("Cloudinary upload failed");
      return { url: json.secure_url };
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      throw new Error("Cloudinary upload failed");
    }
  };

  // Main handler for sending the email
  const handleSendEmail = async () => {
    try {
      // Immediate payment method check
      if (!connections?.paypal) {
        toast.info("Please connect your Payment account to proceed.");
        toggleStaticMode(true);
        setShowModal(true);
        return; // Stop execution here
      }

      // Only proceed if payment method is connected
      setIsSending(true);
      setSendStatus("generating");

      // Get invoice data
      const invoiceData = getInvoiceFields();

      // Validate user is logged in
      if (!user?._id) {
        toast.error("You must be logged in to send invoices");
        onClose();
        return;
      }

      // Generate PDF
      const pdfBlob = await createPDF();

      // Upload PDF
      const { url: invoiceUrl } = await uploadPDFToCloudinary(pdfBlob);

      setSendStatus("sending");

      // Send to backend
      await axios.post(
        `${API_URL}/send-email`,
        {
          userId: user._id,
          invoiceUrl,
          invoiceFileName: "invoice.pdf",
          ...invoiceData,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      // Success handling
      incrementInvoiceCount();
      setIsComplete(true);
      toggleStaticMode(false);
      setTimeout(onClose, 3000); // Close after 3 seconds
    } catch (error) {
      onClose(); // Close modal on error
      toggleStaticMode(false); // Ensure static mode is toggled off
      setIsComplete(false);
      console.error("Error sending email:", error);
      // Only show error if we actually attempted sending
      if (connections?.paypal) {
        toast.error("Failed to send email. Please try again.");
      }
    } finally {
      toggleStaticMode(false);
    }
  };

  return createPortal(
    <div className="relative">
      {showModal && (
        // Connection Modal
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white rounded-2xl p-6 w-[400px] relative"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-satoshi font-bold lg:text-[1.2vw]">
                Connect Payment Account
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                }}
                className="p-1 hover:bg-neutral-100 border border-neutral-300 rounded-full"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Payment Options */}
            <div className="space-y-3">
              {paymentOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={option.action}
                  className={`w-full flex items-center p-3 rounded-lg transition-colors border ${option.connected
                    ? "border-green-500 bg-green-50 hover:bg-green-100"
                    : "border-neutral-300 hover:bg-neutral-50"
                    }`}
                  disabled={option.connected}
                >
                  <div className="w-12 h-8 mr-3">
                    <img
                      src={option.icon}
                      alt={option.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="font-medium text-base font-satoshi lg:text-[1vw]">
                    {option.connected
                      ? `${option.name} Connected`
                      : `Connect with ${option.name}`}
                  </span>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="text-neutral-400 text-sm flex justify-center items-center space-x-2 font-semibold font-satoshi mt-6 lg:text-[0.9vw]">
              <GoShieldLock size={20} />
              <span>Secure connection via encrypted protocols</span>
            </div>
          </motion.div>
        </div>
      )}

      {isSending && (
        // Sending Process Modal
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm w-full h-full flex justify-center items-center z-[99999]">
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white relative p-8 rounded-xl shadow-lg w-full max-w-md"
          >
            {!isComplete ? (
              <div className="flex flex-col items-center space-y-3">
                <LottieAnimation animationData={getCurrentStep().lottieData} />
                <h3 className="text-xl font-satoshi font-semibold">
                  {getCurrentStep().title}
                </h3>
                <p className="text-gray-600 font-satoshi text-center">
                  {getCurrentStep().text}
                  <AnimatedEllipsis />
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                  <div
                    className="bg-cyan-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${(statusSteps.findIndex((s) => s.status === sendStatus) +
                        1) *
                        33.33
                        }%`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <FaCheck className="text-green-500 text-4xl" />
                <h3 className="text-xl font-satoshi font-semibold">
                  Process Complete!
                </h3>
                <p className="text-gray-600 font-satoshi text-center">
                  Invoice sent successfully
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>,
    document.getElementById("modal-root")
  );
};

export default SendingEmailModal;
