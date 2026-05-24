import { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "../../store/authStore";
import { TbLoader3 } from "react-icons/tb";
import CloudinaryPdfViewer from "../../hooks/CloudinaryPdfViewer";
import { useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000/api/invoice"
    : "https://proforma-sohi.vercel.app/api/invoice";

axios.defaults.withCredentials = true;

const OverviewPayments = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Animated ellipsis component
  const AnimatedEllipsis = () => {
    const [dots, setDots] = useState("");

    useEffect(() => {
      const interval = setInterval(() => {
        setDots((prevDots) => {
          if (prevDots === "") return ".";
          if (prevDots === ".") return "..";
          if (prevDots === "..") return "...";
          return "";
        });
      }, 600);

      return () => clearInterval(interval);
    }, []);

    return <span className="animated-ellipsis">{dots}</span>;
  };

  const userId = user?._id;

  // Fetch invoices from backend
  const fetchInvoices = async () => {
    try {
      const response = await axios.get(`${API_URL}/invoices`, {
        params: {
          userId,
        },
      });
      setInvoices(response.data.invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  // Always load invoice payments on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (userId) {
        await fetchInvoices(); // Make sure this is an async function
      }
      setLoading(false);
    };

    fetchData();
  }, [userId]);

  const recentInvoices = invoices.slice(0, 10);

  return (
    <div className="p-6 border border-neutral-700 box rounded-3xl">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-[5vw] font-satoshi font-bold md:text-xl">
            Recent Invoices
          </h1>
        </div>
        <button
          onClick={() => navigate("/dashboard/payments")}
          className=" text-cyan-700 font-satoshi text-base hover:underline"
        >
          View All
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center space-y-3">
          <TbLoader3 size={30} className="animate-spin text-teal-500" />
          <p className="text-[4vw] font-satoshi md:text-sm lg:text-base">
            Please wait while we load your invoice history
            <AnimatedEllipsis />
          </p>
        </div>
      ) : recentInvoices.length === 0 ? (
        <div className="text-[4vw] text-center py-10 text-gray-600 font-satoshi md:text-sm lg:text-base">
          You have not sent any invoice yet.
        </div>
      ) : (
        <>
          <div className="w-full h-full max-h-[200px] scrollbar-toggle overflow-auto">
            <table className="w-full min-w-[1000px] font-medium">
              <thead>
                <tr className="border-b border-gray-400">
                  <th></th>
                  <th className="py-4 px-3 text-left font-satoshi font-semibold">
                    Client Name
                  </th>
                  <th className="py-4 px-3 text-left font-satoshi font-semibold">
                    Client Email
                  </th>
                  <th className="py-4 px-3 text-left font-satoshi font-semibold">
                    Invoice Number
                  </th>
                  <th className="py-4 px-3 text-left font-satoshi font-semibold">
                    Description
                  </th>
                  <th className="py-4 px-3 text-left font-satoshi font-semibold">
                    Payment Status
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((invoice, index) => (
                  <tr key={index} className="border-b border-gray-400">
                    <td className="py-4 px-3">
                      <div className="relative w-12 h-12 rounded-md">
                        <CloudinaryPdfViewer
                          pdfUrl={
                            invoice.invoiceUrl ||
                            "https://placehold.co/600x400/png"
                          }
                          className="w-full h-full object-cover rounded-md"
                          alt="Invoice"
                        />
                      </div>
                    </td>
                    <td className="py-2 px-3 font-satoshi text-gray-600">
                      {invoice.clientName}
                    </td>
                    <td className="py-2 px-3 font-satoshi text-gray-600">
                      {invoice.clientAddress}
                    </td>
                    <td className="py-2 px-3 font-satoshi text-gray-600">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="py-2 px-3 font-satoshi text-gray-600 truncate max-w-[200px]">
                      {invoice.description}
                    </td>
                    <td className="py-4 px-3">
                      <span
                        className={`px-4 py-1 rounded-lg inline-block font-satoshi border min-w-12 text-center text-sm
                              ${invoice.status === "paid"
                            ? "bg-green-300/20 text-green-600 border-green-300"
                            : invoice.status === "pending"
                              ? "bg-yellow-300/20 text-yellow-600 border-yellow-300"
                              : "bg-red-300/20 text-red-600 border-red-300"
                          }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default OverviewPayments;
