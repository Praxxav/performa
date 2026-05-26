import { useEffect, useRef, useState } from "react";
import { MdOutlineEmail } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { useInvoiceStore } from "../../../store/invoiceStore";

const Export = ({ onExportPDF, onExportEmail, isExporting }) => {
  const [selectedOption, setSelectedOption] = useState("");
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { invoiceCount } = useInvoiceStore();

  const handleCheckboxChange = (option) => {
    setSelectedOption((prev) => (prev === option ? "" : option));
  };

  const handleExport = () => {
    if (selectedOption === "pdf") {
      onExportPDF();
    } else if (selectedOption === "email") {
      onExportEmail();
    }
  };

  // Free‑tier email lock
  const isEmailLocked =
    selectedOption === "email" && user?.tier === "free" && invoiceCount >= 10;

  // Decide the button label
  let label;
  if (isEmailLocked) {
    label = "Upgrade Plan";
  } else if (isExporting) {
    if (selectedOption === "email") {
      label = "Generating and Sending...";
    } else if (selectedOption === "pdf") {
      label = "Generating and Exporting PDF...";
    } else {
      label = "Processing...";
    }
  } else {
    if (selectedOption === "email") {
      label = "Generate and Send Mail";
    } else if (selectedOption === "pdf") {
      label = "Export as PDF";
    } else {
      label = "Select an Option";
    }
  }

  // Handle click
  const onClick = () => {
    if (isEmailLocked) {
      return navigate("/upgrade");
    }
    handleExport();
  };

  const isDisabled = !selectedOption || isExporting;

  return (
    <div
      className="absolute z-[999] top-full left-0 md:left-auto md:right-0 mt-2 w-[85vw] max-w-[300px] bg-white text-black rounded-xl shadow-2xl border border-gray-100 animate-moveUp"
    >
      <div className="p-4">
        {/* Export and Email */}
        <div className="flex items-start justify-between space-x-3 mb-4">
          <label htmlFor="email" className="flex items-start space-x-2.5 cursor-pointer select-none">
            <MdOutlineEmail size={26} className="text-indigo-600 mt-0.5 shrink-0" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-800 font-satoshi leading-tight">
                Generate and send as Email
              </span>
              <span className="text-xs text-gray-500 font-satoshi mt-1 leading-normal">
                Send to clients via email
              </span>
            </div>
          </label>
          <input
            type="checkbox"
            id="email"
            checked={selectedOption === "email"}
            onChange={() => handleCheckboxChange("email")}
            className="w-4 h-4 mt-1 accent-indigo-600 rounded cursor-pointer"
          />
        </div>

        {/* Export Button */}
        <button
          onClick={onClick}
          disabled={isDisabled}
          className={`
            w-full px-4 py-2.5 text-sm font-semibold font-satoshi text-white rounded-lg transition-all duration-200
            ${isDisabled ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-sm"}
          `}
        >
          {label}
        </button>
      </div>
    </div>
  );
};

export default Export;
