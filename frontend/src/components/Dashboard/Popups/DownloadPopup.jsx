import { useEffect, useRef, useState } from "react";
import { AiOutlineFileJpg } from "react-icons/ai";
import { PiCrownFill, PiFilePng } from "react-icons/pi";

const DownloadPopup = ({ onDownloadPNG, onDownloadJPG, isDownloading }) => {
  const [selectedFormats, setSelectedFormats] = useState("");

  const handleCheckboxChange = (format) => {
    setSelectedFormats((prev) => (prev === format ? "" : format));
  };

  const handleDownload = () => {
    if (selectedFormats === "png") {
      onDownloadPNG();
    }
    if (selectedFormats === "jpg") {
      onDownloadJPG();
    }
  };

  return (
    <div className="absolute z-[10] top-[13vw] mt-[1vw] w-80 bg-white text-black rounded-xl shadow-lg md:w-[40vw] md:top-[6vw] md:right-0 lg:top-[3vw] lg:w-[25vw] lg:rounded-lg animate-moveUp">
      <div className="bg-white py-[6vw] px-[3vw] rounded-xl md:py-[2vw] md:px-[1.5vw] lg:py-[2vw] lg:px-[1vw] lg:rounded-lg">
        <h2 className="text-[5.5vw] font-satoshi font-bold mb-4 md:text-lg lg:text-[1.5vw]">
          Choose Quality
        </h2>

        {/* PNG Checkbox */}
        <div className="flex items-center justify-between mb-4">
          <label htmlFor="png" className="flex items-center space-x-2">
            <PiFilePng size={30} />
            <div className="flex flex-col">
              <span className="text-[4vw] text-teal-600 font-satoshi md:text-sm lg:text-[1vw]">
                Download as PNG
              </span>
              <span className="text-[4vw] text-gray-500 font-satoshi md:text-sm lg:text-[0.8vw]">
                Lower quality and size
              </span>
            </div>
          </label>
          <input
            type="checkbox"
            id="png"
            checked={selectedFormats === "png"}
            onChange={() => handleCheckboxChange("png")}
            className="w-4 h-4 accent-sky-800"
          />
        </div>

        {/* JPG Checkbox */}
        <div className="flex items-center justify-between space-x-2 mb-6">
          <label htmlFor="jpg" className="flex items-center space-x-2">
            <AiOutlineFileJpg size={30} />
            <div className="flex flex-col">
              <div className="text-[4vw] text-indigo-400 font-satoshi flex items-center gap-[0.5vw] md:text-sm lg:text-[1vw]">
                Download as JPG
                <PiCrownFill size={20} className="text-yellow-300" />
              </div>
              <span className="text-[4vw] text-gray-500 font-satoshi md:text-sm lg:text-[0.8vw]">
                Best quality and bigger file size
              </span>
            </div>
          </label>
          <input
            type="checkbox"
            id="jpg"
            checked={selectedFormats === "jpg"}
            onChange={() => handleCheckboxChange("jpg")}
            className="w-4 h-4 accent-sky-800"
          />
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={!selectedFormats}
          className={`w-full px-4 font-satoshi box py-2 text-white rounded-xl ${
            !selectedFormats ? "bg-gray-400 cursor-not-allowed" : "bg-cyan-700"
          } ${
            isDownloading ? "bg-gray-400 cursor-not-allowed" : "bg-cyan-700"
          }`}
        >
          <span>
            {isDownloading
              ? selectedFormats === "png"
                ? "Downloading PNG..."
                : selectedFormats === "jpg"
                ? "Downloading JPG..."
                : "Downloading..."
              : selectedFormats === "png"
              ? "Download as PNG"
              : selectedFormats === "jpg"
              ? "Download as JPG"
              : "Choose download option"}
          </span>
        </button>
      </div>
    </div>
  );
};

export default DownloadPopup;
