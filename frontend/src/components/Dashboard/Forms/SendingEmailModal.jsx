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

import sendingAnimation from "../../../assets/animations/sending.json";
import { useAuthStore } from "../../../store/authStore";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useInvoiceStore } from "../../../store/invoiceStore";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000/api"
    : "/api";

axios.defaults.withCredentials = true;

const SendingEmailModal = ({ onClose, toggleStaticMode }) => {
  const [isComplete, setIsComplete] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState("generating");
  const { user } = useAuthStore();
  const { incrementInvoiceCount } = useInvoiceStore();

  const [emailAddresses, setEmailAddresses] = useState([]);
  const [emailInput, setEmailInput] = useState("");
  const [ccAddresses, setCcAddresses] = useState([]);
  const [ccInput, setCcInput] = useState("");
  const [emailData, setEmailData] = useState({
    subject: "",
    message: "",
    invoiceNumber: "",
    invoiceDate: "",
    dueDate: "",
    invoiceAmount: ""
  });

  const handleEmailKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newEmail = emailInput.trim().replace(/,$/, '');
      if (newEmail && !emailAddresses.includes(newEmail)) {
        setEmailAddresses([...emailAddresses, newEmail]);
        setEmailInput("");
      } else if (newEmail) {
        setEmailInput("");
      }
    }
  };

  const handleRemoveEmail = (indexToRemove) => {
    setEmailAddresses(emailAddresses.filter((_, index) => index !== indexToRemove));
  };

  const handleCcKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newEmail = ccInput.trim().replace(/,$/, '');
      if (newEmail && !ccAddresses.includes(newEmail)) {
        setCcAddresses([...ccAddresses, newEmail]);
        setCcInput("");
      } else if (newEmail) {
        setCcInput("");
      }
    }
  };

  const handleRemoveCc = (indexToRemove) => {
    setCcAddresses(ccAddresses.filter((_, index) => index !== indexToRemove));
  };

  // Disable scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  function getInvoiceFields() {
    const fields = {};
    document.querySelectorAll("[data-invoice-field]").forEach((el) => {
      const key = el.dataset.invoiceField;

      let value = "";
      if (el.tagName === "A" && el.href) {
        value = el.href;
      } else if ("value" in el) {
        value = el.value.trim();
      } else {
        value = el.innerText.trim();
      }
      if (fields[key]) {
        if (key === "description" && value) {
          fields[key] += `, ${value}`;
        } else if (key !== "description") {
          fields[key] = value;
        }
      } else {
        fields[key] = value;
      }
    });
    return fields;
  }

  useEffect(() => {
    const fields = getInvoiceFields();
    
    const emailField = fields.clientEmail || fields.clientAddress;
    const initialEmails = emailField 
      ? emailField.split(',').map(e => e.trim()).filter(e => e)
      : [];
    setEmailAddresses(initialEmails);

    setEmailData({
      subject: `Invoice ${fields.invoiceNumber || ""} from ${fields.companyName || ""}`,
      message: `Dear ${fields.clientName || 'Client'},\n\nI hope this email finds you well.\n\nPlease find attached invoice ${fields.invoiceNumber || ""} for ${fields.description || ""}.\nThe total amount will be ${fields.invoiceAmount || ""}.\n\nIf you have any questions or concerns regarding this invoice, please feel free to reach out.\n\nThank you for your business!\n\nBest regards,\n${fields.companyName || "Proforma Team"}`,
      invoiceNumber: fields.invoiceNumber || "",
      invoiceDate: fields.invoiceDate || "",
      dueDate: fields.dueDate || "",
      invoiceAmount: fields.invoiceAmount || ""
    });
  }, []);

  const statusSteps = [
    {
      status: "generating",
      lottieData: generatingAnimation,
      title: "Generating Invoice",
      text: "Preparing your document",
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

      return () => anim.destroy();
    }, [animationData]);

    return <div ref={animationContainer} style={{ width, height }} />;
  };

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

  const createPDF = async () => {
    try {
      toggleStaticMode(true);
      // Wait for React to render the static mode elements (removes inputs) before capturing
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const invoiceElement = document.getElementById("invoice");
      if (!invoiceElement) throw new Error("Invoice element not found");

      const originalStyle = {
        width: invoiceElement.style.width,
        overflow: invoiceElement.style.overflow,
      };

      invoiceElement.style.width = `${invoiceElement.scrollWidth}px`;
      invoiceElement.style.overflow = "visible";

      // 1. Find all optimal page break positions in DOM pixels
      const containerRect = invoiceElement.getBoundingClientRect();
      const containerHeight = containerRect.height;
      const containerWidth = invoiceElement.offsetWidth;
      
      // Standard A4 height in pixels relative to container width
      const maxPageHeightPx = (containerWidth * 297) / 210;
      
      // Find all elements to keep together
      const candidateElements = [];
      const templateContainer = invoiceElement.firstElementChild;
      if (templateContainer) {
        Array.from(templateContainer.children).forEach(child => {
          candidateElements.push(child);
          if (child.tagName === "TABLE") {
            child.querySelectorAll("tr").forEach(tr => {
              candidateElements.push(tr);
            });
          } else {
            child.querySelectorAll("tr, .grid, .flex").forEach(el => {
              candidateElements.push(el);
            });
          }
        });
      } else {
        invoiceElement.querySelectorAll("tr, div").forEach(el => {
          candidateElements.push(el);
        });
      }

      // Map elements to their top and bottom ranges relative to invoiceElement
      const ranges = candidateElements
        .map(el => {
          const rect = el.getBoundingClientRect();
          return {
            top: rect.top - containerRect.top,
            bottom: rect.bottom - containerRect.top,
            height: rect.height
          };
        })
        .filter(r => r.height > 0 && r.height < maxPageHeightPx);

      // Sort by top coordinate
      ranges.sort((a, b) => a.top - b.top);

      const breaks = [];
      let currentTop = 0;

      while (currentTop + maxPageHeightPx < containerHeight) {
        const targetBottom = currentTop + maxPageHeightPx;
        let bestBreak = targetBottom;

        // Find the first element that crosses the boundary
        for (const range of ranges) {
          if (range.top < targetBottom && range.bottom > targetBottom) {
            if (range.top > currentTop) {
              bestBreak = range.top;
              break;
            }
          }
        }

        breaks.push(bestBreak);
        currentTop = bestBreak;
      }
      breaks.push(containerHeight);

      // 2. Generate canvas
      const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        imageTimeout: 0,
      });

      // Calculate pixel scale (canvas coordinates to DOM coordinates)
      const pixelScale = canvas.width / containerWidth;

      // Create jsPDF document
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      // Add pages slice by slice
      for (let i = 0; i < breaks.length; i++) {
        const breakStart = i === 0 ? 0 : breaks[i - 1];
        const breakEnd = breaks[i];
        const sliceHeight = breakEnd - breakStart;
        
        if (sliceHeight <= 0) continue;

        // Get slice in canvas coordinates
        const startY = breakStart * pixelScale;
        const endY = breakEnd * pixelScale;
        const canvasSliceHeight = sliceHeight * pixelScale;

        // Create a canvas for this slice
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = canvasSliceHeight;
        const ctx = sliceCanvas.getContext("2d");

        // Copy the slice from the original canvas
        ctx.drawImage(
          canvas,
          0,
          startY,
          canvas.width,
          canvasSliceHeight,
          0,
          0,
          canvas.width,
          canvasSliceHeight
        );

        const imgData = sliceCanvas.toDataURL("image/jpeg", 0.6);
        const imgWidth = 210;
        const imgHeight = (canvasSliceHeight * imgWidth) / canvas.width;

        if (i > 0) {
          pdf.addPage();
        }

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
      }

      const blob = pdf.output("blob");

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

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleSendEmail = async () => {
    try {
      setIsSending(true);
      setSendStatus("generating");

      const invoiceData = getInvoiceFields();



      // Allow taking whatever is in input field if they forgot to press Enter
      const finalEmails = [...emailAddresses];
      if (emailInput.trim()) {
         if (!finalEmails.includes(emailInput.trim())) {
            finalEmails.push(emailInput.trim());
         }
      }

      const finalCcEmails = [...ccAddresses];
      if (ccInput.trim()) {
         if (!finalCcEmails.includes(ccInput.trim())) {
            finalCcEmails.push(ccInput.trim());
         }
      }

      if (finalEmails.length === 0) {
         toast.error("At least one client email is required");
         setIsSending(false);
         return;
      }

      const pdfBlob = await createPDF();
      const pdfBase64 = await blobToBase64(pdfBlob);

      setSendStatus("sending");

      await axios.post(
        `${API_URL}/send-email`,
        {
          userId: user?._id || 'guest',
          pdfBase64,
          invoiceFileName: "invoice.pdf",
          ...invoiceData,
          clientAddress: finalEmails.join(', '),
          ccAddresses: finalCcEmails.join(', '),
          subject: emailData.subject,
          message: emailData.message,
          invoiceNumber: emailData.invoiceNumber || invoiceData.invoiceNumber,
          invoiceDate: emailData.invoiceDate || invoiceData.invoiceDate,
          dueDate: emailData.dueDate || invoiceData.dueDate,
          invoiceAmount: emailData.invoiceAmount || invoiceData.invoiceAmount
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      // Increment reference counter for InvoiceTemplate5
      const currentRefCounter = localStorage.getItem("proforma_invoice_reference_counter");
      const nextRefCounter = (currentRefCounter ? parseInt(currentRefCounter, 10) : 234) + 1;
      localStorage.setItem("proforma_invoice_reference_counter", nextRefCounter);
      window.dispatchEvent(new Event("invoice_reference_incremented"));

      incrementInvoiceCount();
      setIsComplete(true);
      toggleStaticMode(false);
      setTimeout(onClose, 3000);
    } catch (error) {
      onClose();
      toggleStaticMode(false);
      setIsComplete(false);
      console.error("Error sending email:", error);
      toast.error("Failed to send email. Please try again.");
    } finally {
      toggleStaticMode(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmailData(prev => ({ ...prev, [name]: value }));
  };

  return createPortal(
    <div className="relative">
      {!isSending && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[99999]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl p-8 w-[95vw] h-[95vh] max-w-6xl flex flex-col relative shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-satoshi font-bold text-gray-800">
                Compose Email
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 flex flex-col gap-4 min-h-0">
              <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-y-auto pr-2 pb-2">
                
                {/* Left Column */}
                <div className="w-full lg:w-1/2 flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To (Client Emails)</label>
                <div 
                  className="w-full p-2 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-cyan-500 focus-within:border-cyan-500 transition-all flex flex-wrap gap-2 items-center min-h-[48px] bg-white shadow-sm cursor-text"
                  onClick={() => document.getElementById('email-chip-input')?.focus()}
                >
                  {emailAddresses.map((email, index) => (
                    <span key={index} className="flex items-center gap-1.5 bg-cyan-50 border border-cyan-200 text-cyan-800 px-2.5 py-1 rounded text-sm font-medium transition-colors">
                      {email}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveEmail(index)} 
                        className="text-cyan-600 hover:text-cyan-900 hover:bg-cyan-100 rounded-full w-4 h-4 flex items-center justify-center transition-colors focus:outline-none"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                  <input
                    id="email-chip-input"
                    type="text"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyDown={handleEmailKeyDown}
                    className="flex-1 outline-none min-w-[150px] text-sm bg-transparent py-1 text-gray-800"
                    placeholder={emailAddresses.length === 0 ? "client1@example.com" : ""}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Press Enter or comma to add multiple emails</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CC</label>
                <div 
                  className="w-full p-2 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-cyan-500 focus-within:border-cyan-500 transition-all flex flex-wrap gap-2 items-center min-h-[48px] bg-white shadow-sm cursor-text"
                  onClick={() => document.getElementById('cc-chip-input')?.focus()}
                >
                  {ccAddresses.map((email, index) => (
                    <span key={index} className="flex items-center gap-1.5 bg-cyan-50 border border-cyan-200 text-cyan-800 px-2.5 py-1 rounded text-sm font-medium transition-colors">
                      {email}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveCc(index)} 
                        className="text-cyan-600 hover:text-cyan-900 hover:bg-cyan-100 rounded-full w-4 h-4 flex items-center justify-center transition-colors focus:outline-none"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                  <input
                    id="cc-chip-input"
                    type="text"
                    value={ccInput}
                    onChange={(e) => setCcInput(e.target.value)}
                    onKeyDown={handleCcKeyDown}
                    className="flex-1 outline-none min-w-[150px] text-sm bg-transparent py-1 text-gray-800"
                    placeholder="cc@example.com"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Press Enter or comma to add multiple emails</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={emailData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                  placeholder="Invoice Subject"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice No</label>
                  <input
                    type="text"
                    name="invoiceNumber"
                    value={emailData.invoiceNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                    placeholder="INV-234"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                  <input
                    type="text"
                    name="invoiceDate"
                    value={emailData.invoiceDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                    placeholder="DD/MM/YYYY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="text"
                    name="dueDate"
                    value={emailData.dueDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                    placeholder="DD/MM/YYYY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                  <input
                    type="text"
                    name="invoiceAmount"
                    value={emailData.invoiceAmount}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                    placeholder="$0.00"
                  />
                </div>
              </div>
                </div>

                {/* Right Column */}
                <div className="w-full lg:w-1/2 flex flex-col min-h-[250px] lg:min-h-0">
                  <div className="flex-1 flex flex-col h-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      name="message"
                      value={emailData.message}
                      onChange={handleChange}
                      className="flex-1 w-full h-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all resize-none min-h-[150px] lg:min-h-0"
                      placeholder="Enter your message..."
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex justify-end gap-4 mt-2 border-t border-gray-100">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEmail}
                  className="px-8 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-medium transition-colors shadow-sm"
                >
                  Send Invoice
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {isSending && (
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
                      width: `${(statusSteps.findIndex((s) => s.status === sendStatus) + 1) * 33.33}%`,
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
