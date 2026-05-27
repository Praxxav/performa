import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { toast } from "react-toastify";

const convertNumberToWords = (amount, currencyName = "Rupees") => {
  const words = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  if (!amount || amount === 0) return `Zero ${currencyName} Only`;

  const numToWords = (n) => {
    if (n < 20) return words[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + words[n % 10] : "");
    if (n < 1000) return words[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " " + numToWords(n % 100) : "");
    if (n < 100000) return numToWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + numToWords(n % 1000) : "");
    if (n < 10000000) return numToWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 !== 0 ? " " + numToWords(n % 100000) : "");
    return numToWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 !== 0 ? " " + numToWords(n % 10000000) : "");
  };

  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  let result = numToWords(rupees) + " " + currencyName;
  if (paise > 0) {
    const subunit = currencyName.toLowerCase() === "rupees" || currencyName.toLowerCase() === "inr" ? "Paise" : "Cents";
    result += " and " + numToWords(paise) + " " + subunit;
  }
  return result + " Only";
};

const InvoiceTemplate5 = ({ isStaticMode }) => {
  const [referenceCounter, setReferenceCounter] = useState(() => {
    const stored = localStorage.getItem("proforma_invoice_reference_counter");
    return stored ? parseInt(stored, 10) : 1;
  });

  useEffect(() => {
    const handleIncrement = () => {
      const stored = localStorage.getItem("proforma_invoice_reference_counter");
      setReferenceCounter(stored ? parseInt(stored, 10) : 1);
    };
    window.addEventListener("invoice_reference_incremented", handleIncrement);
    return () => {
      window.removeEventListener("invoice_reference_incremented", handleIncrement);
    };
  }, []);

  const defaultReference = `INV-${String(referenceCounter).padStart(3, "0")}`;

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
    tableHeaders: ["Item description", "HSN/SKU", "Qty", "Rate", "CGST/SGST %", "Amount"],
    currencySymbol: "₹",
    currencyName: "Rupees",
    termsOfService: "1. This is a Proforma Invoice only and not a Tax Invoice.\n2. Goods/Services will be delivered after payment confirmation.\n3. Prices are inclusive/exclusive of GST as mentioned.\n4. Payment once made is non-refundable.\n5. Subject to Chennai Jurisdiction.",
    bankDetails: {
      accountName: "YOUR COMPANY NAME",
      bankName: "HDFC Bank",
      accountNumber: "XXXXXXXXXXXXX",
      ifscCode: "HDFC000XXXX",
      branch: "Chennai",
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

  const handleBankFieldChange = (field, value) => {
    setInvoiceData({
      ...invoiceData,
      bankDetails: {
        ...invoiceData.bankDetails,
        [field]: value,
      },
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
    <div className="min-w-[800px] w-full bg-white p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-12">
        <h1 className="font-clash font-extrabold text-3xl">
          Invoice
        </h1>
        <div className="flex space-x-[0.5vw] items-center">
          <p className="text-2xl">№</p>
          <div
            contentEditable suppressContentEditableWarning={true}
            className="focus:outline-none border-b border-transparent py-1 hover:border-gray-300 text-gray-600 font-satoshi text-base"
            data-invoice-field="invoiceNumber"
            onBlur={(e) =>
              handleFieldChange("invoiceNumber", e.target.innerText)
            }
          >
            {invoiceData.invoiceNumber || "******"}
          </div>
        </div>
      </div>

      {/* Invoice Info */}
      <div className="grid grid-cols-3 gap-8 mb-12">
        <div>
          <p className="font-bold mb-2 font-satoshi text-base">
            Payable {invoiceData.currencySymbol}{calculateTotal().toFixed(2)}
          </p>
          <div className="text-gray-600 space-y-[0.3vw]">
            <div className="flex space-x-[0.2vw] items-center">
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
            <div className="flex space-x-[0.2vw] items-center">
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
            <div className="flex space-x-[0.2vw] items-center">
              <h2 className="text-gray-600 font-satoshi text-base">
                Ref:
              </h2>
              <div
                contentEditable suppressContentEditableWarning={true}
                className="focus:outline-none border-b border-transparent hover:border-gray-300 text-gray-600 font-satoshi font-bold text-base"
                data-invoice-field="reference"
                onBlur={(e) =>
                  handleFieldChange("reference", e.target.innerText)
                }
              >
                {invoiceData.reference || defaultReference}
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
                contentEditable suppressContentEditableWarning={true}
                className="block text-gray-500 w-full font-bold font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 text-base"
                data-invoice-field="clientName"
                onBlur={(e) =>
                  handleFieldChange("clientName", e.target.innerText)
                }
              >
                {invoiceData.clientName || "Client's Name"}
              </div>

              <div
                contentEditable suppressContentEditableWarning={true}
                className="block w-full text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 text-base whitespace-pre-wrap"
                data-invoice-field="clientAddress"
                onBlur={(e) =>
                  handleFieldChange("clientAddress", e.target.innerText)
                }
              >
                {invoiceData.clientAddress || "Client's email address"}
              </div>
              <div
                contentEditable suppressContentEditableWarning={true}
                className="block w-full text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 text-base"
                onBlur={(e) =>
                  handleFieldChange("cityCountry", e.target.innerText)
                }
              >
                {invoiceData.cityCountry || "Country"}
              </div>

              <div
                contentEditable suppressContentEditableWarning={true}
                className="block w-full text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 text-base"
                onBlur={(e) =>
                  handleFieldChange("phone", e.target.innerText)
                }
              >
                {invoiceData.phone || "+0 (000) 123-4567"}
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
              data-invoice-field="companyName"
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
                        {item.amount.toFixed(2)}
                      </p>
                    ) : (
                      <span className="px-4 py-3 font-satoshi text-base inline-block">
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

          {isStaticMode ? (
            ""
          ) : (
            <button
              onClick={addNewItem}
              className="flex items-center gap-2 text-pink-500 my-4 font-satoshi text-base hover:text-pink-600 transition-colors"
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
                {calculateSubTotal().toFixed(2)}
              </span>
            </div>
            <div className="flex justify-end">
              <span className="font-satoshi text-base w-[150px]">
                CGST:
              </span>
              <span className="text-right font-satoshi text-base w-[150px]">
                {calculateCGST().toFixed(2)}
              </span>
            </div>
            <div className="flex justify-end">
              <span className="font-satoshi text-base w-[150px]">
                SGST:
              </span>
              <span className="text-right font-satoshi text-base w-[150px]">
                {calculateSGST().toFixed(2)}
              </span>
            </div>
            <div className="flex justify-end items-center">
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
            <div className="flex justify-end items-center text-pink-500 font-bold text-lg mt-2 pt-2 border-t border-gray-200">
              <span className="font-satoshi w-[150px]">
                Total
              </span>
              <span
                className="text-right font-satoshi w-[150px] flex justify-end items-center"
                data-invoice-field="invoiceAmount"
              >
                {isStaticMode ? <span>{invoiceData.currencySymbol}</span> : (
                  <input
                    type="text"
                    className="w-16 focus:outline-none bg-transparent text-right mr-1 text-pink-500"
                    value={invoiceData.currencySymbol}
                    onChange={(e) => handleFieldChange("currencySymbol", e.target.value)}
                    title="Edit Currency Symbol"
                  />
                )}
                {calculateTotal().toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="grid grid-cols-2 gap-8">
        <div className="border-l-2 border-gray-200 pl-4 flex flex-col gap-6">
          <div>
            <h3 className="font-bold mb-1 font-satoshi text-base flex items-center">
              Amount in Words:
              {!isStaticMode && (
                <span className="ml-2 font-normal text-xs text-gray-500 flex items-center">
                  (Currency:
                  <input
                    type="text"
                    className="w-16 ml-1 border-b border-gray-400 focus:outline-none bg-transparent text-gray-700"
                    value={invoiceData.currencyName}
                    onChange={(e) => handleFieldChange("currencyName", e.target.value)}
                    title="Edit Currency Name"
                  />
                  )
                </span>
              )}
            </h3>
            <p className="text-gray-600 font-satoshi text-base font-semibold">
              {convertNumberToWords(calculateTotal(), invoiceData.currencyName)}
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-2 font-satoshi text-base">
              BANK DETAILS
            </h3>
            <div className="grid grid-cols-[100px_1fr] gap-y-1 text-sm text-gray-600">
              <div className="font-semibold">Account Name</div>
              <div className="flex">
                <span className="mr-2">:</span>
                <div
                  contentEditable suppressContentEditableWarning={true}
                  className="focus:outline-none hover:bg-gray-100 flex-1 font-semibold"
                  onBlur={(e) => handleBankFieldChange("accountName", e.target.innerText)}
                >{invoiceData.bankDetails.accountName}</div>
              </div>
              <div className="font-semibold">Bank Name</div>
              <div className="flex">
                <span className="mr-2">:</span>
                <div
                  contentEditable suppressContentEditableWarning={true}
                  className="focus:outline-none hover:bg-gray-100 flex-1"
                  onBlur={(e) => handleBankFieldChange("bankName", e.target.innerText)}
                >{invoiceData.bankDetails.bankName}</div>
              </div>
              <div className="font-semibold">Account No</div>
              <div className="flex">
                <span className="mr-2">:</span>
                <div
                  contentEditable suppressContentEditableWarning={true}
                  className="focus:outline-none hover:bg-gray-100 flex-1"
                  onBlur={(e) => handleBankFieldChange("accountNumber", e.target.innerText)}
                >{invoiceData.bankDetails.accountNumber}</div>
              </div>
              <div className="font-semibold">IFSC Code</div>
              <div className="flex">
                <span className="mr-2">:</span>
                <div
                  contentEditable suppressContentEditableWarning={true}
                  className="focus:outline-none hover:bg-gray-100 flex-1"
                  onBlur={(e) => handleBankFieldChange("ifscCode", e.target.innerText)}
                >{invoiceData.bankDetails.ifscCode}</div>
              </div>
              <div className="font-semibold">Branch</div>
              <div className="flex">
                <span className="mr-2">:</span>
                <div
                  contentEditable suppressContentEditableWarning={true}
                  className="focus:outline-none hover:bg-gray-100 flex-1"
                  onBlur={(e) => handleBankFieldChange("branch", e.target.innerText)}
                >{invoiceData.bankDetails.branch}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-l-2 border-gray-200 pl-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold mb-2 font-satoshi text-base">
              TERMS & CONDITIONS
            </h3>
            <div
              contentEditable suppressContentEditableWarning={true}
              className="block w-full text-gray-600 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 text-sm whitespace-pre-wrap font-semibold"
              onBlur={(e) => handleFieldChange("termsOfService", e.target.innerText)}
            >
              {invoiceData.termsOfService}
            </div>
          </div>
          
          {/* <div className="mt-8">
            <h3 className="font-bold mb-2 font-satoshi text-base">
              Authorized Signatory
            </h3>
            <div className="border-t border-gray-300 pt-2 w-3/4">
              <div
                contentEditable suppressContentEditableWarning={true}
                className="block w-full text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 text-sm"
                data-invoice-field="companyName"
                onBlur={(e) => handleFieldChange("companyName", e.target.innerText)}
              >
                {invoiceData.companyName}
              </div>
            </div>
          </div> */}
        </div>
      </div>
      
      <div className="text-center italic mt-12 pb-4 text-xs font-semibold text-gray-500">
        This is a computer-generated Proforma Invoice and does not require a physical signature.
      </div>
    </div>
  );
};

export default InvoiceTemplate5;

