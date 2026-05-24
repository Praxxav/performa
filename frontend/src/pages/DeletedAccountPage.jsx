import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const DeletedAccountPage = () => {
    const navigate = useNavigate();

      useEffect(() => {
        const timer = setTimeout(() => {
          navigate("/"); // Redirect home or login page after 10 seconds
        }, 10000);

        return () => clearTimeout(timer);
      }, [navigate]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 rounded-lg shadow-xl w-[90vw] md:w-[50vw] lg:w-[30vw]"
            >
                <h2 className="text-xl md:text-2xl font-bold font-satoshi text-center text-red-600 mb-2">
                    Account Deleted
                </h2>
                <p className="text-gray-700 text-sm md:text-base mb-4 font-satoshi">
                    Your account has been marked for deletion. It will be permanently removed after <strong className="text-gray-800">30 days</strong>.
                </p>
                <p className="text-gray-600 text-sm md:text-sm mb-2 font-satoshi">
                    You can restore your account anytime within this period by simply logging back in.
                </p>
                <div className="flex justify-center">
                    <button
                        onClick={() => navigate("/signup")}
                        className="mt-4 bg-cyan-800 text-white font-satoshi h-[10vw] w-[30vw] border border-neutral-400 lg:h-[2.5vw] lg:w-[10vw] rounded-xl box"
                    >
                        Login to Restore
                    </button>
                </div>

            </motion.div>
        </div>
    );
};

export default DeletedAccountPage;
