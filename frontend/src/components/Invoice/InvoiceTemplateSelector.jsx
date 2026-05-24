import { useState } from "react";
import Image1 from "../../assets/Images/invoice.jpg";
import Image2 from '../../assets/Images/Invoice 1.jpg';
import Image3 from '../../assets/Images/Invoice 2.jpg';
import Image4 from '../../assets/Images/Invoice 3.jpg';
import Image5 from '../../assets/Images/Invoice 4.jpg';
import Image6 from '../../assets/Images/Invoice 5.jpg';
import Image7 from '../../assets/Images/Invoice 6.jpg';
import Image8 from '../../assets/Images/Invoice 7.jpg';
import InvoiceTemplate1 from "./InvoiceTemplates/InvoiceTemplate1";
import InvoiceTemplate2 from "./InvoiceTemplates/InvoiceTemplate2";
import InvoiceTemplate3 from "./InvoiceTemplates/InvoiceTemplate3";
import InvoiceTemplate4 from "./InvoiceTemplates/InvoiceTemplate4";
import InvoiceTemplate5 from "./InvoiceTemplates/InvoiceTemplate5";
import InvoiceTemplate6 from "./InvoiceTemplates/InvoiceTemplate6";
import InvoiceTemplate7 from "./InvoiceTemplates/InvoiceTemplate7";
import InvoiceTemplate8 from "./InvoiceTemplates/InvoiceTemplate8";



const templates = [
  {
    id: 1,
    name: "Invoice Template 1",
    image: Image1,
    component: InvoiceTemplate1,
  },
  // {
  //   id: 2,
  //   name: "Invoice Template 2",
  //   image: Image2, 
  //   component: InvoiceTemplate2,
  // },
  // {
  //   id: 3,
  //   name: "Invoice Template 3",
  //   image: Image3, 
  //   component: InvoiceTemplate3,
  // },
  // {
  //   id: 4,
  //   name: "Invoice Template 4",
  //   image: Image4, 
  //   component: InvoiceTemplate4,
  // },
  {
    id: 5,
    name: "Invoice Template 5",
    image: Image5,
    component: InvoiceTemplate5,
  },
  // {
  //   id: 6,
  //   name: "Invoice Template 6",
  //   image: Image6,
  //   component: InvoiceTemplate6,
  // },
  // {
  //   id: 7,
  //   name: "Invoice Template 7",
  //   image: Image7,
  //   component: InvoiceTemplate7,
  // },
  // {
  //   id: 8,
  //   name: "Invoice Template 8",
  //   image: Image8,
  //   component: InvoiceTemplate8,
  // },
];

const InvoiceTemplateSelector = ({ onSelectTemplate }) => {
  const [hoveredTemplate, setHoveredTemplate] = useState(null);

  return (
    <div className="grid grid-cols-2 gap-3 px-3 pb-6 w-full md:grid-cols-4 lg:grid-cols-2">
      {templates.map((template) => (
        <div
          key={template.id}
          className="relative cursor-pointer border border-gray-300"
          onMouseEnter={() => setHoveredTemplate(template.id)}
          onMouseLeave={() => setHoveredTemplate(null)}
          onClick={() => onSelectTemplate(template)}
        >
          <img src={template.image} alt={template.name} className="w-full object-contain md:h-[25vw] lg:w-[12vw] lg:h-[13.5vw] lg:object-cover" />
          {hoveredTemplate === template.id && (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 bg-opacity-50 transition-opacity">
              <button className="bg-transparent text-sm text-white border border-gray-300 p-1  font-satoshi font-medium shadow-md lg:text-[0.8vw]">
                Click to Edit
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default InvoiceTemplateSelector;