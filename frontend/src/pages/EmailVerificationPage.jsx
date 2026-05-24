import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { toast } from "react-toastify";

const EmailVerificationPage = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const { error, isLoading, verifyEmail } = useAuthStore();

  const handleChange = (index, value) => {
    const newCode = [...code];

    // Handle pasted content
    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedCode[i] || "";
      }
      setCode(newCode);

      // Focus on the last non-empty input or the first empty one
      const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
      const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
      inputRefs.current[focusIndex].focus();
    } else {
      newCode[index] = value;
      setCode(newCode);

      // Move focus to the next input field if value is entered
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const verificationCode = code.join("");
    try {
      await verifyEmail(verificationCode);
      navigate("/dashboard");
      toast.success("Email verified successfully");
    } catch (error) {
      console.log(error);
    }
  };

  // Auto submit when all fields are filled
  useEffect(() => {
    if (code.every((digit) => digit !== "")) {
      handleSubmit(new Event("submit"));
    }
  }, [code]);

  return (
    <div className="flex justify-center items-center h-screen ">
      <div className="w-[90vw] lg:w-[30vw] flex flex-col mx-auto my-[8vw] bg-White shadow-xl px-[2.5vw] py-[7vw] lg:p-[2vw] rounded-[0.5vw]">
        <h2 className="text-center font-satoshi text-[7vw] lg:text-[2.5vw] font-semibold text-Gray900 mb-[1vw]">
          Verify Your Email
        </h2>
        <p className="text-[4vw] text-center text-gray-700 font-satoshi mb-[1.5vw] lg:text-[1vw]">
          Enter the 6-digit code sent to your email address.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="6"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-2xl font-bold bg-transparent outline-none border border-gray-300 font-satoshi rounded-lg hover:outline hover:outline-2 hover:outline-neutral-700 focus:outline focus:outline-2 focus:outline-neutral-700"
              />
            ))}
          </div>
          {error && <p className="text-red-500 font-satoshi mt-2">{error}</p>}
          <button
            type="submit"
            disabled={isLoading || code.some((digit) => !digit)}
            className={`mt-[4vw] w-full lg:mt-[1.5vw] ${
              isLoading ? "bg-gray-400 cursor-not-allowed " : "bg-cyan-800"
            } text-white text-[4vw] font-satoshi h-[10vw] border border-neutral-400 rounded-xl box lg:h-[2.5vw] lg:text-[1vw]`}
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </button>
        </form>
      </div>
    </div>
  );
};
export default EmailVerificationPage;
