import { Plus } from "lucide-react";
import { useState } from "react";
import { FiUpload, FiX } from "react-icons/fi";
import { toast } from "react-toastify";

const InvoiceTemplate3 = ({ isStaticMode }) => {
  const [invoiceData, setInvoiceData] = useState({
    companyLogo: null,
    companyName: "",
    businessCity: "",
    businessTaxInfo: "",
    clientName: "",
    clientAddress: "",
    clientCountry: "",
    phone: "",
    invoiceNumber: "",
    reference: "",
    invoiceDate: "",
    dueDate: "",
    companyAddress: "",
    contactPhone: "",
    items: [
      {
        description: "",
        qty: "",
        rate: "",
        amount: 0.0,
      },
    ],
    notes: "",
  });

  const handleFieldChange = (field, value) => {
    setInvoiceData({
      ...invoiceData,
      [field]: value,
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...invoiceData.items];
    newItems[index][field] = value;

    if (field === "qty" || field === "rate") {
      newItems[index].amount = newItems[index].qty * newItems[index].rate;
    }

    setInvoiceData({
      ...invoiceData,
      items: newItems,
    });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInvoiceData((prevData) => ({
          ...prevData,
          companyLogo: reader.result, // Convert image to base64 URL
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setInvoiceData((prevData) => ({
      ...prevData,
      companyLogo: null, // Clear uploaded logo
    }));
  };

  const addNewItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [
        ...invoiceData.items,
        {
          description: "Enter a description",
          qty: 1,
          rate: 0.0,
          amount: 0.0,
        },
      ],
    });
  };

  const deleteItem = (indexToRemove) => {
    // Prevent deleting the last item
    if (invoiceData.items.length <= 1) {
      // Optionally, show a toast or alert
      toast.warn("At least one item is required!");
      return;
    }

    setInvoiceData({
      ...invoiceData,
      items: invoiceData.items.filter((_, index) => index !== indexToRemove),
    });
  };

  const subtotal = invoiceData.items.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <div className="min-w-[800px] w-full">
      {/* Header */}
      <div className="flex justify-between mb-12">
        <div
          className="relative group w-[120px] h-[120px] rounded-md flex items-center justify-center cursor-pointer"
          onClick={() => document.getElementById("fileInput").click()}
        >
          {invoiceData.companyLogo ? (
            <>
              {" "}
              <img
                src={invoiceData.companyLogo}
                alt="Company Logo"
                className="w-full h-full object-cover rounded-md"
              />{" "}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent file input trigger
                  removeLogo();
                }}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <FiX size={16} />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-md text-gray-400 w-[120px] h-[120px] border-2 border-dashed border-gray-300 hover:border-gray-400">
              <FiUpload size={24} />
              <p className="font-satoshi mt-1 text-base">
                Upload Logo
              </p>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            type="file"
            id="fileInput"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />
        </div>
        <div className="text-right space-y-2">
          <div
            contentEditable
            className="block w-full text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 text-base"
            data-invoice-field="companyName"
            onInput={(e) =>
              handleFieldChange("companyName", e.target.textContent)
            }
          >
            Your Name
          </div>
          <div
            contentEditable
            className="block w-full text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 text-base"
            onInput={(e) =>
              handleFieldChange("businessCity", e.target.textContent)
            }
          >
            City
          </div>
          <div className="flex space-x-[0.5vw]">
            <h2 className="text-gray-600 font-satoshi text-base">
              TAX ID:
            </h2>
            {isStaticMode ? (
              <div className="font-satoshi text-base">
                {invoiceData.businessTaxInfo || "00XXXXX1234X0XX"}
              </div>
            ) : (
              <div
                contentEditable
                className="focus:outline-none border-b border-transparent hover:border-gray-300 text-gray-600 font-satoshi text-base"
                onInput={(e) =>
                  handleFieldChange("businessTaxInfo", e.target.textContent)
                }
              >
                00XXXXX1234X0XX
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bill To Section */}
      <div className="mb-[5vw]">
        <div>
          <h2 className="font-satoshi font-semibold text-gray-900 mb-2 text-lg">
            Billed to:
          </h2>
          <div className="space-y-4">
            <div
              contentEditable
              className="block w-[200px] font-bold font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 text-xl"
              data-invoice-field="clientName"
              onInput={(e) =>
                handleFieldChange("clientName", e.target.textContent)
              }
            >
              Client&apos;s Name
            </div>

            <div
              contentEditable
              className="block w-[200px] text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 text-base"
              data-invoice-field="clientAddress"
              onInput={(e) =>
                handleFieldChange("clientAddress", e.target.textContent)
              }
            >
              Client&apos;s Address
            </div>
            <div
              contentEditable
              className="block w-[200px] text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 text-base"
              onInput={(e) =>
                handleFieldChange("clientCountry", e.target.textContent)
              }
            >
              Country
            </div>

            <div
              contentEditable
              className="block w-[200px] text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 text-base"
              onInput={(e) => handleFieldChange("phone", e.target.textContent)}
            >
              +0 (000) 123-4567
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-2 space-x-[2vw] mb-8">
        <div className="flex justify-between">
          <div className="flex flex-col">
            <p className="text-gray-600 font-satoshi text-base">
              Due Date:
            </p>
            {isStaticMode ? (
              <p
                className="font-satoshi text-base"
                data-invoice-field="dueDate"
              >
                {invoiceData.dueDate || ""}
              </p>
            ) : (
              <input
                type="date"
                data-invoice-field="dueDate"
                className="focus:outline-none border-b border-transparent hover:border-gray-300 text-gray-600 font-satoshi text-base"
                value={invoiceData.dueDate}
                onChange={(e) => handleFieldChange("dueDate", e.target.value)}
              />
            )}
          </div>
          <div className="flex flex-col">
            <p className="text-gray-600 font-satoshi text-base">
              Invoice Date:
            </p>
            {isStaticMode ? (
              <p
                className="font-satoshi text-base"
                data-invoice-field="invoiceDate"
              >
                {invoiceData.invoiceDate || ""}
              </p>
            ) : (
              <input
                type="date"
                data-invoice-field="invoiceDate"
                className="focus:outline-none border-b border-transparent hover:border-gray-300 text-gray-600 font-satoshi text-base"
                value={invoiceData.invoiceDate}
                onChange={(e) =>
                  handleFieldChange("invoiceDate", e.target.value)
                }
              />
            )}
          </div>
        </div>
        <div className="flex justify-between">
          <div className="flex flex-col">
            <h2 className="text-gray-600 font-satoshi text-base">
              Invoice Number:
            </h2>
            <p
              contentEditable
              className="focus:outline-none border-b border-transparent hover:border-gray-300 text-gray-900 font-satoshi font-bold text-base"
              data-invoice-field="invoiceNumber"
              onInput={(e) =>
                handleFieldChange("invoiceNumber", e.target.textContent)
              }
            >
              #AB2324-01
            </p>
          </div>
          <div className="flex flex-col">
            <h2 className="text-gray-600 font-satoshi text-base">
              Reference:
            </h2>
            <p
              contentEditable
              className="focus:outline-none border-b border-transparent hover:border-gray-300 text-gray-900 font-satoshi font-bold text-base"
              onInput={(e) =>
                handleFieldChange("reference", e.target.textContent)
              }
            >
              INV-057
            </p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="text-left p-2 font-satoshi text-lg">
                Item description
              </th>
              <th className="p-2 font-satoshi text-lg text-left">
                Qty
              </th>
              <th className="p-2 font-satoshi text-lg text-left">
                Rate
              </th>
              <th className="p-2 font-satoshi text-lg text-left">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items.map((item, index) => (
              <tr key={index} className="border-b group relative">
                <td>
                  {isStaticMode ? (
                    <p
                      className="w-[400px] p-2 font-satoshi text-base"
                      data-invoice-field="description"
                    >
                      {item.description || ""}
                    </p>
                  ) : (
                    <input
                      type="text"
                      data-invoice-field="description"
                      className="w-[400px] px-2 py-3 focus:outline-none font-satoshi text-base"
                      value={item.description}
                      placeholder="Enter a description"
                      onChange={(e) =>
                        handleItemChange(index, "description", e.target.value)
                      }
                    />
                  )}
                </td>
                <td>
                  {isStaticMode ? (
                    <p className="p-2 font-satoshi text-base">
                      {item.qty || ""}
                    </p>
                  ) : (
                    <input
                      type="number"
                      className="w-full px-2 py-3 focus:outline-none font-satoshi text-base"
                      value={item.qty}
                      placeholder="1"
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "qty",
                          parseFloat(e.target.value)
                        )
                      }
                    />
                  )}
                </td>
                <td>
                  {isStaticMode ? (
                    <p className="p-2 font-satoshi text-base">
                      {item.rate || ""}
                    </p>
                  ) : (
                    <input
                      type="number"
                      className="w-full px-2 py-3 focus:outline-none font-satoshi text-base"
                      value={item.rate}
                      placeholder="0.00"
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "rate",
                          parseFloat(e.target.value)
                        )
                      }
                    />
                  )}
                </td>

                <td>
                  {isStaticMode ? (
                    <p className="p-2 font-satoshi text-base">
                      {item.amount.toFixed(2)}
                    </p>
                  ) : (
                    <span className="px-2 font-satoshi text-base">
                      {item.amount.toFixed(2)}
                    </span>
                  )}
                </td>
                <td className="relative px-2 pb-4">
                  {isStaticMode ? (
                    ""
                  ) : (
                    <div className="absolute top-1/2 right-0 transform -translate-y-1/2 hidden group-hover:flex transition-opacity duration-200">
                      <button
                        onClick={() => deleteItem(index)}
                        title="Remove Item"
                        className="text-white bg-red-500 p-[0.2vw] rounded-full"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isStaticMode ? (
        ""
      ) : (
        <button
          onClick={addNewItem}
          className="flex items-center gap-2 text-blue-400 mb-4 font-satoshi text-base"
        >
          <Plus size={16} />
          Add Line Item
        </button>
      )}

      {/* Totals */}
      <div className="flex flex-col items-end space-y-[1vw] mr-[2vw]">
        <div className="flex justify-between w-[300px]">
          <span className="font-satoshi text-base">
            Subtotal:
          </span>
          <span className="font-satoshi text-base">
            ${subtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between border-b w-[300px]">
          <span className="font-satoshi text-base">
            Tax (10%):
          </span>
          <span className="font-satoshi text-base">
            ${tax.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between font-bold font-satoshi text-base w-[300px]">
          <span>Total</span>
          <span data-invoice-field="invoiceAmount">${total.toFixed(2)}</span>
        </div>
        {/* Total Due Button */}
        <div className="bg-blue-400 text-white rounded-b-lg px-3 py-2 flex justify-between items-center mb-4 w-[300px]">
          <p className="text-white font-bold font-satoshi text-base">
            Total due
          </p>
          <p className="text-white font-bold font-satoshi text-lg">
            USD ${total.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between text-gray-500 mt-[4vw]">
        <div>
          <div className="text-gray-800 font-bold font-satoshi text-base">
            Notes
          </div>
          <div
            contentEditable
            className="block w-full font-satoshi py-2 text-gray-500 focus:outline-none border-b border-transparent hover:border-gray-300 text-base"
            onInput={(e) => handleFieldChange("notes", e.target.textContent)}
          >
            Thanks for the business...
          </div>
        </div>
        <div className="text-right">
          <div
            contentEditable
            className="block w-full text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 text-base"
            onInput={(e) =>
              handleFieldChange("contactPhone", e.target.textContent)
            }
          >
            +91 00000 00000
          </div>
          <div
            contentEditable
            className="block w-full text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 text-base"
            data-invoice-field="companyAddress"
            onInput={(e) =>
              handleFieldChange("companyAddress", e.target.textContent)
            }
          >
            Your email address
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplate3;
