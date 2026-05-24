import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { FaArrowUpLong, FaArrowDownLong } from "react-icons/fa6";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "../../store/authStore";
import { TbLoader3 } from "react-icons/tb";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000/api/invoice"
    : "https://proforma-sohi.vercel.app/api/invoice";

axios.defaults.withCredentials = true;

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const RevenueChart = ({ userId }) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [invoiceData, setInvoiceData] = useState({
    revenue: Array(12).fill(0),
    pending: Array(12).fill(0),
    failed: Array(12).fill(0),
    total: 0,
    percentChange: 0,
    isPositiveChange: true,
    isLoading: true,
  });

  const { user } = useAuthStore();

  // Fetch invoice data from the API
  useEffect(() => {
    const userId = user?._id;
    const fetchInvoiceStats = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/invoices/stats/summary?userId=${userId}`
        );
        const { amountByStatus, monthlyData } = response.data;

        // Calculate total paid amount
        const totalPaid = amountByStatus["paid"] || 0;

        setInvoiceData({
          revenue: monthlyData.revenue,
          pending: monthlyData.pending,
          failed: monthlyData.failed,
          total: totalPaid,
          percentChange: Math.abs(monthlyData.percentChange),
          isPositiveChange: monthlyData.percentChange >= 0,
          isLoading: false,
        });
      } catch (error) {
        console.error("Error fetching invoice statistics:", error);
        setInvoiceData((prev) => ({ ...prev, isLoading: false }));
      }
    };

    if (userId) {
      fetchInvoiceStats();
    }
  }, [userId]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const labelFontSize = 13;
  const barThicknessSize = isMobile ? 25 : 25;

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

  // Format number as currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];

  const data = {
    labels: months,
    datasets: [
      {
        label: "Paid",
        data: invoiceData.revenue,
        backgroundColor: "#16a34a",
        hoverBackgroundColor: "#22c55e",
        barThickness: barThicknessSize,
        borderRadius: 5,
        borderSkipped: "bottom",
        order: 1,
        stack: "stack1",
      },
      {
        label: "Pending",
        data: invoiceData.pending,
        backgroundColor: "#facc15",
        hoverBackgroundColor: "#fbbf24",
        barThickness: barThicknessSize,
        borderRadius: 5,
        borderSkipped: "bottom",
        order: 2,
        stack: "stack2",
      },
      {
        label: "Failed",
        data: invoiceData.failed,
        backgroundColor: "#dc2626",
        hoverBackgroundColor: "#ef4444",
        barThickness: barThicknessSize,
        borderRadius: 5,
        borderSkipped: "bottom",
        order: 3,
        stack: "stack3",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        align: "start",
        labels: {
          font: {
            family: "satoshi",
            size: labelFontSize,
          },
          boxWidth: 15,
          padding: 10,
          color: "#3C3D37",
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || "";
            const value = formatCurrency(context.raw);
            return `${label}: ${value}`;
          },
        },
        titleFont: { family: "satoshi", size: labelFontSize },
        bodyFont: { family: "satoshi", size: labelFontSize },
        backgroundColor: "#fff",
        titleColor: "#3C3D37",
        bodyColor: "#3C3D37",
        padding: 10,
        borderColor: "#525252",
        borderWidth: 1,
        caretSize: 5,
        caretPadding: 10,
        displayColors: false,
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: {
          font: { family: "satoshi", size: 14 },
          color: "#3C3D37",
        },
      },
      y: {
        beginAtZero: true,
        stacked: true,
        grid: { display: false },
        ticks: {
          font: { family: "satoshi", size: 12 },
          color: "#3C3D37",
        },
      },
    },
  };

  return (
    <div className="p-4 border border-neutral-700 box rounded-3xl w-full lg:px-[1vw] lg:pt-[2vw] lg:pb-0 lg:p-[4vw]">
      <h3 className="text-[6vw] font-semibold text-Gray900 font-satoshi mb-1 md:text-lg lg:mb-2 lg:text-xl">
        Monthly Invoice Revenue
      </h3>
      <div className="flex space-x-[1vw] items-center">
        <div className="text-[4.5vw] font-semibold text-Gray800 font-satoshi md:text-base lg:text-[1.2vw]">
          {formatCurrency(invoiceData.total)}
        </div>
        <div
          className={`font-satoshi text-[3vw] flex items-center space-x-[0.1vw] md:text-sm lg:text-[0.8vw] ${invoiceData.isPositiveChange ? "text-green-600" : "text-red-600"
            }`}
        >
          {invoiceData.isPositiveChange ? (
            <FaArrowUpLong />
          ) : (
            <FaArrowDownLong />
          )}
          <span>{invoiceData.percentChange}% than last month</span>
        </div>
      </div>
      <div className="relative w-full lg:w-full h-[40vh]">
        {invoiceData.isLoading ? (
          <div className="absolute inset-0 flex flex-col justify-center items-center space-y-3">
            <TbLoader3 size={30} className="animate-spin text-teal-500" />
            <p className="text-[4vw] font-satoshi text-center md:text-base lg:text-[1vw]">
              Loading Chart
              <AnimatedEllipsis />
            </p>
          </div>
        ) : !invoiceData.revenue?.some((val) => val > 0) &&
          !invoiceData.pending?.some((val) => val > 0) ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500 text-[4vw] font-satoshi md:text-base lg:text-base">
              No content available
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto scrollbar-toggle">
            <div className="min-w-[769px] h-[37vh]">
              <Bar
                data={data}
                options={options}
                className="mt-[4vw] lg:mt-[2vw]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueChart;
