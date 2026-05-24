import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { TbLoader3 } from "react-icons/tb";
import { useAuthStore } from "../../store/authStore";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000/api/invoice"
    : "https://proforma-sohi.vercel.app/api/invoice";

axios.defaults.withCredentials = true;

const OverviewClients = () => {
  const [clientData, setClientData] = useState([]);
  const [totalClients, setTotalClients] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const userId = user?._id;

  // Animated ellipsis
  const AnimatedEllipsis = () => {
    const [dots, setDots] = useState("");

    useEffect(() => {
      const interval = setInterval(() => {
        setDots((prev) => (prev === "..." ? "" : prev + "."));
      }, 500);
      return () => clearInterval(interval);
    }, []);

    return <span className="animated-ellipsis">{dots}</span>;
  };

  // Fetch client data
  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/invoices/clients`, {
          params: { userId },
        });

        if (response.data.success) {
          setClientData(response.data.clients);
          setTotalClients(response.data.totalClients);
        } else {
          throw new Error("Failed to fetch client data");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [userId]);

  const formatInvoiceText = (count) =>
    `${count} invoice${count === 1 ? "" : "s"}`;

  const recentClients = clientData.slice(0, 10); // show only 10 recent

  return (
    <div className="p-6 border border-neutral-700 box rounded-3xl">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-[5vw] font-satoshi font-bold md:text-xl">
            Recent Clients
          </h1>
          <p className="text-sm mt-1 font-satoshi">{totalClients} total</p>
        </div>
        <button
          onClick={() => navigate("/dashboard/clients")}
          className=" text-cyan-700 font-satoshi text-base hover:underline"
        >
          View All
        </button>
      </div>

      <div className="w-full">
        {loading ? (
          <div className="flex flex-col justify-center items-center space-y-3">
            <TbLoader3 size={30} className="animate-spin text-teal-500" />
            <p className="text-[4vw] font-satoshi md:text-sm lg:text-base">
              Please wait while we load client&apos;s data
              <AnimatedEllipsis />
            </p>
          </div>
        ) : recentClients.length === 0 ? (
          <div className="text-[4vw] text-center py-7 text-gray-600 font-satoshi md:text-sm lg:text-base">
            No Client Data Available.
          </div>
        ) : (
          <div className="w-full h-full max-h-[175px] overflow-auto scrollbar-toggle">
            <table className="w-full min-w-[700px] font-medium">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-4 px-3 font-satoshi font-semibold">
                    Client Name
                  </th>
                  <th className="text-left py-4 px-3 font-satoshi font-semibold">
                    Client Address
                  </th>
                  <th className="text-left py-4 px-3 font-satoshi font-semibold">
                    No. of invoices sent
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentClients.map((client, index) => (
                  <tr key={index} className="border-b border-gray-300">
                    <td className="py-4 px-3 font-satoshi text-gray-600 lg:text-base">
                      {client.clientName}
                    </td>
                    <td className="py-4 px-3 font-satoshi text-gray-600 lg:text-base">
                      {client.clientAddress}
                    </td>
                    <td className="py-4 px-3 font-satoshi text-gray-600 lg:text-base">
                      {formatInvoiceText(client.invoiceCount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverviewClients;
