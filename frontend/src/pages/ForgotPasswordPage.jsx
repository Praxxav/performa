import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { ArrowLeft, Loader, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { GoMail } from "react-icons/go";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { isLoading, forgotPassword } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await forgotPassword(email);
    setIsSubmitted(true);
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-[90vw] lg:w-[30vw] flex flex-col mx-auto my-[8vw] bg-White shadow-xl px-[2.5vw] py-[7vw] lg:p-[2vw] rounded-[0.5vw]">
        <h2 className="text-center font-satoshi text-[7vw] lg:text-[2.5vw] font-semibold text-Gray900 mb-[1vw]">
          Forgot Password
        </h2>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit}>
            <p className="text-[4vw] text-center text-gray-700 font-satoshi mb-[1.5vw] lg:text-[1vw]">
              Enter your email address and we&apos;ll send you a link to reset
              your password.
            </p>
            <div className="relative mt-[3vw] lg:mt-[1vw]">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                autoComplete="on"
                value={email}
                className="w-full outline-none border bg-transparent px-[2.5vw] py-[3vw] lg:px-[1vw] lg:py-[0.8vw] rounded-[1.5vw] lg:rounded-[0.5vw] font-satoshi pr-[9vw] lg:pr-[3vw] hover:outline hover:outline-2 hover:outline-neutral-700 focus:outline focus:outline-2 focus:outline-neutral-700"
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmail(email.toLowerCase())}
              />
              <div className="absolute inset-y-0 right-[3vw] lg:right-[1vw] flex items-center">
                <GoMail className="text-Gray600 lg:text-[1.3vw]" />
              </div>
            </div>
            <button
              className={`mt-[4vw] w-full lg:mt-[1.5vw] ${
                isLoading ? "bg-gray-400 cursor-not-allowed " : "bg-cyan-800"
              } text-white text-[4vw] font-satoshi h-[10vw] border border-neutral-400 rounded-xl box lg:h-[2.5vw] lg:text-[1vw]`}
              type="submit"
            >
              {isLoading ? (
                <div className="flex justify-center items-center gap-[1vw]">
                  <Loader className="size-6 animate-spin" />
                  <span className="text-[4vw] font-satoshi lg:text-[1vw]">
                    Sending...
                  </span>
                </div>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <p className="text-gray-300 font-satoshi mb-6">
              If an account exists for {email}, you will receive a password
              reset link shortly.
            </p>
          </div>
        )}
        <div className="mt-[5vw] flex justify-center lg:mt-[1.5vw]">
          <Link
            to={"/signup"}
            className="text-[4vw] font-satoshi text-gray-500 hover:underline flex items-center lg:text-[1vw]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
