import { useState } from "react";
import { useNavigate } from 'react-router-dom';

const pricingData = {
  free: {
    price: "0",
    description: "Perfect for individuals and small businesses",
    features: [
      "Up to 10 Invoice per month",
      "Basic customization",
      "PDF generation",
      "Email support",
      "PDF Downloads",
      "Client management",
      "Payment integrations",
    ],
  },
  pro: {
    price: "108",
    description: "Save 10% with annual billing",
    features: [
      "Create unlimited invoices",
      "Advanced customization",
      "PDF generation",
      "Priority email support",
      "PDF Downloads",
      "Client management",
      "Payment integrations",
      "One month free",
      "Advanced reporting",
    ],
  },
};

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState("free");
  const planData = pricingData[billingCycle];
  const navigate = useNavigate();

  const handleBilling = () => {
  if (billingCycle === 'free') {
    navigate('/signup');
  } else {
    navigate('/pricing');
  }
};

  return (
    <section className="py-16" id="pricing">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-center text-[8vw] font-bold mb-[3vw] font-satoshi md:text-[4.5vw] lg:text-[3vw]">
          Choose a Plan
        </h2>

        {/* Billing toggle */}
        <div className="flex justify-center gap-[1vw] mb-6">
          <button
            onClick={() => setBillingCycle("free")}
            className={`px-6 py-2 text-[4vw] font-medium font-satoshi transition-all duration-300 md:text-[2.5vw] lg:text-[1.1vw] ${
              billingCycle === "free"
                ? "border-b-2 border-gray-800 text-gray-800"
                : "text-gray-500"
            }`}
          >
            Free
          </button>
          <button
            onClick={() => setBillingCycle("pro")}
            className={`px-6 py-2 relative text-[4vw] font-medium font-satoshi transition-all duration-300 md:text-[2.5vw] lg:text-[1.1vw] ${
              billingCycle === "pro"
                ? "border-b-2 border-gray-800 text-gray-800"
                : "text-gray-500"
            }`}
          >
            Pro
            <span className="absolute w-[15vw] py-[0.2vw] -top-1 text-[3vw] bg-green-200 text-green-800 rounded-[0.2vw] md:text-[1.5vw] md:w-[10vw] md:-top-2 lg:text-[0.8vw] lg:w-[5vw] lg:-top-2">
              Save 10%
            </span>
          </button>
        </div>

        {/* Two-column pricing card */}
        <div className="max-w-4xl lg:mx-auto">
          <div className="flex flex-col justify-center items-center gap-x-[3vw] lg:flex-row">
            {/* Left column - Price with fieldset border */}
            <div className="w-full h-full p-[4vw] relative border border-neutral-400 rounded-3xl m-4 md:w-[60vw] lg:w-[50vw] lg:h-[24vw] lg:p-[1.5vw]">
              {/* Fieldset legend */}
              {billingCycle === "pro" && (
                <div className="absolute -top-3 right-6 rounded-lg bg-white flex justify-center px-2 py-0.5">
                  <span className="text-[3vw] font-bold font-satoshi text-gray-600 md:text-base lg:text-[0.8vw]">
                    Recommended
                  </span>
                </div>
              )}

              <div className="flex flex-col pt-2">
                <div className="mt-4 mb-1">
                  <span className="text-[10vw] font-bold text-gray-900 font-satoshi md:text-[7vw] lg:text-[4vw]">
                    ${planData.price}
                  </span>
                  <span className="text-[5vw] text-gray-600 font-satoshi md:text-[3vw] lg:text-[1.5vw]">
                    {billingCycle === "free" ? "" : "/year"}
                  </span>
                </div>
                <p className="text-gray-600 text-[4vw] font-satoshi mb-2 max-w-xs md:text-xl lg:text-[1vw]">
                  {planData.description}
                </p>
                <button onClick={handleBilling} className="px-[1.5vw] py-[1.2vw] mt-[10vw] mb-[2vw] font-satoshi text-base font-bold border border-neutral-500 rounded-xl box lg:mt-[7vw] lg:py-[0.5vw]">
                   {billingCycle === "free" ? "Get Started" : "Go to Plan"}
                </button>
              </div>
            </div>

            {/* Right column - Features */}
            <div className="mt-[2vw] w-full md:w-[60vw] lg:w-full lg:p-8">
              <h4 className="text-[6.5vw] font-semibold font-clash text-gray-900 mb-4 md:text-[4vw] lg:mb-2 lg:text-[3vw]">
                What&apos;s included:
              </h4>
              <ul className="space-y-4">
                {planData.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <svg
                      className="h-6 w-6 text-neutral-700 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700 text-[4vw] font-satoshi md:text-xl lg:text-[1vw]">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
