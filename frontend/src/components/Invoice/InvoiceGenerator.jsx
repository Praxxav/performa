import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { IoIosArrowDown } from "react-icons/io";
import TextEditor from "../Toolbar/TextEditor";
import DownloadPopup from "../Dashboard/Popups/DownloadPopup";
import { PiExportLight } from "react-icons/pi";
import InvoiceTemplateSelector from "./InvoiceTemplateSelector";
import InvoiceTemplate1 from "./InvoiceTemplates/InvoiceTemplate1";
import Export from "../Dashboard/Popups/Export";
import SendingEmailModal from "../Dashboard/Forms/SendingEmailModal";

// Click Outside Hook
const useClickOutside = (handler) => {
  const ref = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        handler();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handler]);

  return ref;
};

const InvoiceGenerator = () => {
  const [isStaticMode, setIsStaticMode] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const invoiceRef = useRef(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [showSendingModal, setSendingModal] = useState(false);
  const [sendModalKey, setSendModalKey] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const toggleStaticMode = (value) => {
    setIsStaticMode(value);
  };


  const toggleExport = () => {
    setIsExportOpen(!isExportOpen);
  };

  const toggleDownload = () => {
    setIsDownloadOpen(!isDownloadOpen);
  };

  const handleSendingEmailModal = () => {
    setSendingModal(true);
    toggleExport();
    setSendModalKey((prev) => prev + 1); // triggers remount
  };

  const handleEmailModalClose = () => {
    setSendingModal(false);
  };

  const downloadDropdownRef = useClickOutside(() => setIsDownloadOpen(false));
  const exportDropdownRef = useClickOutside(() => setIsExportOpen(false));

  // Disable scrolling when the modal is open
  useEffect(() => {
    if (showSendingModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showSendingModal]);

  const handleTemplateSelection = (template) => {
    setSelectedTemplate(template);

    // Scroll to the invoice template container
    if (invoiceRef.current) {
      window.scrollTo({
        top: 0,
        behavior: "auto",
      });
    }
  };

  const exportToPDF = async () => {
    toggleStaticMode(true); // Convert to static text before exporting
    setIsExporting(true);

    setTimeout(() => {
      const invoiceElement = document.getElementById("invoice");

      html2canvas(invoiceElement, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");

        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        pdf.save("invoice.pdf");

        toggleStaticMode(false); // Revert back to editable fields
        setIsExporting(false);
        toggleExport();
      });
    }, 500);
  };

  const handleDownloadPNG = () => {
    setIsDownloading(true);
    toggleStaticMode(true); // Convert to static text before exporting

    setTimeout(() => {
      const invoiceElement = document.getElementById("invoice");

      html2canvas(invoiceElement, { scale: 1.3 }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png", 0.1);
        const link = document.createElement("a");
        link.href = imgData;
        link.download = "invoice.png";
        link.click();
        toggleStaticMode(false); // Revert back to editable fields
        setIsDownloading(false);
        toggleDownload();
      });
    }, 500);
  };

  const handleDownloadJPG = () => {
    setIsDownloading(true);
    toggleStaticMode(true); // Convert to static text before exporting

    setTimeout(() => {
      const invoiceElement = document.getElementById("invoice");

      html2canvas(invoiceElement, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL("image/jpg", 1);
        const link = document.createElement("a");
        link.href = imgData;
        link.download = "invoice.jpg";
        link.click();
        toggleStaticMode(false); // Revert back to editable fields
        setIsDownloading(false);
        toggleDownload();
      });
    }, 500);
  };

  const handleFormat = (command, value = null) => {
    if (command === "undo" || command === "redo") {
      document.execCommand(command, false, null);
    } else if (command === "formatBlock") {
      document.execCommand(command, false, value);
    } else {
      document.execCommand(command, false, null);
    }
  };

  return (
    <div className="">
      <div className="fixed bg-[#F5F5F2] p-[1vw] top-[16vw] right-0 left-0 md:top-[4vw] md:left-[8vw] lg:left-[15vw] lg:top-[6vw] z-[1]">
        <div className="flex flex-col gap-3 justify-between pb-5 md:py-7 md:pb-0 md:items-center md:flex-row lg:py-0">
          <TextEditor onFormat={handleFormat} />
          <div className="flex items-center px-[1vw] space-x-[3vw] md:space-x-[1vw]">
            <div className="relative" ref={downloadDropdownRef}>
              <button
                onClick={toggleDownload}
                className="flex items-center text-[4vw] font-satoshi gap-2 bg-cyan-700 box text-white px-4 py-2 rounded-xl md:text-base lg:py-3 lg:text-[1vw]"
              >
                <Download size={16} />
                <span className="border-r pr-[2vw] border-white h-full md:pr-[0.8vw]">
                  Download Invoice
                </span>
                <IoIosArrowDown
                  size={16}
                  className={`transition-transform duration-300 ${isDownloadOpen ? "rotate-180" : "rotate-0"
                    }`}
                />
              </button>
              {isDownloadOpen && (
                <DownloadPopup
                  onDownloadPNG={handleDownloadPNG}
                  onDownloadJPG={handleDownloadJPG}
                  isDownloading={isDownloading}
                />
              )}
            </div>

            <div className="relative" ref={exportDropdownRef}>
              <button
                onClick={toggleExport}
                className="flex items-center box text-[4vw] font-satoshi gap-2 px-4 py-2 rounded-xl text-white bg-indigo-700 md:text-base lg:py-3 lg:text-[1vw]"
              >
                <PiExportLight size={20} />
                <span className="border-r pr-[2vw] border-white h-full md:pr-[0.8vw]">
                  Export
                </span>
                <IoIosArrowDown
                  size={16}
                  className={`transition-transform duration-300 ${isExportOpen ? "rotate-180" : "rotate-0"
                    }`}
                />
              </button>
              {isExportOpen && (
                <Export
                  onExportPDF={exportToPDF}
                  onExportEmail={handleSendingEmailModal}
                  isExporting={isExporting}
                />
              )}
            </div>
            {showSendingModal && (
              <SendingEmailModal
                key={sendModalKey}
                onClose={handleEmailModalClose}
                toggleStaticMode={toggleStaticMode}
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-between mr-[1vw] lg:space-x-[2vw] lg:flex-row">
        {/* Invoice Templates */}
        <div className="mt-[35vw] border border-neutral-400 rounded-3xl box overflow-y-scroll scrollbar-hide md:mt-[10vw] lg:sticky lg:w-1/4 lg:top-[25vh] lg:h-[70vh] lg:mt-[5vw]">
          <div className="z-[1] bg-[#F5F5F2] lg:sticky lg:top-0">
            <h1 className="text-[6vw] text-center font-bold font-satoshi py-3 md:text-[3vw] lg:text-[1.3vw]">
              Choose an Invoice Template
            </h1>
          </div>
          <InvoiceTemplateSelector onSelectTemplate={handleTemplateSelection} />
        </div>
        {/* Invoice Canvass */}
        <div
          ref={invoiceRef}
          id="invoice"
          className="w-full overflow-auto scrollbar-hide mt-[5vw] p-[30px] bg-white shadow-lg lg:w-3/4"
        >
          {selectedTemplate ? (
            <selectedTemplate.component
              isStaticMode={isStaticMode}
              setIsStaticMode={setIsStaticMode}
            />
          ) : (
            <InvoiceTemplate1
              isStaticMode={isStaticMode}
              setIsStaticMode={setIsStaticMode}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;
