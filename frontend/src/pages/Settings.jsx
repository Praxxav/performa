import { useAuthStore } from "../store/authStore";
import Paypal from "../assets/Images/Account Icons/PayPal_Logo_Icon_2014.svg";
import flutter from "../assets/Images/Account Icons/full.svg";
import stripe from "../assets/Images/Account Icons/Logotype (1).svg";
import paystack from "../assets/Images/Account Icons/images (1).png";
import skrill from "../assets/Images/Account Icons/Skrill.svg";
import googlepay from "../assets/Images/Account Icons/GooglePay.svg";
import { UsePaymentHandlers } from "../hooks/UsePaymentHandlers";
import { IoCheckmarkOutline } from "react-icons/io5";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { FiUpload } from "react-icons/fi";
import { RiDeleteBin6Line, RiLoader4Line } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { useInvoiceStore } from "../store/invoiceStore";
import { IoIosArrowRoundForward } from "react-icons/io";
import AccountConnectionModal from "../components/Dashboard/Connections/AccountConnectionModal";
import { motion } from "framer-motion";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000/settings"
    : "https://proforma-sohi.vercel.app/settings";

axios.defaults.withCredentials = true;

const Settings = () => {
  const { connections, user, logout, clearUser } = useAuthStore();
  const { handlers } = UsePaymentHandlers();
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFree, setIsFree] = useState(false)
  // State for form fields
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    city: "",
    country: "",
    state: "",
    phoneNumber: "",
  });
  const { invoiceCount, nextReset, isLoading } =
    useInvoiceStore();

  // State for logo
  const [logoUrl, setLogoUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  // navigate function to redirect to another page
  const navigate = useNavigate();

  // Load user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${API_URL}/user-settings`);
        const userData = response.data;

        setFormData({
          businessName: userData.businessName || "",
          email: userData.email || "",
          city: userData.city || "",
          country: userData.country || "",
          state: userData.state || "",
          phoneNumber: userData.phoneNumber || "",
        });

        if (userData.logoUrl) {
          setLogoUrl(userData.logoUrl);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load your settings. Please refresh the page.");
      }
    };

    fetchUserData();
  }, []);

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

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle logo upload
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/svg+xml",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, GIF, SVG)");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2MB");
      return;
    }

    try {
      setIsUploading(true);

      // Create form data for upload
      const formData = new FormData();
      formData.append("logo", file);

      // Upload to server which will handle Cloudinary upload
      const response = await axios.post(`${API_URL}/upload-logo`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Set the logo URL from response
      setLogoUrl(response.data.logoUrl);
      toast.success("Logo uploaded successfully");
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Failed to upload logo. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSaving(true);

      const updatedUserData = {
        ...formData,
      };

      // Send data to API
      await axios.put(`${API_URL}/user-settings`, updatedUserData);
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClick = () => {
    navigate("/forgot-password");
  };

  const handleDelete = async () => {
    try {
      const userId = user?._id;

      if (!userId) {
        toast.error("User not authenticated");
        return;
      }
      const res = await axios.patch(
        `${API_URL}/soft-delete?userId=${userId}`,
        {}, // empty body required by Axios for PATCH
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (res.status === 200) {
        clearUser();
        setIsDeleteModalOpen(false);
        navigate("/account-deleted");
      } else {
        toast.error("Failed to delete account, please try again.");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("An error occurred. Please try again.");
    }
  };

  const paymentOptions = [
    {
      name: "PayPal",
      icon: Paypal,
      action: handlers.handlePayPalConnect, // For connecting
      disconnect: handlers.handleDisconnectPayPal, // For disconnecting
      connected: connections.paypal,
    },
    {
      name: "Flutterwave",
      icon: flutter,
      action: handlers.handleFlutterwaveConnect,
      disconnect: handlers.handleDisconnectFlutterwave,
      connected: connections.flutterwave,
    },
    {
      name: "Stripe",
      icon: stripe,
      action: handlers.handleStripeConnect,
      disconnect: handlers.handleDisconnectStripe,
      connected: connections.stripe,
    },
    {
      name: "Paystack",
      icon: paystack,
      action: handlers.handlePaystackConnect,
      disconnect: handlers.handleDisconnectPaystack,
      connected: connections.paystack,
    },
    {
      name: "Skrill",
      icon: skrill,
      action: handlers.handleSkrillConnect,
      disconnect: handlers.handleDisconnectSkrill,
      connected: connections.skrill,
    },
    {
      name: "Google Pay",
      icon: googlepay,
      action: handlers.handleGooglePayConnect,
      disconnect: handlers.handleDisconnectGooglePay,
      connected: connections.googlePay,
    },
  ];

  // Filter out only the connected payment methods
  const connectedOptions = paymentOptions.filter((opt) => opt.connected);

  // Function to disconnect the payment account
  const handleDisconnect = async (option) => {
    setIsDisconnecting(true);
    try {
      // Wait for 3 seconds
      await new Promise((resolve) => setTimeout(resolve, 3000));
      if (option.disconnect) {
        await option.disconnect();
      } else {
        console.warn(`No disconnect handler for ${option.name}`);
      }
    } catch (error) {
      console.error("Error disconnecting:", error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  // Format reset date once we have periodStart
  const resetDateFormatted = nextReset
    ? new Date(nextReset).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    : "";

  return (
    <div className="md:mx-4 lg:mx-6">
      <div className="my-6">
        <h1 className="text-[8vw] font-satoshi font-bold mb-6 md:text-[3vw] lg:text-[2.5vw]">
          Profile
        </h1>

        {/* Logo Upload Section */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <div
              onClick={triggerFileInput}
              className={`w-32 h-32 flex flex-col items-center justify-center cursor-pointer rounded-md ${logoUrl
                ? "border-none"
                : "border-2 border-dashed border-gray-300 hover:bg-gray-50"
                }`}
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Business Logo"
                  className="w-full h-full rounded-lg object-cover"
                />
              ) : (
                <>
                  <FiUpload size={24} className="text-gray-400" />
                  <span className="text-[4vw] font-satoshi mt-1 text-gray-400 md:text-base lg:text-[1vw]">
                    Upload Logo
                  </span>
                </>
              )}
              {isUploading && (
                <div className="text-[4vw] font-satoshi mt-1 text-green-400 md:text-base lg:text-[1vw]">
                  Uploading...
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleLogoUpload}
              accept="image/*"
              className="hidden"
              disabled={isUploading}
            />

            {logoUrl && (
              <button
                type="button"
                onClick={() => setLogoUrl("")}
                className="px-[6vw] py-[2vw] box font-bold font-satoshi border rounded-xl md:py-[0.5vw] md:px-[1.5vw]"
              >
                Remove Logo
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mb-[3vw]">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 px-[4vw] py-[6vw] border border-gray-300 box rounded-3xl w-full gap-6 md:px-[2vw] md:py-[3vw] lg:w-3/5 lg:grid-cols-2"
          >
            {/* Business Details Form */}
            <div>
              <label
                htmlFor="businessName"
                className="block text-[4vw] font-satoshi font-semibold text-gray-700 mb-3 md:text-lg lg:text-base"
              >
                Business Name:
              </label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                className="w-full outline-none border border-gray-400 bg-transparent px-[1.5vw] py-[1.5vw] rounded-[1.5vw] font-satoshi hover:outline hover:outline-2 hover:outline-neutral-700 focus:outline focus:outline-2 focus:outline-neutral-700 md:text-base lg:px-[0.5vw] lg:py-[0.4vw] lg:rounded-[0.5vw] lg:text-sm"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-[4vw] font-satoshi font-semibold text-gray-700 mb-3 md:text-lg lg:text-base"
              >
                Email Address:
              </label>
              <input
                type="email"
                id="emailAddress"
                name="emailAddress"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full outline-none border border-gray-400 bg-transparent px-[1.5vw] py-[1.5vw] rounded-[1.5vw] font-satoshi hover:outline hover:outline-2 hover:outline-neutral-700 focus:outline focus:outline-2 focus:outline-neutral-700 md:text-base lg:px-[0.5vw] lg:py-[0.4vw] lg:rounded-[0.5vw] lg:text-sm"
                required
              />
            </div>

            <div>
              <label
                htmlFor="city"
                className="block text-[4vw] font-satoshi font-semibold text-gray-700 mb-3 md:text-lg lg:text-base"
              >
                City:
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full outline-none border border-gray-400 bg-transparent px-[1.5vw] py-[1.5vw] rounded-[1.5vw] font-satoshi hover:outline hover:outline-2 hover:outline-neutral-700 focus:outline focus:outline-2 focus:outline-neutral-700 md:text-base lg:px-[0.5vw] lg:py-[0.4vw] lg:rounded-[0.5vw] lg:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="country"
                className="block text-[4vw] font-satoshi font-semibold text-gray-700 mb-3 md:text-lg lg:text-base"
              >
                Country:
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full outline-none border border-gray-400 bg-transparent px-[1.5vw] py-[1.5vw] rounded-[1.5vw] font-satoshi hover:outline hover:outline-2 hover:outline-neutral-700 focus:outline focus:outline-2 focus:outline-neutral-700 md:text-base lg:px-[0.5vw] lg:py-[0.4vw] lg:rounded-[0.5vw] lg:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="state"
                className="block text-[4vw] font-satoshi font-semibold text-gray-700 mb-3 md:text-lg lg:text-base"
              >
                State:
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full outline-none border border-gray-400 bg-transparent px-[1.5vw] py-[1.5vw] rounded-[1.5vw] font-satoshi hover:outline hover:outline-2 hover:outline-neutral-700 focus:outline focus:outline-2 focus:outline-neutral-700 md:text-base lg:px-[0.5vw] lg:py-[0.4vw] lg:rounded-[0.5vw] lg:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-[4vw] font-satoshi font-semibold text-gray-700 mb-3 md:text-lg lg:text-base"
              >
                Phone No:
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full outline-none border border-gray-400 bg-transparent px-[1.5vw] py-[1.5vw] rounded-[1.5vw] font-satoshi hover:outline hover:outline-2 hover:outline-neutral-700 focus:outline focus:outline-2 focus:outline-neutral-700 md:text-base lg:px-[0.5vw] lg:py-[0.4vw] lg:rounded-[0.5vw] lg:text-sm"
              />
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSaving}
                className={`px-[6vw] py-[2vw] box font-bold font-satoshi border rounded-xl md:px-[2vw] md:py-[0.5vw] lg:py-[0.5vw] lg:px-[1.5vw] ${isSaving
                  ? "opacity-50 cursor-not-allowed"
                  : "opacity-100 cursor-pointer"
                  }`}
              >
                {isSaving ? (
                  <div className="text-[4vw] flex items-center gap-2 md:text-sm lg:text-[1vw]">
                    <RiLoader4Line className="animate-spin" size={20} />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <span className="text-[4vw] md:text-sm lg:text-base">Save Changes</span>
                )}
              </button>
            </div>
          </form>

          <div className="w-full px-[4vw] py-[6vw] border border-gray-300 box rounded-3xl md:px-[2vw] md:py-[3vw] lg:w-2/5">
            <h1 className="mb-[3vw] font-satoshi font-semibold text-[5vw] md:text-lg md:mb-[2.5vw] lg:mb-[1vw] lg:text-base">
              Security
            </h1>
            <div className="flex flex-col items-start justify-normal">
              <button
                title="Change Password"
                onClick={handleClick}
                className="px-[3vw] py-[2vw] text-[4vw] font-satoshi bg-[#F5F5F5] border border-neutral-500 rounded-3xl md:text-base md:px-[2vw] md:py-[0.7vw] lg:px-[1vw] lg:py-[0.4vw] lg:text-sm"
              >
                Change Password
              </button>
              <div className="flex items-center gap-10 mt-5">
                <button
                  title="Logout"
                  onClick={() => {
                    logout();
                    window.location.href = "/signup";
                  }}
                  className="text-[4.2vw] font-satoshi md:text-base"
                >
                  Sign Out
                </button>

                <button
                  title="Delete Account"
                  onClick={() => {
                    setIsDeleteModalOpen(true);
                  }}
                  className="text-[4.2vw] text-red-600 font-satoshi flex items-center gap-1 md:text-base"
                >
                  <RiDeleteBin6Line />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden border border-neutral-500 rounded-3xl p-4 box lg:block w-[25vw]">
        <h1 className="font-satoshi font-semibold text-base mb-[0.5vw]">
          Payment Account
        </h1>

        {/* If no payment methods are connected, show a message */}
        {connectedOptions.length === 0 && (
          <p className="p-4 text-gray-600 text-center font-satoshi">
            No Payment Method Connected
          </p>
        )}

        {/* Render a card for each connected method */}
        {connectedOptions.map((option) => (
          <div className="rounded-xl lg:p-2" key={option.name}>
            <div className="flex items-center justify-between mb-[1.5vw]">
              {/* Left side: Icon + Method Name */}
              <div className="flex items-center gap-2">
                <img
                  src={option.icon}
                  alt={option.name}
                  className="w-full h-10 object-cover"
                />
                <span className="font-medium font-satoshi text-base">
                  {option.name}
                </span>
              </div>
              {/* Right side: Connected Indicator */}
              <div className="flex items-center border border-neutral-500 rounded-full px-[0.9vw] py-[0.3vw]">
                <div className="flex justify-center items-center bg-green-600 rounded-full mr-2 w-4 h-4">
                  <IoCheckmarkOutline size={10} />
                </div>
                <span className="font-satoshi text-xs">
                  Connected
                </span>
              </div>
            </div>
            {/* Disconnect Button */}
            <button
              title="Disconnect Payment Account"
              onClick={() => handleDisconnect(option)}
              disabled={isDisconnecting}
              className={`font-satoshi bg-[#F5F5F5] border border-neutral-500 rounded-3xl text-sm px-[1vw] py-[0.4vw] ${isDisconnecting
                ? "font-normal text-gray-400 cursor-not-allowed"
                : "text-neutral-800 font-semibold"
                }`}
            >
              {isDisconnecting ? "Disconnecting..." : "Disconnect"}
            </button>
          </div>
        ))}
      </div>

      {/* Tablet and mobile view */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:hidden">
        <div className="border border-neutral-500 rounded-3xl p-4 box">
          <h1 className="mb-[2vw] font-satoshi font-semibold text-lg">
            Payment Account
          </h1>

          {/* If no payment methods are connected, show a message */}
          {connectedOptions.length === 0 && (
            <div>
              <p className="p-4 text-gray-600 text-sm text-center font-satoshi">
                No Payment Method Connected
              </p>
              <span className="md:hidden"> <AccountConnectionModal /> </span>
            </div>
          )}

          {/* Render a card for each connected method */}
          {connectedOptions.map((option) => (
            <div className="rounded-xl lg:p-2" key={option.name}>
              <div className="flex items-center justify-between mb-[1.5vw]">
                {/* Left side: Icon + Method Name */}
                <div className="flex items-center gap-2">
                  <img
                    src={option.icon}
                    alt={option.name}
                    className="w-full h-10 object-cover"
                  />
                  <span className="font-medium font-satoshi text-lg ">
                    {option.name}
                  </span>
                </div>
                {/* Right side: Connected Indicator */}
                <div className="flex px-[3vw] py-[2vw] items-center border border-neutral-500 rounded-full md:px-[1.2vw] md:py-[0.5vw]">
                  <div className="w-5 h-5 flex justify-center items-center bg-green-600 rounded-full mr-2">
                    <IoCheckmarkOutline size={10} />
                  </div>
                  <span className="font-satoshi text-base">
                    Connected
                  </span>
                </div>
              </div>
              {/* Disconnect Button */}
              <button
                title="Disconnect Payment Account"
                onClick={() => handleDisconnect(option)}
                disabled={isDisconnecting}
                className={`font-satoshi mt-3 bg-[#F5F5F5] border px-[5vw] py-[2vw] border-neutral-500 rounded-3xl text-base md:px-[3vw] md:py-[0.4vw] ${isDisconnecting
                  ? "font-normal text-gray-400 cursor-not-allowed"
                  : "text-neutral-800 font-semibold"
                  }`}
              >
                {isDisconnecting ? "Disconnecting..." : "Disconnect"}
              </button>
            </div>
          ))}
        </div>
        { isFree && (<div className="text-Gray800 font-satoshi box p-3 border border-gray-500 rounded-2xl flex flex-col">
          <h3 className="md:text-lg text-xl font-semibold">
            Free Plan Usage
          </h3>

          {isLoading ? (
            <p className="text-sm mt-[0.5vw]">
              Loading usage…
            </p>
          ) : (
            <>
              {/* Usage Text */}
              <p className="text-base mt-[2vw] mb-2 md:mt-[0.5vw]">
                {invoiceCount} / 10 invoices sent
              </p>

              {/* Progress Meter */}
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
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
              <button className="mt-3 flex items-center gap-1 text-lg text-blue-600 font-medium hover:underline md:text-base lg:mt-2">
                Upgrade to Pro
                <IoIosArrowRoundForward size={20} />
              </button>

              {/* Reset Info */}
              <p className="text-base text-gray-500 mt-2">
                {resetDateFormatted &&
                  `Limit resets on ${resetDateFormatted}`}
              </p>
            </>
          )}
        </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white rounded-lg p-6 w-[80vw] md:w-[60vw] lg:w-[30vw]"
          >
            <p className="mb-6 font-satoshi text-[4vw] font-semibold text-gray-800 md:text-lg lg:text-[1.1vw]">
              Are you sure you want to delete your account?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                }}
                className="px-4 py-2 text-gray-800 border bg-gray-200 font-satoshi rounded-lg"
              >
                Cancel
              </button>
              <div className="">
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-2xl flex justify-center gap-2 items-center"
                >
                  <RiDeleteBin6Line />
                  <span className="font-satoshi">Delete</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Settings;
