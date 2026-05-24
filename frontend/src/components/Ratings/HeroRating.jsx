
import { IoStar } from "react-icons/io5";
import Image1 from "../../assets/Images/gettyimages-1321081723-612x612.jpg";
import Image2 from "../../assets/Images/gettyimages-1431569188-612x612.jpg";
import Image3 from "../../assets/Images/gettyimages-1683003966-612x612.jpg";
import Image4 from "../../assets/Images/gettyimages-2162083704-612x612.jpg";

// Example user images
const userImages = [
    Image1,
    Image2,
    Image3,
    Image4
];

const HeroRating = () => {
  return (
    <div className="flex items-center space-x-2 my-[2vw] lg:my-[1vw]">
      {/* User Images */}
      <div className="flex -space-x-3">
        {userImages.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`User ${i + 1}`}
            className="w-11 h-11 object-cover rounded-full border-2 border-white shadow-md"
          />
        ))}
      </div>

<div className="flex flex-col space-y-[0.2vw]">
     {/* Stars */}
     <div className="flex space-x-1">
        {[...Array(5)].map((_, i) => (
          <IoStar 
            key={i}
            className="text-yellow-400"
            size={20}
          />
        ))}
      </div>

      {/* Text */}
      <span className="text-gray-800 font-satoshi font-medium text-sm">
        Satisfied customers
      </span>
</div>
     
    </div>
  );
};

export default HeroRating;
