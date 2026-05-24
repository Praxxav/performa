import { useAuthStore } from "../../store/authStore";
import wavingEmoji from "../../assets/Images/SVG Icons/Skin tone=Yellow.svg";
import tiredFace from "../../assets/Images/SVG Icons/Skin tone=Yellow(2).svg";
import yawningFace from "../../assets/Images/SVG Icons/yawning face.svg";

const Greeting = () => {
  const { user } = useAuthStore();

  const date = new Date();
  const hours = date.getHours();

  let timeOfDay;
  let greetingText;
  let image;

  if (hours < 12) {
    timeOfDay = "Morning";
    greetingText = "Send invoices to kick off your day.";
    image = wavingEmoji;
  } else if (hours >= 12 && hours <= 17) {
    timeOfDay = "Afternoon";
    greetingText = "Review and follow up on pending invoices.";
    image = tiredFace;
  } else {
    timeOfDay = "Evening";
    greetingText = "Track payments and prep invoices for tomorrow.";
    image = yawningFace;
  }

  return (
    <div className="mb-[7vw] md:mb-[2vw]">
      <span className="font-clash flex items-center leading-none text-[6vw] text-black md:text-[3.5vw] lg:text-[2.5vw]">
        {timeOfDay}, {user?.name?.split(" ")[1]}!
        <img src={image} alt="emoji" className="ml-3 w-10 h-10" />
      </span>
      <p className="text-[4vw] font-satoshi text-neutral-700 md:text-base lg:text-[1.2vw]">
        {greetingText}
      </p>
    </div>
  );
};

export default Greeting;
