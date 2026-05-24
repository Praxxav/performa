import { useState } from "react";
import { HiArrowRight, HiOutlineMenuAlt3 } from "react-icons/hi";
import Logo from "../../assets/Images/P-removebg-preview.png";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const [menuVisible, setMenuVisible] = useState(false); // Tracks whether the menu is visible

  // const toggleMenu = () => {
  //   if (isOpen) {
  //     // When closing, delay hiding the menu to allow slide-out animation
  //     setIsOpen(false);
  //     setTimeout(() => setMenuVisible(false), 500); // Match this timeout with the CSS animation duration
  //   } else {
  //     setMenuVisible(true);
  //     setIsOpen(true);
  //   }
  // };

  // Toggle body scroll lock
  if (isOpen) {
    document.body.style.overflow = "hidden"; // Disable scroll
  } else {
    document.body.style.overflow = "auto"; // Enable scroll
  }

  const handleGenerate = () => {
    navigate("/signup");
  };

  return (
    <nav className="text-Gray800 bg-[#F5F5F2] fixed top-0 left-0 w-full z-[20]">
      <div className="container mx-auto flex items-center justify-between p-2 lg:p-3 lg:my-[0.1vw]">
        {/* Logo */}
        <div>
          <a href="/" className="flex items-center">
            <img
              src={Logo}
              alt="Profoma Logo"
              className="w-[17vw] h-[17vw] md:w-[7vw] md:h-[7vw] lg:w-[5vw] lg:h-[5vw]"
            />
            <span className="font-clash text-[6vw] text-black md:text-[30px] lg:text-[1.5vw]">
              Proforma
            </span>
          </a>
        </div>

        {/* Desktop Menu */}
        {/* <ul className="hidden lg:flex space-x-8 text-lg font-medium">
          <li>
            <a
              href="#features"
              className="hover:text-gray-600 text-Gray800 font-satoshi"
            >
              Features
            </a>
          </li>
          <li>
            <a
              href="#pricing"
              className="hover:text-gray-600 text-Gray800 font-satoshi"
            >
              Pricing
            </a>
          </li>
          <li>
            <a
              href=""
              className="hover:text-gray-600 text-Gray800 font-satoshi"
            >
              Contact
            </a>
          </li>
        </ul> */}

        <button
          onClick={handleGenerate}
          type="submit"
          className="px-[4vw] py-[2vw] flex gap-[1.2vw] items-center font-satoshi font-bold border border-neutral-500 rounded-3xl box md:px-[2vw] md:py-[0.5vw] lg:px-[1.5vw] lg:py-[0.5vw] lg:gap-x-[0.5vw]"
        >
          <span className="text-[4vw] md:text-lg lg:text-[1vw]">Generate</span>
          <HiArrowRight size={18} />
        </button>

        {/* Hamburger Menu */}
        {/* <div className="lg:hidden">
          <button
            onClick={toggleMenu}
            className="outline-none border-none bg-transparent w-[10vw] h-[10vw] text-Gray800 flex justify-center items-center"
          >
            <HiOutlineMenuAlt3 className="text-[8vw] md:text-[4vw]" />
          </button>
        </div> */}
      </div>

      {/* Mobile Overlay Menu */}
      {/* {menuVisible && (
        <div
          className={`mobile-menu ${
            isOpen ? "slide-in" : "slide-out"
          } fixed inset-0 text-Gray800 bg-[#F5F5F2] flex flex-col items-center justify-center z-50 lg:hidden`}
        >
          <button
            onClick={toggleMenu}
            className="absolute top-5 right-5 outline-none border-none bg-transparent w-[10vw] h-[10vw] text-Gray800 flex justify-center items-center"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <ul className="space-y-8 text-2xl font-semibold">
            <li>
              <a href="#features" className="font-satoshi" onClick={toggleMenu}>
                Features
              </a>
            </li>
            <li>
              <a href="#pricing" className="font-satoshi" onClick={toggleMenu}>
                Pricing
              </a>
            </li>
            <li>
              <a href="" className="font-satoshi" onClick={toggleMenu}>
                Contact
              </a>
            </li>
            <li>
              <Link
                to="/signup"
                className="flex items-center gap-3 font-satoshi"
                onClick={toggleMenu}
              >
                <span> Sign up</span>
                <HiArrowRight size={24} className="-rotate-45" />
              </Link>
            </li>
          </ul>
        </div>
      )} */}
    </nav>
  );
};

export default Navbar;
