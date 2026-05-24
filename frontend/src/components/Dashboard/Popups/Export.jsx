import { useEffect, useRef, useState } from "react";
import { AiOutlineFilePdf } from "react-icons/ai";
import { MdOutlineAttachEmail } from "react-icons/md";
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
  const isEmailLocked = false;
    // selectedOption === "email" && user?.tier === "free" && invoiceCount >= 10;

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
    // if (isEmailLocked) {
    //   // Redirect free user to upgrade
    //   return navigate("/upgrade");
    // }
    // Otherwise perform the normal export
    handleExport();
  };

  // Button is disabled only if nothing is selected, or we're exporting
  const isDisabled = !selectedOption || isExporting;

  return (
    <div
      className="absolute z-[10] top-[13vw] right-0 mt-[1vw] w-80 bg-white text-black rounded-xl shadow-lg md:top-[6vw] md:w-[40vw] lg:w-[25vw] lg:top-[3vw] lg:rounded-lg animate-moveUp"
    >
      <div className="bg-white py-[6vw] px-[3vw] rounded-xl md:py-[2vw] md:px-[1.5vw] lg:py-[2vw] lg:px-[1vw] lg:rounded-lg">
        {/* Export as PDF */}
        <div className="flex items-center justify-between mb-4">
          <label htmlFor="pdf" className="flex items-center space-x-2">
            <AiOutlineFilePdf size={30} className="text-teal-600" />
            <div className="flex flex-col">
              <span className="text-[4vw] text-teal-600 font-satoshi md:text-sm lg:text-[1vw]">
                Export as PDF
              </span>
              <span className="text-[4vw] text-gray-500 font-satoshi md:text-sm lg:text-[0.8vw]">
                Standard document format
              </span>
            </div>
          </label>
          <input
            type="checkbox"
            id="pdf"
            checked={selectedOption === "pdf"}
            onChange={() => handleCheckboxChange("pdf")}
            className="w-4 h-4 accent-cyan-700"
          />
        </div>

        {/* Export and Email */}
        {/*
        <div className="flex items-center justify-between space-x-2 mb-6">
          <label htmlFor="email" className="flex items-center space-x-2">
            <MdOutlineAttachEmail size={30} className="text-zinc-900" />
            <div className="flex flex-col">
              <span className="text-[4vw] text-zinc-800 font-satoshi md:text-sm lg:text-[1vw]">
                Generate and send as Email
              </span>
              <span className="text-[4vw] text-gray-500 font-satoshi md:text-sm lg:text-[0.8vw]">
                Send to clients via email
              </span>
            </div>
          </label>
          <input
            type="checkbox"
            id="email"
            checked={selectedOption === "email"}
            onChange={() => handleCheckboxChange("email")}
            className="w-4 h-4 accent-cyan-700"
          />
        </div>
        */}

        {/* Export Button */}
        <button
          onClick={onClick}
          disabled={isDisabled}
          className={`
        w-full box px-4 font-satoshi box py-2 text-white rounded-xl
        ${isDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-cyan-700"}
      `}
        >
          {label}
        </button>
      </div>
    </div>
  );
};

export default Export;
