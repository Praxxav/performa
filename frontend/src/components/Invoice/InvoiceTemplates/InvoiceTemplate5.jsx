import { Plus } from "lucide-react";
import { useState } from "react";
import { FiX } from "react-icons/fi";
import { toast } from "react-toastify";

const InvoiceTemplate5 = ({ isStaticMode }) => {
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: "",
    dueDate: "",
    invoiceDate: "",
    reference: "",
    clientName: "",
    clientAddress: "",
    cityCountry: "",
    phone: "",
    companyName: "HIGHRANGEKART",
    companyAddress: "Door No 23, Thirumuruganpoondi, Avinashi Taluk",
    cityStateZip: "Tiruppur, Tamil Nadu\nGSTIN : 33ABNPI2664N1ZA\nState Code : 32",
    country: "Phone : 8714076700\nEmail : sales@dehcy.in",
    contactEmail: "Your email address",
    contactPhone: "+91 00000 00000",
    igst: 0,
    tableHeaders: ["Item description", "HSN/SKU", "Qty", "Rate", "GST %", "Amount"],
    bankDetails: {
      bankName: "",
      ifsCode: "",
      swiftCode: "",
      accountNumber: "",
    },
    items: [
      {
        description: "",
        hsnSku: "",
        qty: "",
        rate: "",
        gstPercentage: 0,
        amount: 0.0,
      },
    ],
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
      newItems[index].amount = (parseFloat(newItems[index].qty) || 0) * (parseFloat(newItems[index].rate) || 0);
    }

    setInvoiceData({
      ...invoiceData,
      items: newItems,
    });
  };

  const addNewItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [
        ...invoiceData.items,
        {
          description: "Enter a description",
          hsnSku: "",
          qty: 1,
          rate: 0.0,
          gstPercentage: 0,
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

  const calculateSubTotal = () => {
    return invoiceData.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  };

  const calculateCGST = () => {
    return invoiceData.items.reduce((sum, item) => {
      const amount = parseFloat(item.amount) || 0;
      const gstPercent = parseFloat(item.gstPercentage) || 0;
      return sum + (amount * (gstPercent / 100)) / 2;
    }, 0);
  };

  const calculateSGST = () => {
    return invoiceData.items.reduce((sum, item) => {
      const amount = parseFloat(item.amount) || 0;
      const gstPercent = parseFloat(item.gstPercentage) || 0;
      return sum + (amount * (gstPercent / 100)) / 2;
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubTotal() + calculateCGST() + calculateSGST() + parseFloat(invoiceData.igst || 0);
  };

  const handleTableHeaderChange = (index, value) => {
    const newHeaders = [...invoiceData.tableHeaders];
    newHeaders[index] = value;
    setInvoiceData({
      ...invoiceData,
      tableHeaders: newHeaders,
    });
  };

  return (
    <div className="min-w-[800px] w-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-12">
        <h1 className="font-clash font-extrabold text-3xl">
          Invoice
        </h1>
        <div className="flex space-x-[0.5vw] items-center">
          <p className="text-2xl">№</p>
          <div
            contentEditable
            className="focus:outline-none border-b border-transparent py-1 hover:border-gray-300 text-gray-600 font-satoshi text-base"
            data-invoice-field="invoiceNumber"
            onInput={(e) =>
              handleFieldChange("invoiceNumber", e.target.textContent)
            }
          >
            ******
          </div>
        </div>
      </div>

      {/* Invoice Info */}
      <div className="grid grid-cols-3 gap-8 mb-12">
        <div>
          <p className="font-bold mb-2 font-satoshi text-base">
            Payable ₹{calculateTotal().toFixed(2)}
          </p>
          <div className="text-gray-600 space-y-[0.3vw]">
            <div className="flex space-x-[0.2vw]">
              <span className="text-gray-600 font-satoshi text-base">
                Due:
              </span>
              {isStaticMode ? (
                <span
                  className="font-satoshi text-base"
                  data-invoice-field="dueDate"
                >
                  {invoiceData.dueDate || ""}
                </span>
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
            <div className="flex space-x-[0.2vw]">
              <span className="text-gray-600 font-satoshi text-base">
                Issued:
              </span>
              {isStaticMode ? (
                <span
                  className="font-satoshi text-base"
                  data-invoice-field="invoiceDate"
                >
                  {invoiceData.invoiceDate || ""}
                </span>
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
            <div className="flex space-x-[0.2vw] ">
              <h2 className="text-gray-600 font-satoshi text-base">
                Ref:
              </h2>
              <div
                contentEditable
                className="focus:outline-none border-b border-transparent hover:border-gray-300 text-gray-600 font-satoshi font-bold text-base"
                onInput={(e) =>
                  handleFieldChange("reference", e.target.textContent)
                }
              >
                INV-057
              </div>
            </div>
          </div>
        </div>

        {/* Bill To Section */}
        <div className="mb-[5vw]">
          <div>
            <h2 className="font-satoshi font-semibold text-gray-900 mb-2 text-lg">
              Billed to:
            </h2>
            <div className="space-y-2">
              <div
                contentEditable
                className="block text-gray-500 w-full font-bold font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 text-base"
                data-invoice-field="clientName"
                onInput={(e) =>
                  handleFieldChange("clientName", e.target.textContent)
                }
              >
                Client&apos;s Name
              </div>

              <div
                contentEditable
                className="block w-full text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 text-base"
                data-invoice-field="clientAddress"
                onInput={(e) =>
                  handleFieldChange("clientAddress", e.target.textContent)
                }
              >
                Client&apos;s email address
              </div>
              <div
                contentEditable
                className="block w-full text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 text-base"
                onInput={(e) =>
                  handleFieldChange("cityCountry", e.target.textContent)
                }
              >
                Country
              </div>

              <div
                contentEditable
                className="block w-full text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 text-base"
                onInput={(e) =>
                  handleFieldChange("phone", e.target.textContent)
                }
              >
                +0 (000) 123-4567
              </div>
            </div>
          </div>
        </div>

        <div>
          <p className="font-bold mb-2 font-satoshi text-lg">
            From:
          </p>
          <div className="space-y-2">
            <div
              contentEditable suppressContentEditableWarning={true}
              className="block text-gray-500 w-full font-bold font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 text-base"
              onBlur={(e) => handleFieldChange("companyName", e.target.innerText)}
            >
              {invoiceData.companyName}
            </div>
            <div
              contentEditable suppressContentEditableWarning={true}
              className="block w-full text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 text-base whitespace-pre-wrap"
              onBlur={(e) => handleFieldChange("companyAddress", e.target.innerText)}
            >
              {invoiceData.companyAddress}
            </div>
            <div
              contentEditable suppressContentEditableWarning={true}
              className="block w-full text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 md:text-base whitespace-pre-wrap"
              onBlur={(e) => handleFieldChange("cityStateZip", e.target.innerText)}
            >
              {invoiceData.cityStateZip}
            </div>
            <div
              contentEditable suppressContentEditableWarning={true}
              className="block w-full text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 md:text-base whitespace-pre-wrap"
              onBlur={(e) => handleFieldChange("country", e.target.innerText)}
            >
              {invoiceData.country}
            </div>
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div className="relative mb-12">
        {/* Pink Accent Bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-pink-500"></div>

        <div className="pl-8">
          <table className="w-full">
            <thead>
              <tr className="text-gray-800 uppercase border-b">
                {invoiceData.tableHeaders.map((header, index) => (
                  <th key={index} className="text-left pb-4 px-4 font-satoshi text-base">
                    {isStaticMode ? (
                      <span>{header}</span>
                    ) : (
                      <input
                        type="text"
                        className="w-full bg-transparent focus:outline-none text-gray-800 uppercase"
                        value={header}
                        onChange={(e) => handleTableHeaderChange(index, e.target.value)}
                      />
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoiceData.items.map((item, index) => (
                <tr key={index} className="border-b group relative">
                  <td>
                    {isStaticMode ? (
                      <div
                        className="w-[300px] px-4 py-2 font-satoshi text-base whitespace-pre-wrap"
                        data-invoice-field="description"
                      >
                        {item.description || ""}
                      </div>
                    ) : (
                      <textarea
                        data-invoice-field="description"
                        className="w-[300px] px-4 py-3 focus:outline-none font-satoshi text-base bg-transparent resize-none overflow-hidden"
                        rows={item.description.split('\n').length || 1}
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
                      <p className="px-4 py-2 font-satoshi text-base">
                        {item.hsnSku || ""}
                      </p>
                    ) : (
                      <input
                        type="text"
                        className="w-full px-4 py-3 focus:outline-none font-satoshi text-base bg-transparent"
                        value={item.hsnSku}
                        placeholder="HSN/SKU"
                        onChange={(e) =>
                          handleItemChange(index, "hsnSku", e.target.value)
                        }
                      />
                    )}
                  </td>
                  <td>
                    {isStaticMode ? (
                      <p className="px-4 py-2 font-satoshi text-base">
                        {item.qty || ""}
                      </p>
                    ) : (
                      <input
                        type="number"
                        className="w-full px-4 py-3 focus:outline-none font-satoshi text-base bg-transparent"
                        value={item.qty}
                        placeholder="1"
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "qty",
                            e.target.value
                          )
                        }
                      />
                    )}
                  </td>
                  <td>
                    {isStaticMode ? (
                      <p className="px-4 py-2 font-satoshi text-base">
                        {item.rate || ""}
                      </p>
                    ) : (
                      <input
                        type="number"
                        className="w-full px-4 py-3 focus:outline-none font-satoshi text-base bg-transparent"
                        value={item.rate}
                        placeholder="0.00"
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "rate",
                            e.target.value
                          )
                        }
                      />
                    )}
                  </td>
                  <td>
                    {isStaticMode ? (
                      <p className="px-4 py-2 font-satoshi text-base">
                        {item.gstPercentage || "0"}
                      </p>
                    ) : (
                      <input
                        type="number"
                        className="w-full px-4 py-3 focus:outline-none font-satoshi text-base bg-transparent"
                        value={item.gstPercentage}
                        placeholder="0"
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "gstPercentage",
                            e.target.value
                          )
                        }
                      />
                    )}
                  </td>
                  <td>
                    {isStaticMode ? (
                      <p className="px-4 py-2 font-satoshi text-base">
                        ₹{item.amount.toFixed(2)}
                      </p>
                    ) : (
                      <span className="px-4 py-3 font-satoshi text-base">
                        ₹{item.amount.toFixed(2)}
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

          {isStaticMode ? (
            ""
          ) : (
            <button
              onClick={addNewItem}
              className="flex items-center gap-2 text-blue-400 my-4 font-satoshi text-base"
            >
              <Plus size={16} />
              Add Line Item
            </button>
          )}

          <div className="mt-4 space-y-2">
            <div className="flex justify-end">
              <span className="font-satoshi text-base w-[150px]">
                Taxable Value:
              </span>
              <span className="text-right font-satoshi text-base w-[150px]">
                ₹{calculateSubTotal().toFixed(2)}
              </span>
            </div>
            <div className="flex justify-end">
              <span className="font-satoshi text-base w-[150px]">
                CGST:
              </span>
              <span className="text-right font-satoshi text-base w-[150px]">
                ₹{calculateCGST().toFixed(2)}
              </span>
            </div>
            <div className="flex justify-end">
              <span className="font-satoshi text-base w-[150px]">
                SGST:
              </span>
              <span className="text-right font-satoshi text-base w-[150px]">
                ₹{calculateSGST().toFixed(2)}
              </span>
            </div>
            <div className="flex justify-end">
              <span className="font-satoshi text-base w-[150px]">
                IGST:
              </span>
              <span className="text-right font-satoshi text-base w-[150px]">
                {isStaticMode ? (
                  <span>{invoiceData.igst}</span>
                ) : (
                  <input
                    type="number"
                    className="w-full text-right focus:outline-none bg-transparent"
                    value={invoiceData.igst}
                    onChange={(e) => handleFieldChange("igst", e.target.value)}
                  />
                )}
              </span>
            </div>
            <div className="flex justify-end text-pink-500 font-medium">
              <span className="font-satoshi text-base w-[150px]">
                Total
              </span>
              <span
                className="text-right font-satoshi text-base w-[150px]"
                data-invoice-field="invoiceAmount"
              >
                ₹{calculateTotal().toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="grid grid-cols-2 gap-8">
        <div className="border-l-2 border-gray-200 pl-4">
          <h3 className="font-bold mb-1 font-satoshi text-base">
            Payment details
          </h3>
          <p className="text-gray-600 mb-4 font-satoshi text-base">
            Please pay within 15 days of receiving this invoice.
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 font-satoshi text-base">
                Bank name:
              </span>
              <span
                contentEditable
                className="block w-full font-satoshi py-2 text-gray-500 focus:outline-none border-b border-transparent hover:border-gray-300 text-base"
                onInput={(e) =>
                  handleFieldChange(
                    "bankDetails.bankName",
                    e.target.textContent
                  )
                }
              >
                ABCD BANK
              </span>
            </div>
            <div>
              <span className="text-gray-600 font-satoshi text-base">
                IFS code:
              </span>
              <span
                contentEditable
                className="block w-full font-satoshi py-2 text-gray-500 focus:outline-none border-b border-transparent hover:border-gray-300 text-base"
                onInput={(e) =>
                  handleFieldChange("bankDetails.ifsCode", e.target.textContent)
                }
              >
                ABCD000XXXX
              </span>
            </div>
            <div>
              <span className="text-gray-600 font-satoshi text-base">
                Swift code:
              </span>
              <span
                contentEditable
                className="block w-full font-satoshi py-2 text-gray-500 focus:outline-none border-b border-transparent hover:border-gray-300 text-base"
                onInput={(e) =>
                  handleFieldChange(
                    "bankDetails.swiftCode",
                    e.target.textContent
                  )
                }
              >
                ABCDUSBXXX
              </span>
            </div>
            <div>
              <span className="text-gray-600 font-satoshi text-base">
                Account No:
              </span>
              <span
                contentEditable
                className="block w-full font-satoshi py-2 text-gray-500 focus:outline-none border-b border-transparent hover:border-gray-300 text-base"
                onInput={(e) =>
                  handleFieldChange(
                    "bankDetails.accountNumber",
                    e.target.textContent
                  )
                }
              >
                374749823000011
              </span>
            </div>
          </div>
        </div>

        <div className="border-l-2 border-gray-200 pl-4">
          <h3 className="font-bold mb-2 font-satoshi text-base">
            Thanks for the business.
          </h3>
          <div className="text-gray-600">
            <div
              contentEditable suppressContentEditableWarning={true}
              className="block w-full text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 text-base"
              onBlur={(e) =>
                handleFieldChange("contactEmail", e.target.innerText)
              }
            >
              {invoiceData.contactEmail}
            </div>
            <div
              contentEditable suppressContentEditableWarning={true}
              className="block w-full text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 text-base"
              onBlur={(e) =>
                handleFieldChange("contactPhone", e.target.innerText)
              }
            >
              {invoiceData.contactPhone}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplate5;
