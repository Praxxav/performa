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

    setTimeout(async () => {
      try {
        const invoiceElement = document.getElementById("invoice");
        if (!invoiceElement) throw new Error("Invoice element not found");

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
        const pdf = new jsPDF("p", "mm", "a4");

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

          const imgData = sliceCanvas.toDataURL("image/png");
          const imgWidth = 210;
          const imgHeight = (canvasSliceHeight * imgWidth) / canvas.width;

          if (i > 0) {
            pdf.addPage();
          }

          pdf.addImage(
            imgData,
            "PNG",
            0,
            0,
            imgWidth,
            imgHeight,
            undefined,
            "FAST"
          );
        }

        pdf.save("invoice.pdf");
      } catch (error) {
        console.error("Error creating PDF:", error);
      } finally {
        toggleStaticMode(false); // Revert back to editable fields
        setIsExporting(false);
        toggleExport();
      }
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
            {/* <div className="relative" ref={downloadDropdownRef}>
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
            </div> */}

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
