import { useEffect, useRef } from "react";
import lottie from "lottie-web";
import successAnimation from "../assets/animations/success.json";

export default function PaymentSuccess() {

    const LottieAnimation = ({ width = 200, height = 200, delay = 300 }) => {
        const animationContainer = useRef(null);
        const animInstance = useRef(null);
      
        useEffect(() => {
          if (!animationContainer.current) return;
      
          const timeoutId = setTimeout(() => {
            animInstance.current = lottie.loadAnimation({
              container: animationContainer.current,
              renderer: "svg",
              loop: false,
              autoplay: true,
              animationData: successAnimation,
            });
          }, delay);
      
          return () => {
            clearTimeout(timeoutId);
            if (animInstance.current) {
              animInstance.current.destroy();
            }
          };
        }, [delay]);
      
        return <div ref={animationContainer} style={{ width, height }} />;
      };
      


  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg px-4 py-14 text-center relative overflow-hidden">
        {/* Top ribbon */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-500" />

        <div className="flex flex-col items-center">
          {/* Lottie animation */}
          <div className="mb-6">
            <LottieAnimation width={200} height={200} delay={300} />
          </div>

          <h1 className="text-3xl font-satoshi font-bold text-gray-800 mb-2">
            Payment Successful!
          </h1>

          <p className="text-gray-600 font-satoshi">
            Your payment has been processed successfully.
          </p>
        </div>
      </div>

      <p className="mt-8 text-gray-500 font-satoshi text-center text-sm">
        Thank you for using our service. Need help? Contact our support.
      </p>
    </div>
  );
}
