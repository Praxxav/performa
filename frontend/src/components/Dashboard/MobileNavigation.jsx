import React, { useEffect, useState } from 'react'
import { GiTakeMyMoney } from 'react-icons/gi';
import { GoPeople } from 'react-icons/go';
import { IoSettingsOutline } from 'react-icons/io5';
import { LiaFileInvoiceSolid } from 'react-icons/lia';
import { TbBrandGoogleAnalytics } from 'react-icons/tb';
import { Link, useLocation } from 'react-router-dom';

const MobileNavigation = () => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const location = useLocation();

    const SIDEBAR_ITEMS = [
        {
            name: "Clients",
            icon: GoPeople,
            path: "/dashboard/clients",
        },
        {
            name: "Invoices",
            icon: LiaFileInvoiceSolid,
            path: "/dashboard/invoices",
        },
        {
            name: "Overview",
            icon: TbBrandGoogleAnalytics,
            path: "/dashboard",
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
    ];

    // Update window width on resize
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const isMobile = windowWidth < 768;

    return (
        <div>
            {/* Mobile Navigation */}
            <div
                className={`fixed bg-white w-full bottom-0 border-t border-gray-200 flex flex-row z-[1] ${isMobile ? "block" : "hidden"}`}
                style={{ paddingBottom: '4px' }}
            >
                {/* Sidebar Items */}
                <div className='flex flex-row w-full justify-around'>
                    {SIDEBAR_ITEMS.map((item, index) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                to={item.path}
                                key={index}
                                className={`flex flex-col items-center justify-center py-3 relative ${
                                    isActive ? "transform" : ""
                                }`}
                            >
                                <div 
                                    className={`flex items-center justify-center ${
                                        isActive 
                                            ? "bg-cyan-600 text-white rounded-full p-3 shadow-lg transform -translate-y-8 transition-all duration-200" 
                                            : "text-gray-700 dark:text-gray-600"
                                    }`}
                                    style={isActive ? { boxShadow: '0 4px 12px rgba(8, 145, 178)' } : {}}
                                >
                                    <item.icon 
                                        className={`w-6 h-6 ${
                                            isActive ? "text-white" : ""
                                        }`} 
                                    />
                                </div>
                                <span 
                                    className={`${isActive ? "-mt-5" : "mt-1"} text-sm font-satoshi ${
                                        isActive 
                                            ? "text-cyan-600 font-medium" 
                                            : "text-gray-500 dark:text-gray-400"
                                    }`}
                                >
                                    {item.name}
                                </span>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default MobileNavigation