import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, CheckCircle } from "lucide-react";
import Logo from "../../assets/Images/P-removebg-preview.png";
// import { GoSearch } from "react-icons/go";
import { CiBellOn } from "react-icons/ci";
import { useAuthStore } from "../../store/authStore";

const Header = () => {
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [animate, setAnimate] = useState(false);
  const navigate = useNavigate();

  const toggleAlerts = () => {
    setIsAlertsOpen(!isAlertsOpen);

    // Trigger the animation
    setAnimate(true);
    setTimeout(() => setAnimate(false), 500); // Remove class after animation duration
  };

  const { user } = useAuthStore();

  const getInitials = (name) => {
    if (!name) return "";
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    // Use first letter of first and last words for initials
    return (
      words[0].charAt(0).toUpperCase() +
      words[words.length - 1].charAt(0).toUpperCase()
    );
  };

  return (
    <div className="relative">
      <div className="fixed top-0 left-0 right-0 z-[50] py-2 px-5 bg-[#F5F5F2] md:p-0">
        <div className="flex items-center justify-between lg:p-1">
          {/* Logo */}
          <div className="flex items-center">
            <img
              src={Logo}
              alt="Profoma Logo"
              className="w-[15vw] h-[15vw] md:w-[7vw] md:h-[7vw] lg:w-[5.5vw] lg:h-[5.5vw]"
            />
            <span className="font-clash text-[5vw] text-black md:text-[20px] lg:text-2xl">
              Bestypop Proforma 
            </span>
          </div>

          {/* Search
          <div className="ml-4 relative">
            <label htmlFor="search-input" className="sr-only">
              Search
            </label>
            <input
              id="search-input"
              type="text"
              placeholder="Search"
              className="bg-transparent text-Gray800 font-satoshi px-3 py-2 rounded-md pl-10 w-64 border border-gray-400 outline-none hover:outline hover:outline-2 hover:outline-neutral-700 focus:outline focus:outline-2 focus:outline-neutral-700 lg:w-[25vw] lg:rounded-xl"
            />
            <GoSearch className="absolute left-3 top-3 text-gray-900" />
          </div> */}

          {/* Right side buttons */}
          <div className="flex items-center gap-[3vw] md:gap-[0.8vw]">
            {/* Alerts Button */}
            {/*
            <div className="relative">
              <button
                title="What's New"
                className="w-10 h-10 flex justify-center items-center border border-neutral-500 box rounded-lg md:w-10 md:h-9 lg:w-9 lg:h-9"
                onClick={toggleAlerts}
                aria-haspopup="true"
                aria-expanded={isAlertsOpen}
              >
                <CiBellOn size={27} className={` ${animate ? "shake" : ""}`} />
              </button>
              {isAlertsOpen && (
                <div className="absolute right-0 mt-4 w-[280px] bg-MilkWhite text-black font-satoshi rounded-xl shadow-lg p-4 md:w-72 lg:rounded-lg lg:w-[25vw] animate-moveUp">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-[4.2vw] font-semibold md:text-base lg:text-[1.2vw]">
                      Notifications
                    </h2>
                    <div className="flex space-x-2">
                      <button title="Filter">
                        <Filter size={20} />
                      </button>
                      <button title="Mark as read">
                        <CheckCircle size={20} />
                      </button>
                    </div>
                  </div>
                  <p className="text-[3.5vw] text-center text-gray-600 md:text-base lg:text-[1vw]">
                    No new notifications
                  </p>
                </div>
              )}
            </div>
            */}

            {/* User Profile */}
            {/*
            <button
              title="User Profile"
              className="w-10 h-10 flex justify-center items-center border border-neutral-500 box rounded-lg md:w-10 md:h-9 lg:w-9 lg:h-9"
              onClick={() => navigate("/dashboard/settings")}
            >
              <span className="text-[4vw] font-satoshi font-bold md:text-base lg:text-[1.1vw]">
                {getInitials(user?.name) || ""}
              </span>
            </button>
            */}

            {/* Connect account button */}
            {/*
            <span className="hidden md:block">
              <AccountConnectionModal />
            </span>
            */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
