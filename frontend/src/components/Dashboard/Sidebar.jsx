import {
  IoChevronBack,
  IoChevronForward,
  IoSettingsOutline,
} from "react-icons/io5";
import { IoIosArrowRoundForward } from "react-icons/io";
import { LiaFileInvoiceSolid } from "react-icons/lia";
import { TbBrandGoogleAnalytics } from "react-icons/tb";
import { GoPeople } from "react-icons/go";
import { GiTakeMyMoney } from "react-icons/gi";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { useInvoiceStore } from "../../store/invoiceStore";

const SIDEBAR_ITEMS = [
  /*
  {
    name: "Overview",
    icon: TbBrandGoogleAnalytics,
    path: "/dashboard",
  },
  */
  {
    name: "Invoices",
    icon: LiaFileInvoiceSolid,
    path: "/dashboard/invoices",
  },
  /*
  {
    name: "Clients",
    icon: GoPeople,
    path: "/dashboard/clients",
  },
  {
    name: "Payments",
    icon: GiTakeMyMoney,
    path: "/dashboard/payments",
  },
  {
    name: "Settings",
    icon: IoSettingsOutline,
    path: "/dashboard/settings",
  },
  */
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const [isFree, setIsFree] = useState(false)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const { invoiceCount, nextReset, isLoading } =
    useInvoiceStore();

  // Update window width on resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Format reset date once we have periodStart
  const resetDateFormatted = nextReset
    ? new Date(nextReset).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    : "";
  
  // Check if user is on free tier or not
  useEffect(() => {
  const handleFreeTier = () => {
    if (user?.tier === 'free') {
      setIsFree(true);
    } else {
      setIsFree(false);
    }
  };

  handleFreeTier();
}, [user]);

  const isDesktop = windowWidth >= 1024;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;



  // Determine styles based on screen width
  const sidebarWidth = isDesktop
    ? isOpen
      ? "15vw" // Desktop expanded
      : "4vw"  // Desktop collapsed
    : "";      // No sidebar width for tablet or mobile

  const sidebarLinkTop = isDesktop
    ? isOpen
      ? ""      // Custom value if needed when open
      : "2vw"   // Collapsed state
    : "";       // No link top adjustment on tablet or mobile



  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`fixed pr-4 top-[6vw] bottom-0 flex flex-col transition-transform duration-300 z-[1] ${isDesktop ? "block" : "hidden"}`}
        style={{
          width: sidebarWidth,
          paddingTop: isOpen ? "0.5vw" : "0.5vw",
        }}
      >
        <button
          onClick={toggleSidebar}
          className="text-[6vw] lg:text-[1.2vw] rounded-full border border-neutral-500 w-[2vw] h-[2vw] flex justify-center items-center ml-auto"
          title={isOpen ? "Close Sidebar" : "Open Sidebar"}
        >
          {isOpen && isDesktop ? <IoChevronBack /> : <IoChevronForward />}
        </button>
        {/* Sidebar Items */}
        <div
          style={{
            marginTop: sidebarLinkTop,
          }}
        >
          {SIDEBAR_ITEMS.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              isOpen && (
                <Link
                  to={item.path}
                  key={index}
                  className={`flex items-center space-x-[2vw] px-[1vw] py-[4vw] lg:py-[0.7vw] lg:my-[1vw] lg:space-x-1.5 rounded-r-xl ${isActive
                    ? "bg-neutral-600 box  text-MilkWhite"
                    : "bg-transparent text-Gray800"
                    } hover:bg-neutral-600 hover:text-white transition delay-75`}
                  title={item.name}
                >
                  <item.icon className="w-[5vw] h-[5vw] lg:w-[2vw] lg:h-[1.5vw]" />
                  <span className="font-satoshi text-[4vw] lg:text-base">
                    {item.name}
                  </span>
                </Link>
              )
            );
          })}
        </div>

        {isOpen && isFree && (
          <div className="text-Gray800 font-satoshi box ml-4 mt-[1vw] p-3 border border-gray-500 rounded-2xl flex flex-col">
            <h3 className="text-[5vw] font-semibold lg:text-[1.3vw]">
              Free Plan Usage
            </h3>

            {isLoading ? (
              <p className="text-[4vw] lg:text-[0.9vw] mt-[0.5vw]">
                Loading usage…
              </p>
            ) : (
              <>
                {/* Usage Text */}
                <p className="text-[4vw] lg:text-[0.9vw] mt-[0.5vw] mb-2">
                  {invoiceCount} / 10 invoices sent
                </p>

                {/* Progress Meter */}
                <div className="w-full bg-gray-200 rounded-full h-3 lg:h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${invoiceCount >= 8
                      ? "bg-red-500"
                      : invoiceCount >= 5
                        ? "bg-yellow-400"
                        : "bg-green-500"
                      }`}
                    style={{ width: `${(invoiceCount / 10) * 100}%` }}
                  />
                </div>

                {/* Upgrade Text */}
                <button className="mt-3 flex items-center gap-1 text-[4vw] lg:text-[1vw] text-blue-600 font-medium hover:underline lg:mt-2"
                  title="Upgrade Plan"
                  onClick={() => {
                    window.location.href = "/pricing";
                  }}>
                  Upgrade to Pro
                  <IoIosArrowRoundForward size={20} />
                </button>

                {/* Reset Info */}
                <p className="text-[3.5vw] lg:text-[0.8vw] text-gray-500 mt-2">
                  {resetDateFormatted &&
                    `Limit resets on ${resetDateFormatted}`}
                </p>
              </>
            )}
          </div>
        )}

        {/* Logout Button */}
        {/* {isOpen && (
          <div className=" mb-[1vw] lg:mt-auto">
            <button
              className="font-satoshi text-red-600 flex items-center px-[1vw] space-x-1.5"
              title="Logout"
              onClick={() => {
                logout();
                Navigate("/signup");
              }}
            >
              <LogOut
                className="w-[6vw] h-[6vw] lg:w-[2vw] lg:h-[1.5vw]"
                title="logout"
              />
              {isOpen && (
                <span className="text-[4vw] lg:text-base">Logout</span>
              )}
            </button>
          </div>
        )} */}
      </div>

      {/* Tablet Sidebar */}

      <div
        className={`fixed p-2 border-r border-gray-400 top-[6vw] bottom-0 flex flex-col transition-transform duration-300 z-[1] ${isTablet ? "block" : "hidden"}`}
        style={{
          width: "7vw",
          paddingTop: "0.5vw",
        }}
      >
        {/* Sidebar Items */}
        <div
          style={{
            marginTop: "2vw",
          }}
        >
          {SIDEBAR_ITEMS.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                to={item.path}
                key={index}
                className={`flex items-center px-[0.5vw] py-[2vw] ${isActive
                  ? "text-neutral-800"
                  : ""
                  } hover:text-neutral-600 transition delay-75`}
                title={item.name}
              >
                <item.icon className="w-[3vw] h-[3vw]" />
              </Link>
            )
          })}
        </div>

        {/* Logout Button */}
        {/* <div className="mb-[1vw] mt-auto">
          <button
            className="font-satoshi text-red-600 flex items-center px-[0.5vw] space-x-1.5"
            title="Logout"
            onClick={() => {
              logout();
              window.location.href = "/signup";
            }}
          >
            <LogOut
              className="w-[3vw] h-[3vw]"
              title="logout"
            />
          </button>
        </div> */}
      </div>

    </>
  );
};

export default Sidebar;
