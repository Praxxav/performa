import { Check, X } from "lucide-react";

const PasswordCriteria = ({ password }) => {
  const criteria = [
    { label: "At least 6 characters", met: password.length >= 6 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className="space-y-[0.5vw] mt-[1vw]">
      {criteria.map((item) => (
        <div
          key={item.label}
          className="flex items-center text-[4vw] md:text-lg lg:text-[0.9vw] font-satoshi"
        >
          {item.met ? (
            <Check className="size-4 text-green-400 mr-2" />
          ) : (
            <X className="size-4 text-Gray900 mr-2" />
          )}
          <span className={item.met ? "text-green-400" : "text-Gray800"}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

const PassStrengthMeter = ({ password }) => {
  const getStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 6) strength++;
    if (pass.match(/[a-z]/) && pass.match(/[A-Z]/)) strength++;
    if (pass.match(/\d/)) strength++;
    if (pass.match(/[^a-zA-Z\d]/)) strength++;
    return strength;
  };
  const strength = getStrength(password);

  const getColor = (strength) => {
    if (strength === 0) return "bg-red-500";
    if (strength === 1) return "bg-red-400";
    if (strength === 2) return "bg-yellow-500";
    if (strength === 3) return "bg-yellow-400";
    return "bg-green-400";
  };

  const getStrengthText = (strength) => {
    if (strength === 0) return "Very Weak";
    if (strength === 1) return "Weak";
    if (strength === 2) return "Fair";
    if (strength === 3) return "Good";
    return "Strong";
  };

  return (
    <div className="mt-[4vw] p-[0.5vw] lg:mt-[1vw]">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[4vw] font-satoshi text-Gray400 md:text-lg lg:text-[1vw]">
          Password strength
        </span>
        <span className="text-[4vw] font-satoshi text-Gray400 md:text-lg lg:text-[1vw]">
          {getStrengthText(strength)}
        </span>
      </div>

      <div className="flex space-x-1 mt-[0.5vw]">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className={`h-1 w-1/4 rounded-full transition-colors duration-300 
                ${index < strength ? getColor(strength) : "bg-Disabled"}
              `}
          />
        ))}
      </div>
      <PasswordCriteria password={password} />
    </div>
  );
};
export default PassStrengthMeter;
