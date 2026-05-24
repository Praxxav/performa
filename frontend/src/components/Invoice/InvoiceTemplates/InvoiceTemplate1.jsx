import { useState } from "react";
import { FiX, FiUpload } from "react-icons/fi";
import { toast } from "react-toastify";
import { Plus } from "lucide-react";

const convertNumberToWords = (amount) => {
  const words = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  if (!amount || amount === 0) return "Zero Rupees Only";

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

  let result = numToWords(rupees) + " Rupees";
  if (paise > 0) {
    result += " and " + numToWords(paise) + " Paise";
  }
  return result + " Only";
};

const InvoiceTemplate1 = ({ isStaticMode }) => {
  const [invoiceData, setInvoiceData] = useState({
    companyLogo: null,
    companyName: "HIGHRANGEKART",
    companyAddress: "Door No 23, Thirumuruganpoondi, Avinashi Taluk",
    cityStateZip: "Tiruppur, Tamil Nadu\nGSTIN : 33ABNPI2664N1ZA\nState Code : 32",
    country: "Phone : 8714076700\nEmail : sales@dehcy.in",
    clientName: "Client Name",
    clientAddress: "Client Address",
    shipToName: "Client Name",
    shipToAddress: "Client Address",
    invoiceNumber: "103",
    invoiceDate: "DD/MM/YYYY",
    dispatchThrough: "Air",
    items: [
      {
        sNo: "1",
        description: "",
        hsnSku: "",
        quantity: "",
        rate: "",
        gstPercentage: 0,
        amount: 0.0,
      },
    ],
    amountInWords: "Zero Rupees Only",
    cgst: 0,
    sgst: 0,
    igst: 0,
    declaration: "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
    tableHeaders: ["S.No", "Description of Goods", "HSN/SKU", "Qty", "Rate", "GST %", "Amount"],
  });

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

  const handleItemChange = (index, field, value) => {
    const newItems = [...invoiceData.items];
    newItems[index][field] = value;

    if (field === "quantity" || field === "rate") {
      newItems[index].amount = (parseFloat(newItems[index].quantity) || 0) * (parseFloat(newItems[index].rate) || 0);
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
          sNo: (invoiceData.items.length + 1).toString(),
          description: "Enter a description",
          hsnSku: "",
          quantity: 1,
          rate: 0.0,
          gstPercentage: 0,
          amount: 0.0,
        },
      ],
    });
  };

  const deleteItem = (indexToRemove) => {
    if (invoiceData.items.length <= 1) {
      toast.warn("At least one item is required!");
      return;
    }
    setInvoiceData({
      ...invoiceData,
      items: invoiceData.items.filter((_, index) => index !== indexToRemove),
    });
  };

  const handleFieldChange = (field, value) => {
    setInvoiceData({
      ...invoiceData,
      [field]: value,
    });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInvoiceData((prevData) => ({
          ...prevData,
          companyLogo: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setInvoiceData((prevData) => ({
      ...prevData,
      companyLogo: null,
    }));
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
    <div className="min-w-[800px] w-full font-satoshi text-sm border-2 border-gray-800 bg-white">
      {/* Header section */}
      <div className="flex justify-between items-start border-b-2 border-gray-800">
        <div className="w-1/2 p-4 border-r-2 border-gray-800">
          <div
            className="relative w-[120px] h-[120px] group rounded-md flex items-center justify-center cursor-pointer mb-4"
            onClick={() => document.getElementById("fileInput").click()}
          >
            {invoiceData.companyLogo ? (
              <>
                <img
                  src={invoiceData.companyLogo}
                  alt="Company Logo"
                  className="w-full h-full object-cover rounded-md"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeLogo();
                  }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <FiX size={16} />
                </button>
              </>
            ) : (
              <div className="flex w-[120px] h-[120px] flex-col items-center justify-center rounded-md text-gray-400 border-2 border-dashed border-gray-300 hover:border-gray-400">
                <FiUpload size={24} />
                <p className="mt-1 text-sm text-center">Upload Logo</p>
              </div>
            )}
            <input
              type="file"
              id="fileInput"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>

          <div className="space-y-1 text-black font-semibold">
            <div
              contentEditable suppressContentEditableWarning={true}
              className="focus:outline-none hover:bg-gray-100 text-base font-bold"
              onBlur={(e) => handleFieldChange("companyName", e.target.innerText)}
            >
              {invoiceData.companyName}
            </div>
            <div
              contentEditable suppressContentEditableWarning={true}
              className="focus:outline-none hover:bg-gray-100 whitespace-pre-wrap"
              onBlur={(e) => handleFieldChange("companyAddress", e.target.innerText)}
            >
              {invoiceData.companyAddress}
            </div>
            <div
              contentEditable suppressContentEditableWarning={true}
              className="focus:outline-none hover:bg-gray-100 whitespace-pre-wrap"
              onBlur={(e) => handleFieldChange("cityStateZip", e.target.innerText)}
            >
              {invoiceData.cityStateZip}
            </div>
            <div
              contentEditable suppressContentEditableWarning={true}
              className="focus:outline-none hover:bg-gray-100 whitespace-pre-wrap"
              onBlur={(e) => handleFieldChange("country", e.target.innerText)}
            >
              {invoiceData.country}
            </div>
          </div>
        </div>

        <div className="w-1/2 flex flex-col justify-between h-full">
          <div className="text-center font-bold text-2xl py-4 border-b-2 border-gray-800">
            PROFORMA INVOICE
          </div>
          <div className="flex flex-col h-full">
            <div className="flex border-b border-gray-800">
              <div className="w-1/2 p-2 border-r border-gray-800 font-semibold">Invoice No</div>
              <div
                contentEditable suppressContentEditableWarning={true}
                className="w-1/2 p-2 focus:outline-none hover:bg-gray-100"
                onBlur={(e) => handleFieldChange("invoiceNumber", e.target.innerText)}
              >
                {invoiceData.invoiceNumber}
              </div>
            </div>
            <div className="flex border-b border-gray-800">
              <div className="w-1/2 p-2 border-r border-gray-800 font-semibold">Invoice Date</div>
              <div className="w-1/2 p-2">
                {isStaticMode ? (
                  <div>{invoiceData.invoiceDate}</div>
                ) : (
                  <input
                    type="text"
                    className="w-full focus:outline-none bg-transparent hover:bg-gray-100"
                    value={invoiceData.invoiceDate}
                    onChange={(e) => handleFieldChange("invoiceDate", e.target.value)}
                  />
                )}
              </div>
            </div>
            <div className="flex">
              <div className="w-1/2 p-2 border-r border-gray-800 font-semibold">Dispatch Through</div>
              <div className="w-1/2 p-2">
                {isStaticMode ? (
                  <div>{invoiceData.dispatchThrough}</div>
                ) : (
                  <input
                    type="text"
                    className="w-full focus:outline-none bg-transparent hover:bg-gray-100"
                    value={invoiceData.dispatchThrough}
                    onChange={(e) => handleFieldChange("dispatchThrough", e.target.value)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bill To / Ship To Section */}
      <div className="flex border-b-2 border-gray-800">
        <div className="w-1/2 border-r-2 border-gray-800">
          <div className="bg-gray-900 text-white font-bold text-center py-1">Bill To</div>
          <div className="p-2 space-y-1">
            <div
              contentEditable suppressContentEditableWarning={true}
              className="focus:outline-none hover:bg-gray-100 min-h-[1.5rem] font-bold text-left"
              onBlur={(e) => handleFieldChange("clientName", e.target.innerText)}
            >
              {invoiceData.clientName}
            </div>
            <div
              contentEditable suppressContentEditableWarning={true}
              className="focus:outline-none hover:bg-gray-100 min-h-[1.5rem] text-left whitespace-pre-wrap"
              onBlur={(e) => handleFieldChange("clientAddress", e.target.innerText)}
            >
              {invoiceData.clientAddress}
            </div>
          </div>
        </div>
        <div className="w-1/2">
          <div className="bg-gray-900 text-white font-bold text-center py-1">Ship To</div>
          <div className="p-2 space-y-1">
            <div
              contentEditable suppressContentEditableWarning={true}
              className="focus:outline-none hover:bg-gray-100 min-h-[1.5rem] font-bold text-left"
              onBlur={(e) => handleFieldChange("shipToName", e.target.innerText)}
            >
              {invoiceData.shipToName}
            </div>
            <div
              contentEditable suppressContentEditableWarning={true}
              className="focus:outline-none hover:bg-gray-100 min-h-[1.5rem] text-left whitespace-pre-wrap"
              onBlur={(e) => handleFieldChange("shipToAddress", e.target.innerText)}
            >
              {invoiceData.shipToAddress}
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <table className="w-full border-b-2 border-gray-800">
        <thead>
          <tr className="bg-gray-900 text-white divide-x-2 divide-gray-800 border-b-2 border-gray-800">
            {invoiceData.tableHeaders.map((header, index) => (
              <th key={index} className="px-2 py-1 text-center font-bold">
                {isStaticMode ? (
                  <span>{header}</span>
                ) : (
                  <input
                    type="text"
                    className="w-full text-center bg-transparent focus:outline-none text-white"
                    value={header}
                    onChange={(e) => handleTableHeaderChange(index, e.target.value)}
                  />
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-400">
          {invoiceData.items.map((item, index) => (
            <tr key={index} className="group relative divide-x-2 divide-gray-800 text-center">
              <td className="p-2 align-top w-12">
                {isStaticMode ? (
                  <span>{item.sNo}</span>
                ) : (
                  <input
                    type="text"
                    className="w-full focus:outline-none text-center bg-transparent"
                    value={item.sNo}
                    onChange={(e) => handleItemChange(index, "sNo", e.target.value)}
                  />
                )}
              </td>
              <td className="p-2 align-top text-left w-1/3">
                {isStaticMode ? (
                  <div className="whitespace-pre-wrap">{item.description}</div>
                ) : (
                  <textarea
                    className="w-full focus:outline-none bg-transparent resize-none overflow-hidden placeholder-gray-400"
                    rows={item.description.split('\n').length || 1}
                    value={item.description}
                    placeholder="Enter a description..."
                    onChange={(e) => handleItemChange(index, "description", e.target.value)}
                  />
                )}
              </td>
              <td className="p-2 align-top">
                {isStaticMode ? (
                  <span>{item.hsnSku}</span>
                ) : (
                  <input
                    type="text"
                    className="w-full focus:outline-none text-center bg-transparent"
                    value={item.hsnSku}
                    onChange={(e) => handleItemChange(index, "hsnSku", e.target.value)}
                  />
                )}
              </td>
              <td className="p-2 align-top w-20">
                {isStaticMode ? (
                  <span>{item.quantity}</span>
                ) : (
                  <input
                    type="number"
                    className="w-full focus:outline-none text-center bg-transparent"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                  />
                )}
              </td>
              <td className="p-2 align-top w-24">
                {isStaticMode ? (
                  <span>{item.rate}</span>
                ) : (
                  <input
                    type="number"
                    className="w-full focus:outline-none text-center bg-transparent"
                    value={item.rate}
                    onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                  />
                )}
              </td>
              <td className="p-2 align-top w-20">
                {isStaticMode ? (
                  <span>{item.gstPercentage}</span>
                ) : (
                  <input
                    type="number"
                    className="w-full focus:outline-none text-center bg-transparent"
                    value={item.gstPercentage}
                    onChange={(e) => handleItemChange(index, "gstPercentage", e.target.value)}
                  />
                )}
              </td>
              <td className="p-2 align-top relative font-bold w-32">
                ₹{item.amount.toFixed(2)}
                {!isStaticMode && (
                  <button
                    onClick={() => deleteItem(index)}
                    title="Remove Item"
                    className="absolute top-2 right-2 text-white bg-red-500 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiX size={12} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!isStaticMode && (
        <div className="p-2 border-b-2 border-gray-800">
          <button
            onClick={addNewItem}
            className="flex items-center gap-2 text-blue-600 font-medium"
          >
            <Plus size={16} />
            Add Line Item
          </button>
        </div>
      )}

      {/* Summary Section */}
      <div className="flex border-b-2 border-gray-800">
        <div className="w-2/3 p-4 border-r-2 border-gray-800 flex flex-col justify-between">
          <div>
            <div className="font-bold mb-1">Amount in Words:</div>
            <div
              className="focus:outline-none whitespace-pre-wrap min-h-[3rem] text-gray-700"
            >
              {convertNumberToWords(calculateTotal())}
            </div>
          </div>
        </div>
        <div className="w-1/3">
          <div className="flex border-b border-gray-800">
            <div className="w-1/2 p-2 border-r border-gray-800 font-bold">Taxable Value</div>
            <div className="w-1/2 p-2 text-center font-bold">₹{calculateSubTotal().toFixed(2)}</div>
          </div>
          <div className="flex border-b border-gray-800">
            <div className="w-1/2 p-2 border-r border-gray-800 font-bold">CGST</div>
            <div className="w-1/2 p-2 text-center">
              ₹{calculateCGST().toFixed(2)}
            </div>
          </div>
          <div className="flex border-b border-gray-800">
            <div className="w-1/2 p-2 border-r border-gray-800 font-bold">SGST</div>
            <div className="w-1/2 p-2 text-center">
              ₹{calculateSGST().toFixed(2)}
            </div>
          </div>
          <div className="flex border-b border-gray-800">
            <div className="w-1/2 p-2 border-r border-gray-800 font-bold">IGST</div>
            <div className="w-1/2 p-2 text-center">
              {isStaticMode ? (
                <span>{invoiceData.igst}</span>
              ) : (
                <input
                  type="number"
                  className="w-full text-center focus:outline-none bg-transparent"
                  value={invoiceData.igst}
                  onChange={(e) => handleFieldChange("igst", e.target.value)}
                />
              )}
            </div>
          </div>
          <div className="flex bg-gray-100">
            <div className="w-1/2 p-2 border-r border-gray-800 font-bold">Grand Total</div>
            <div className="w-1/2 p-2 text-center font-bold">₹{calculateTotal().toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Footer / Declaration */}
      <div className="flex p-4 h-40">
        <div className="w-2/3 flex flex-col justify-end">
          <div className="font-bold italic">Declaration:</div>
          <div
            contentEditable suppressContentEditableWarning={true}
            className="focus:outline-none hover:bg-gray-100 whitespace-pre-wrap text-sm max-w-sm"
            onBlur={(e) => handleFieldChange("declaration", e.target.innerText)}
          >
            {invoiceData.declaration}
          </div>
        </div>
        <div className="w-1/3 flex flex-col items-center justify-end relative">
          <div className="font-bold border-t border-gray-800 w-3/4 text-center pt-1 mt-12">
            Authorized Signatory
          </div>
        </div>
      </div>
      <div className="text-center italic pb-4 text-xs font-semibold">
        This is a Computer Generated Invoice
      </div>
    </div>
  );
};

export default InvoiceTemplate1;
