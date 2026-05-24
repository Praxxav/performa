import Svg from "../../assets/Images/SVG Icons/Group (5).svg";
import Svg2 from "../../assets/Images/SVG Icons/Group (4).svg";

const testimonials = [
  {
    quote:
      "This tool has completely transformed the way I manage invoices. It's fast, eff" +
      "icient, and user-friendly.",
    name: "Jane Doe",
    title: "Freelancer",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    quote:
      "I love the customization options. My invoices look professional, and my client" +
      "s appreciate it!",
    name: "John Smith",
    title: "Small Business Owner",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    quote:
      "The platform’s ease of use and seamless payment integration has saved me so mu" +
      "ch time. Highly recommend!",
    name: "Emily Clark",
    title: "Agency Owner",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    quote:
      "An incredible tool that makes invoicing smooth and simple. My productivity has" +
      " increased significantly!",
    name: "Michael Lee",
    title: "Entrepreneur",
    image: "https://randomuser.me/api/portraits/men/45.jpg",
  },
];

const Testimonial = () => {
  return (
    <section className="relative pb-6 lg:py-16">
      <div className="absolute left-0 -bottom-[5vw]">
        <img src={Svg} alt="Icon" className="w-[10vw] h-[10vw]" />
      </div>
      <div className="absolute right-0 -top-[3vw]">
        <img src={Svg2} alt="Icon" className="w-[10vw] h-[10vw]" />
      </div>
      <div>
        <h2 className="text-[8vw] text-center font-bold font-satoshi mb-8 text-gray-900 md:text-[4.5vw] lg:text-[3vw]">
          What Our Users Say
        </h2>

        {/* Carousel 1 - Scroll Right */}
        <div className="relative">
          {/* Left fading effect */}
          <div className="absolute top-0 left-0 h-full w-[20%] bg-gradient-to-r from-[#F5F5F5] to-transparent z-10 pointer-events-none"></div>
          <div className="overflow-x-clip mb-8">
            <div className="animate-scroll space-x-6">
              {testimonials.concat(testimonials).map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-white shadow-lg rounded-xl p-4 lg:p-8 mx-2 min-w-[300px] lg:min-w-[400px]"
                >
                  <p className="whitespace-normal text-[4vw] font-satoshi text-gray-800 mb-4 md:text-base lg:text-lg">
                    “{testimonial.quote}”
                  </p>
                  <div className="flex items-center space-x-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    <div className="text-left">
                      <h4 className="text-Gray900 text-[4vw] font-satoshi font-extrabold md:text-lg lg:text-[1vw]">
                        {testimonial.name}
                      </h4>
                      <p className="text-Gray800 font-satoshi text-sm">
                        {testimonial.title}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Right fading effect */}
          <div className="absolute top-0 right-0 h-full w-[20%] bg-gradient-to-l from-[#F5F5F5] to-transparent z-10 pointer-events-none"></div>
        </div>

        {/* Carousel 2 - Scroll Left */}
        <div className="relative">
          {/* Left fading effect */}
          <div className="absolute top-0 left-0 h-full w-[20%] bg-gradient-to-r from-[#F5F5F5] to-transparent z-10 pointer-events-none"></div>
          <div className="overflow-x-clip mb-8">
            <div className="animate-scroll-reverse space-x-6">
              {testimonials.concat(testimonials).map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-white shadow-lg rounded-xl p-6 lg:p-8 mx-2 min-w-[300px] lg:min-w-[400px]"
                >
                  <p className="whitespace-normal text-[4vw] font-satoshi text-gray-800 mb-4 md:text-base lg:text-lg">
                    “{testimonial.quote}”
                  </p>
                  <div className="flex items-center space-x-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    <div className="text-left">
                      <h4 className="text-Gray900 text-[4vw] font-satoshi font-extrabold md:text-lg lg:text-[1vw]">
                        {testimonial.name}
                      </h4>
                      <p className="text-Gray800 font-satoshi text-sm">
                        {testimonial.title}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Right fading effect */}
          <div className="absolute top-0 right-0 h-full w-[20%] bg-gradient-to-l from-[#F5F5F5] to-transparent z-10 pointer-events-none"></div>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
