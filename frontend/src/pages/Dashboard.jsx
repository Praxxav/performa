import { useEffect, useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Sidebar from "../components/Dashboard/Sidebar";
import Header from "../components/Dashboard/Header";
import Overview from "./Overview";
import Invoices from "./Invoices";
import Clients from "./Clients";
import Settings from "./Settings";
import Payments from "./Payments";
import MobileNavigation from "../components/Dashboard/MobileNavigation";

const Dashboard = () => {
  const year = new Date().getFullYear();
  const [isSidebarOpen, setIsSidebarOpen] = useState("false");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Update window width on resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isDesktop = windowWidth >= 1024;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isMobile = windowWidth < 768;

  // Main content width
  const mainWidth = isMobile
    ? "100%" // Sidebar overlays, no width reduction
    : isTablet
      ? "calc(100% - 8vw)" // Tablet fixed width
      : isSidebarOpen
        ? "calc(100% - 17vw)" // Desktop open
        : "calc(100% - 4vw)"; // Desktop collapsed

  // Main content margin-left
  const mainMarginLeft = isMobile
    ? "0" // Sidebar overlays
    : isTablet
      ? "8vw" // Fixed left margin for tablet
      : isSidebarOpen
        ? "17vw"
        : "4vw";


  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [isMobile]);

  return (
    <div>
      <div className="bg-transparent">
        <Header />
        <div>
          {/* Sidebar */}
          <Sidebar
            isOpen={isSidebarOpen}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          {/* Main Content */}
          <div
            className="flex flex-col"
            style={{
              marginLeft: mainMarginLeft,
              width: mainWidth,
            }}
          >
            <div className="mt-[19vw] p-3 md:p-4 md:mt-[8vw] lg:p-0 lg:mt-[8vw]">
              <Routes>
                <Route path="/" element={<Navigate to="invoices" replace />} />
                <Route path="invoices" element={<Invoices />} />
                <Route path="clients" element={<Clients />} />
                {/* <Route path="payments" element={<Payments />} /> */}
                <Route path="settings" element={<Settings />} />
              </Routes>
            </div>
            <div className="pr-[2vw] mb-[30vw] md:pb-[1vw] md:mb-0">
              <p className="text-[4vw] text-Gray800 font-satoshi mt-2 pt-4 flex justify-center space-x-[1vw] items-center md:text-sm lg:text-base">
                Proforma © {year} &nbsp;
                <span className="text-[4vw] font-satoshi md:text-sm lg:text-base">
                  All Rights Reserved
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* <MobileNavigation /> */}
    </div>
  );
};

export default Dashboard;
